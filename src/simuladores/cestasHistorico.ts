// Quantas cestas básicas o salário mínimo comprava, de 2003 até hoje: mínimo em vigor ÷ custo médio da cesta do DIEESE
// no mesmo mês. Por ano, a média dos meses; por governo, o primeiro e o último mês do mandato.
import { barrasH } from '../graficos/barrasH';
import { colunas } from '../graficos/colunas';
import { COR_BOLSONARO, COR_LULA } from '../graficos/cores';

export interface MesCesta {
  /** AAAA-MM */
  referencia: string;
  salario: number;
  cesta: number;
}

/** Governos do PT na cor principal; Temer e Bolsonaro em azul, como no resto do site. */
export const GOVERNOS_CESTAS = [
  { nome: 'Lula', periodo: '2003–2010', inicio: '2003-01', fim: '2010-12', anos: [2003, 2010], cor: COR_LULA },
  // Dilma governou até agosto de 2016: o ano de 2016 fica com ela no gráfico por ano.
  { nome: 'Dilma', periodo: '2011–2016', inicio: '2011-01', fim: '2016-08', anos: [2011, 2016], cor: COR_LULA },
  { nome: 'Temer', periodo: '2016–2018', inicio: '2016-09', fim: '2018-12', anos: [2017, 2018], cor: COR_BOLSONARO },
  { nome: 'Bolsonaro', periodo: '2019–2022', inicio: '2019-01', fim: '2022-12', anos: [2019, 2022], cor: COR_BOLSONARO },
  { nome: 'Lula', periodo: '2023 até hoje', inicio: '2023-01', fim: null, anos: [2023, 9999], cor: COR_LULA },
] as const;

/** 2,49 (duas casas, vírgula). */
export const cestas = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const razao = (m: MesCesta) => m.salario / m.cesta;

/** Média do ano (o ano corrente, até o último mês da série). */
export function cestasPorAno(serie: MesCesta[]) {
  const anos = new Map<number, number[]>();
  for (const m of serie) {
    const ano = Number(m.referencia.slice(0, 4));
    anos.set(ano, [...(anos.get(ano) ?? []), razao(m)]);
  }
  return [...anos].sort(([a], [b]) => a - b).map(([ano, v]) => ({ ano, cestas: v.reduce((s, x) => s + x, 0) / v.length, meses: v.length }));
}

/** Cestas no primeiro e no último mês de cada governo. */
export function cestasPorGoverno(serie: MesCesta[]) {
  const ultimo = serie.reduce((a, b) => (b.referencia > a.referencia ? b : a));
  const mes = (ref: string) => {
    const m = serie.find((s) => s.referencia === ref);
    if (!m) throw new Error(`Sem cesta e salário mínimo em ${ref}`);
    return m;
  };
  return GOVERNOS_CESTAS.map((g) => {
    const fim = g.fim ?? ultimo.referencia;
    const de = razao(mes(g.inicio));
    const ate = razao(mes(fim));
    return { ...g, fim, de, ate, variacao: ate - de };
  });
}

const governoDoAno = (ano: number) => GOVERNOS_CESTAS.find((g) => ano >= g.anos[0] && ano <= g.anos[1])!;

export function graficoCestasPorAno(serie: MesCesta[]): string {
  const anos = cestasPorAno(serie);
  const grupos = GOVERNOS_CESTAS.map((g) => ({
    nome: g.nome,
    de: anos.findIndex((a) => governoDoAno(a.ano) === g),
    ate: anos.findLastIndex((a) => governoDoAno(a.ano) === g),
  }));
  const comRotulo = new Set([0, ...grupos.map((g) => g.ate)]);
  return colunas({
    id: 'sm-cestas-ano',
    titulo: 'Cestas básicas que o salário mínimo comprava, média de cada ano',
    descricao: anos.map((a) => `${a.ano}: ${cestas(a.cestas)} cestas`).join('; ') + '.',
    colunas: anos.map((a, i) => ({
      valor: a.cestas,
      cor: governoDoAno(a.ano).cor,
      rotulo: comRotulo.has(i) ? cestas(a.cestas) : undefined,
    })),
    grupos,
  });
}

export function graficoCestasPorGoverno(serie: MesCesta[]): string {
  const g = cestasPorGoverno(serie);
  return barrasH({
    id: 'sm-cestas-governo',
    titulo: 'Quantas cestas básicas o mínimo comprava no fim de cada governo',
    descricao: g.map((x) => `${x.nome} (${x.periodo}): ${cestas(x.ate)} cestas no fim, ${cestas(x.de)} no começo`).join('. ') + '.',
    linhas: g.map((x) => ({
      rotulo: `${x.nome} (${x.periodo})`,
      valor: x.ate,
      texto: `${cestas(x.ate)} cestas`,
      cor: x.cor,
      detalhe: `no começo do governo: ${cestas(x.de)} cestas`,
    })),
  });
}

export function frasesCestas(serie: MesCesta[]) {
  const g = cestasPorGoverno(serie);
  const bolsonaro = g.find((x) => x.nome === 'Bolsonaro')!;
  const lula1 = g[0];
  const atual = g[g.length - 1];
  return {
    bolsonaroDe: cestas(bolsonaro.de),
    bolsonaroAte: cestas(bolsonaro.ate),
    bolsonaroPerda: cestas(-bolsonaro.variacao),
    lula1De: cestas(lula1.de),
    lula1Ate: cestas(lula1.ate),
    atualDe: cestas(atual.de),
    atualAte: cestas(atual.ate),
  };
}
