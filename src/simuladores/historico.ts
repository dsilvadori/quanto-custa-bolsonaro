// Salário mínimo de FHC a Lula: quanto o poder de compra mudou em cada governo, com a série do Ipea em reais de hoje.
// Cada governo vai do último mês do governo anterior até o último mês dele (o atual, até o último mês da série).
import { barrasH } from '../graficos/barrasH';
import { colunas } from '../graficos/colunas';
import { COR_BOLSONARO, COR_LULA } from '../graficos/cores';
import { numero, pct, reais } from '../formato';

export interface MesSalario {
  /** AAAA-MM */
  referencia: string;
  nominal: number;
  real: number;
}

const NEUTRO = 'var(--cp-color-on-surface-variant)';

export const GOVERNOS = [
  { nome: 'FHC', periodo: '1995–2002', inicio: '1994-12', fim: '2002-12', cor: NEUTRO },
  { nome: 'Lula', periodo: '2003–2010', inicio: '2002-12', fim: '2010-12', cor: COR_LULA },
  { nome: 'Dilma', periodo: '2011–2016', inicio: '2010-12', fim: '2016-08', cor: NEUTRO },
  { nome: 'Temer', periodo: '2016–2018', inicio: '2016-08', fim: '2018-12', cor: NEUTRO },
  { nome: 'Bolsonaro', periodo: '2019–2022', inicio: '2018-12', fim: '2022-12', cor: COR_BOLSONARO },
  { nome: 'Lula', periodo: '2023 até hoje', inicio: '2022-12', fim: null, cor: COR_LULA },
] as const;

const meses = (de: string, ate: string) => {
  const [a1, m1] = de.split('-').map(Number);
  const [a2, m2] = ate.split('-').map(Number);
  return (a2 - a1) * 12 + (m2 - m1);
};

const sinal = (v: number, casas: number) => (v < 0 ? `−${pct(-v, casas)}` : `+${pct(v, casas)}`);

/** Variação real do mínimo em cada governo: total e ao ano. */
export function variacoesPorGoverno(serie: MesSalario[]) {
  const mes = (ref: string) => {
    const m = serie.find((s) => s.referencia === ref);
    if (!m) throw new Error(`Sem salário mínimo real em ${ref}`);
    return m;
  };
  const ultimo = serie.reduce((a, b) => (b.referencia > a.referencia ? b : a));
  return GOVERNOS.map((g) => {
    const fim = g.fim ?? ultimo.referencia;
    const de = mes(g.inicio).real;
    const ate = mes(fim).real;
    const anos = meses(g.inicio, fim) / 12;
    const total = (ate / de - 1) * 100;
    const aoAno = ((ate / de) ** (1 / anos) - 1) * 100;
    return { ...g, fim, de, ate, anos, total, aoAno };
  });
}

export function graficoGovernos(serie: MesSalario[]): string {
  const v = variacoesPorGoverno(serie);
  return barrasH({
    id: 'sm-governos',
    titulo: 'Aumento real do salário mínimo por ano, em cada governo',
    descricao: v.map((g) => `${g.nome} (${g.periodo}): ${sinal(g.aoAno, 1)} ao ano, ${sinal(g.total, 1)} no governo`).join('. ') + '.',
    linhas: v.map((g) => ({
      rotulo: `${g.nome} (${g.periodo})`,
      valor: g.aoAno,
      texto: `${sinal(g.aoAno, 1)} ao ano`,
      cor: g.cor,
      detalhe: `${reais(g.de)} → ${reais(g.ate)}: ${sinal(g.total, 1)} no governo`,
    })),
  });
}

/** Colunas do gráfico ano a ano: dezembro de cada ano e o último mês da série. Agosto de 2016 só serve para a conta da Dilma. */
export function mesesDoGrafico(serie: MesSalario[]) {
  const ultimo = serie.reduce((a, b) => (b.referencia > a.referencia ? b : a));
  return serie.filter((s) => s.referencia.endsWith('-12') || s.referencia === ultimo.referencia).sort((a, b) => a.referencia.localeCompare(b.referencia));
}

export function graficoAnoAAno(serie: MesSalario[]): string {
  const v = variacoesPorGoverno(serie);
  const pontos = mesesDoGrafico(serie);
  // Governo de cada mês; dezembro de 1994, antes de FHC, fica sem governo.
  const governo = (ref: string) => v.find((g) => g.inicio < ref && ref <= g.fim);
  const grupos = v.map((g) => ({
    nome: g.nome,
    de: pontos.findIndex((p) => governo(p.referencia) === g),
    ate: pontos.findLastIndex((p) => governo(p.referencia) === g),
  }));
  // Valor na primeira coluna e no fim de cada governo. A Dilma saiu em agosto de 2016 e o seu último dezembro é o de 2015,
  // então fica sem rótulo (e assim não encosta no do Temer).
  const finais = new Set([0, ...grupos.filter((g) => g.nome !== 'Dilma').map((g) => g.ate)]);
  return colunas({
    id: 'sm-ano-a-ano',
    titulo: 'Salário mínimo em dezembro de cada ano, em reais de hoje',
    descricao: pontos.map((p) => `${p.referencia.slice(0, 4)}: ${reais(p.real)}`).join('; ') + '.',
    colunas: pontos.map((p, i) => ({
      valor: p.real,
      cor: governo(p.referencia)?.cor ?? NEUTRO,
      rotulo: finais.has(i) ? numero(p.real) : undefined,
    })),
    grupos,
  });
}

export function frasesHistorico(serie: MesSalario[]) {
  const v = variacoesPorGoverno(serie);
  const bolsonaro = v.find((g) => g.nome === 'Bolsonaro')!;
  const lula1 = v[1];
  return {
    bolsonaro: sinal(bolsonaro.total, 1),
    lula1: sinal(lula1.total, 1),
    fhc: sinal(v[0].total, 1),
  };
}
