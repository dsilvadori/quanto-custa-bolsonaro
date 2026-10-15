// Lê os CSVs de /data no build. As páginas recebem daqui os números e o id da fonte de cada um.
import salarioMinimoCsv from '../data/salario-minimo.csv?raw';
import inpcCsv from '../data/inpc.csv?raw';
import { lerCsv } from './calc/csv';
import type { Vigencia } from './calc/salarioMinimo';

export interface VigenciaComFonte extends Vigencia {
  fonte: string;
}

export const SALARIO_MINIMO: VigenciaComFonte[] = lerCsv(salarioMinimoCsv).map((l) => ({
  inicio: l.vigencia_inicio!,
  valor: Number(l.valor),
  fonte: l.fonte!,
}));

export interface InpcComFonte {
  referencia: string;
  pct: number;
  aplicadoNoMinimoDe: number;
  fonte: string;
}

export const INPC: InpcComFonte[] = lerCsv(inpcCsv).map((l) => ({
  referencia: l.referencia!,
  pct: Number(l.variacao_12m_pct),
  aplicadoNoMinimoDe: Number(l.aplicado_no_minimo_de),
  fonte: l.fonte!,
}));

function vigencia(inicio: string): VigenciaComFonte {
  const v = SALARIO_MINIMO.find((s) => s.inicio === inicio);
  if (!v) throw new Error(`Sem salário mínimo com vigência em ${inicio}`);
  return v;
}

/** Simulador 1: o cenário parte de 2023 e aplica o INPC de 2024 em diante. */
export const CENARIO_SM = {
  anoBase: 2023,
  bases: {
    /** Valor de 2023 fixado pelo governo Bolsonaro (MP 1.143/2022). */
    padrao: vigencia('2023-01-01'),
    /** Valor de 2023 a partir de maio (MP 1.172/2023). */
    alternativa: vigencia('2023-05-01'),
  },
  inpc: INPC.filter((i) => i.aplicadoNoMinimoDe > 2023).sort((a, b) => a.aplicadoNoMinimoDe - b.aplicadoNoMinimoDe),
} as const;

/** Salário mínimo em vigor hoje (última vigência). */
export const MINIMO_ATUAL = SALARIO_MINIMO.reduce((a, b) => (b.inicio > a.inicio ? b : a));
