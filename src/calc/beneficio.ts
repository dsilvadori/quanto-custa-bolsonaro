// Simulador 4. Funções puras.
//
// Hoje só o piso (aposentadoria de 1 mínimo e BPC) acompanha o salário mínimo;
// benefícios acima do piso já são corrigidos só pelo INPC. Por isso a perda só
// existe enquanto o benefício estiver abaixo do piso que teria sido pago.

/** Fração perdida após `anos` com ganho real `ganhoReal` (0,012 = 1,2%): 1 − 1/(1+g)^anos. */
export function perdaPercentual(ganhoReal: number, anos: number): number {
  return 1 - 1 / (1 + ganhoReal) ** anos;
}

export interface AnoProjetado {
  ano: number;
  /** Piso se continuasse ligado ao mínimo (INPC + ganho real), em reais de hoje. */
  pisoVinculado: number;
  /** Benefício com a regra de hoje: nunca abaixo do piso. */
  beneficioVinculado: number;
  /** Benefício desvinculado: só INPC, ou seja, o mesmo valor em reais de hoje. */
  beneficioDesvinculado: number;
  perdaMensal: number;
  /** 12 meses + 13º. */
  perdaAno: number;
}

export interface ResultadoProjecao {
  anos: AnoProjetado[];
  total: number;
}

/**
 * Projeção em reais de hoje (a inflação futura se cancela: os dois lados recebem o INPC).
 * `piso` é o salário mínimo atual; `valor` é o benefício atual (nunca abaixo do piso).
 */
export function projetarDesvinculacao(params: {
  valor: number;
  piso: number;
  ganhoReal: number;
  anoAtual: number;
  ateAno: number;
}): ResultadoProjecao {
  const { piso, ganhoReal, anoAtual, ateAno } = params;
  const valor = Math.max(params.valor, piso);
  const anos: AnoProjetado[] = [];
  for (let ano = anoAtual + 1; ano <= ateAno; ano++) {
    const pisoVinculado = piso * (1 + ganhoReal) ** (ano - anoAtual);
    const beneficioVinculado = Math.max(valor, pisoVinculado);
    const perdaMensal = beneficioVinculado - valor;
    anos.push({ ano, pisoVinculado, beneficioVinculado, beneficioDesvinculado: valor, perdaMensal, perdaAno: perdaMensal * 13 });
  }
  return { anos, total: anos.reduce((s, a) => s + a.perdaAno, 0) };
}

/** Retrospectivo: só quem recebe o piso teria recebido o mínimo do cenário "só INPC". */
export function recebePiso(valor: number, pisoAtual: number): boolean {
  return valor <= pisoAtual;
}
