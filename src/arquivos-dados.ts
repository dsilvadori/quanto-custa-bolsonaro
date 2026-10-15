// Arquivos de /data publicados para download em /dados/<arquivo>, com a descrição usada em /fontes e no JSON-LD Dataset.
import { FONTES } from './fontes';
import { lerCsv } from './calc/csv';

const brutos = import.meta.glob('../data/*.{csv,json}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const DESCRICOES: Record<string, string> = {
  'fontes.json': 'Registro de todas as fontes: órgão, link, cópia arquivada, datas e valor usado.',
  'salario-minimo.csv': 'Salário mínimo de 2019 a 2026, com a data de início de cada valor e o ato que o fixou.',
  'inpc.csv': 'INPC acumulado em 12 meses até novembro, usado para corrigir o mínimo.',
  'parametros.csv': 'Limites do ganho real do salário mínimo previstos em lei.',
  'ipca-alimentacao.csv': 'Alta da alimentação no domicílio (IPCA) por ano e por governo.',
  'cesta-capitais.csv': 'Valor da cesta básica nas 27 capitais.',
  'cesta-produtos.csv': 'Preço por produto e capital (em atualização).',
  'combustivel.csv': 'Diferença para o preço de importação, mistura, preço na bomba e peso no IPCA da gasolina e do diesel.',
};

export interface ArquivoDados {
  nome: string;
  conteudo: string;
  tipo: string;
  descricao: string;
  /** URLs das fontes oficiais citadas no arquivo (para isBasedOn). */
  baseadoEm: string[];
}

const porId = new Map(FONTES.map((f) => [f.id, f.url]));

export const ARQUIVOS: ArquivoDados[] = Object.entries(brutos)
  .map(([caminho, conteudo]) => {
    const nome = caminho.split('/').pop()!;
    const csv = nome.endsWith('.csv');
    const ids = csv
      ? lerCsv(conteudo).flatMap((linha) => Object.entries(linha).filter(([k]) => k.startsWith('fonte')).map(([, v]) => v ?? ''))
      : FONTES.map((f) => f.id);
    return {
      nome,
      conteudo,
      tipo: csv ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
      descricao: DESCRICOES[nome] ?? nome,
      baseadoEm: [...new Set(ids.map((id) => porId.get(id)).filter((u): u is string => Boolean(u)))],
    };
  })
  .sort((a, b) => (a.nome === 'fontes.json' ? -1 : b.nome === 'fontes.json' ? 1 : a.nome.localeCompare(b.nome)));
