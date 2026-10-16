// Simulador 1: o que a página mostra, a partir dos dados. Usado no build (resultado padrão)
// e no navegador (quando a pessoa muda os campos). Sem acesso a arquivos nem ao DOM.
import { cenarioPorAno, perdaSalarioMinimo, type Vigencia } from '../calc/salarioMinimo';
import { barras } from '../graficos/barras';
import { numero, reais } from '../formato';

export interface DadosSalario {
  real: Vigencia[];
  anoBase: number;
  inpc: number[];
  bases: { padrao: number; alternativa: number };
}

export type Base = keyof DadosSalario['bases'];

export interface EstadoSalario {
  quantidade: number;
  base: Base;
}

export const ESTADO_PADRAO: EstadoSalario = { quantidade: 1, base: 'padrao' };

export function calcularSalario(d: DadosSalario, e: EstadoSalario) {
  const cenario = cenarioPorAno(d.anoBase, d.bases[e.base], d.inpc);
  const resultado = perdaSalarioMinimo({ quantidade: e.quantidade, real: d.real, cenario });
  const ultimo = resultado.anos[resultado.anos.length - 1];
  return { ...resultado, ultimo };
}

export function quantidadeTexto(q: number): string {
  const n = q.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${n} salário${q === 1 ? '' : 's'} mínimo${q === 1 ? '' : 's'}`;
}

export function graficoSalario(d: DadosSalario, e: EstadoSalario): string {
  const { anos } = calcularSalario(d, e);
  return barras({
    id: 'grafico-salario',
    titulo: 'Salário mínimo de 2023 a 2026: governo Lula e regra do governo do Bolsonaro',
    descricao: anos.map((a) => `${a.ano}: governo Lula ${reais(a.real)}, regra do governo do Bolsonaro ${reais(a.cenario)}`).join('; ') + '.',
    categorias: anos.map((a) => String(a.ano)),
    series: [
      { nome: 'Governo Lula', cor: 'var(--cp-color-on-surface-variant)', valores: anos.map((a) => a.real) },
      { nome: 'Regra do governo do Bolsonaro', cor: 'var(--cp-color-primary)', valores: anos.map((a) => a.cenario) },
    ],
    rotulo: numero,
  });
}

export function frasesSalario(d: DadosSalario, e: EstadoSalario) {
  const r = calcularSalario(d, e);
  const quem = `quem ganha ${quantidadeTexto(e.quantidade)}`;
  return {
    porMes: reais(r.porMes),
    porAno: reais(r.porAno),
    acumulada: reais(r.acumulada),
    resumo: `Com a correção só pela inflação, o mínimo de ${r.ultimo.ano} seria ${reais(r.ultimo.cenario)}, e não ${reais(r.ultimo.real)}.`,
    perda: `${quem.charAt(0).toUpperCase()}${quem.slice(1)} teria ${reais(r.porMes)} a menos por mês.`,
    whatsapp: (url: string) =>
      `Se o salário mínimo seguisse só a inflação, como na regra do governo Bolsonaro, ${quem} teria ${reais(r.porMes)} a menos por mês em ${r.ultimo.ano}. Veja a conta e as fontes: ${url}`,
    cartao: {
      numero: reais(r.porMes),
      linha: `a menos por mês para ${quem}`,
      premissa: `Com a regra do governo Bolsonaro (só a inflação, pelo INPC), o mínimo de ${r.ultimo.ano} seria ${reais(r.ultimo.cenario)}, e não ${reais(r.ultimo.real)}.`,
      fonte: 'Fontes: Diário Oficial e IBGE',
    },
  };
}
