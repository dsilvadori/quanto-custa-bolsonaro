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
  /** Piso ligado ao mínimo: inflação + ganho real. */
  vinculado: number;
  /** Piso desvinculado: só inflação. */
  desvinculado: number;
  perdaMensal: number;
  perdaAno: number;
}

/**
 * Projeção em reais de cada ano: os dois lados sobem pela `inflacao` (0,046 = 4,6% ao ano) e o
 * ligado ao mínimo ganha também o `ganhoReal`. Com `inflacao` 0, fica em reais de hoje.
 */
export function projetarDesvinculacao(params: {
  piso: number;
  ganhoReal: number;
  inflacao?: number;
  anoAtual: number;
  ateAno: number;
  pagamentos: Pagamentos;
}): { anos: AnoProjetado[]; total: number } {
  const { piso, ganhoReal, inflacao = 0, anoAtual, ateAno, pagamentos } = params;
  const anos: AnoProjetado[] = [];
  for (let ano = anoAtual + 1; ano <= ateAno; ano++) {
    const desvinculado = piso * (1 + inflacao) ** (ano - anoAtual);
    const vinculado = desvinculado * (1 + ganhoReal) ** (ano - anoAtual);
    const perdaMensal = vinculado - desvinculado;
    anos.push({ ano, vinculado, desvinculado, perdaMensal, perdaAno: perdaMensal * pagamentos });
  }
  return { anos, total: anos.reduce((s, a) => s + a.perdaAno, 0) };
}

export interface AnoPoderDeCompra {
  ano: number;
  /** Quanto o benefício desvinculado compra a menos que o ligado ao mínimo, em %. */
  perdaPct: number;
  /** Cestas básicas por mês, supondo que a cesta sobe junto com a inflação. */
  cestasVinculado: number;
  cestasDesvinculado: number;
}

/**
 * Poder de compra da projeção: sem aumento real, o benefício compra sempre o mesmo;
 * a perda aparece frente ao que compraria ligado ao mínimo. `cesta` em reais de hoje,
 * subindo pela mesma `inflacao` da projeção.
 */
export function poderDeCompra(
  projecao: { anos: AnoProjetado[]; total: number },
  cesta: number,
  params: { anoAtual: number; pagamentos: Pagamentos; inflacao?: number },
): { anos: AnoPoderDeCompra[]; cestasPerdidas: number } {
  const { anoAtual, pagamentos, inflacao = 0 } = params;
  const cestaNoAno = (ano: number) => cesta * (1 + inflacao) ** (ano - anoAtual);
  return {
    anos: projecao.anos.map((a) => ({
      ano: a.ano,
      perdaPct: (1 - a.desvinculado / a.vinculado) * 100,
      cestasVinculado: a.vinculado / cestaNoAno(a.ano),
      cestasDesvinculado: a.desvinculado / cestaNoAno(a.ano),
    })),
    cestasPerdidas: projecao.anos.reduce((s, a) => s + (a.perdaMensal * pagamentos) / cestaNoAno(a.ano), 0),
  };
}

export interface AnoCestas {
  ano: number;
  /** Valor da cesta no ano em cada cenário. */
  cestaVinculado: number;
  cestaDesvinculado: number;
  /** Cestas por mês que o benefício compraria. */
  vinculado: number;
  desvinculado: number;
}

/**
 * Cestas básicas por mês em dois cenários: o benefício ligado ao mínimo com a cesta subindo
 * `altaVinculado` ao ano, e o desvinculado com a cesta subindo `altaDesvinculado` (0,118 = 11,8%).
 * `cesta` em reais de hoje. As cestas perdidas somam a diferença entre os cenários em todos os pagamentos.
 */
export function cestasComAlta(
  projecao: { anos: AnoProjetado[] },
  params: { piso: number; cesta: number; altaVinculado: number; altaDesvinculado: number; anoAtual: number; pagamentos: Pagamentos },
): { hoje: number; anos: AnoCestas[]; perdidas: number } {
  const { piso, cesta, altaVinculado, altaDesvinculado, anoAtual, pagamentos } = params;
  const anos = projecao.anos.map((a): AnoCestas => {
    const n = a.ano - anoAtual;
    const cestaVinculado = cesta * (1 + altaVinculado) ** n;
    const cestaDesvinculado = cesta * (1 + altaDesvinculado) ** n;
    return { ano: a.ano, cestaVinculado, cestaDesvinculado, vinculado: a.vinculado / cestaVinculado, desvinculado: a.desvinculado / cestaDesvinculado };
  });
  return { hoje: piso / cesta, anos, perdidas: anos.reduce((s, a) => s + (a.vinculado - a.desvinculado) * pagamentos, 0) };
}
