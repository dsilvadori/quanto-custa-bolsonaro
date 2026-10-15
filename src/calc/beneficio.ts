// Simulador 4. Funções puras.
//
// Hoje o piso (BPC e aposentadoria de 1 salário mínimo) acompanha o mínimo. Desvincular é
// passar a corrigir o piso só pela inflação (INPC do ano anterior), como já acontece com os
// benefícios acima do piso. O BPC tem 12 pagamentos por ano; a aposentadoria tem também o 13º.
import { valorNoMes, type Vigencia } from './salarioMinimo';

export type Pagamentos = 12 | 13;

/** Fração perdida após `anos` com ganho real `ganhoReal` (0,012 = 1,2%): 1 − 1/(1+g)^anos. */
export function perdaPercentual(ganhoReal: number, anos: number): number {
  return 1 - 1 / (1 + ganhoReal) ** anos;
}

const centavos = (v: number) => Math.round(v * 100) / 100;

export interface AnoDesvinculado {
  ano: number;
  /** Benefício pago de verdade em dezembro (= mínimo). */
  real: number;
  /** Benefício só com a inflação. */
  desvinculado: number;
  /** Diferença em dezembro. */
  perdaMensal: number;
  /** Soma do ano: mês a mês (2023 teve dois valores do mínimo) e o 13º, se houver. */
  perdaAno: number;
}

/**
 * Retrospectivo: o piso parte do mínimo de `anoBase` e, a cada janeiro, sobe só pelo INPC
 * do ano anterior (arredondado ao centavo). Compara com o mínimo pago de verdade.
 */
export function desvincularDesde(params: {
  real: Vigencia[];
  anoBase: number;
  /** INPC acumulado no ano anterior, em %, por ano em que é aplicado: { 2023: 5.93, ... } */
  inpcPorAno: Record<number, number>;
  pagamentos: Pagamentos;
}): { anos: AnoDesvinculado[]; porMes: number; total: number } {
  const { real, anoBase, inpcPorAno, pagamentos } = params;
  let desvinculado = valorNoMes(real, anoBase, 12);
  const anos = Object.keys(inpcPorAno)
    .map(Number)
    .sort((a, b) => a - b)
    .map((ano): AnoDesvinculado => {
      desvinculado = centavos(desvinculado * (1 + inpcPorAno[ano] / 100));
      let perdaAno = 0;
      for (let mes = 1; mes <= 12; mes++) perdaAno += valorNoMes(real, ano, mes) - desvinculado;
      const dezembro = valorNoMes(real, ano, 12);
      if (pagamentos === 13) perdaAno += dezembro - desvinculado;
      return { ano, real: dezembro, desvinculado, perdaMensal: centavos(dezembro - desvinculado), perdaAno: centavos(perdaAno) };
    });
  return {
    anos,
    porMes: anos[anos.length - 1].perdaMensal,
    total: centavos(anos.reduce((s, a) => s + a.perdaAno, 0)),
  };
}

export interface AnoProjetado {
  ano: number;
  /** Piso ligado ao mínimo (inflação + ganho real), em reais de hoje. */
  vinculado: number;
  /** Piso desvinculado: só inflação, ou seja, o mesmo valor em reais de hoje. */
  desvinculado: number;
  perdaMensal: number;
  perdaAno: number;
}

/** Projeção em reais de hoje (a inflação futura entra dos dois lados e se cancela). */
export function projetarDesvinculacao(params: {
  piso: number;
  ganhoReal: number;
  anoAtual: number;
  ateAno: number;
  pagamentos: Pagamentos;
}): { anos: AnoProjetado[]; total: number } {
  const { piso, ganhoReal, anoAtual, ateAno, pagamentos } = params;
  const anos: AnoProjetado[] = [];
  for (let ano = anoAtual + 1; ano <= ateAno; ano++) {
    const vinculado = piso * (1 + ganhoReal) ** (ano - anoAtual);
    const perdaMensal = vinculado - piso;
    anos.push({ ano, vinculado, desvinculado: piso, perdaMensal, perdaAno: perdaMensal * pagamentos });
  }
  return { anos, total: anos.reduce((s, a) => s + a.perdaAno, 0) };
}
