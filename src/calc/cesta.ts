// Simulador 2. Funções puras.

/** Variação acumulada (em %) de uma lista de variações (em %): 7,84 e 18,15 → 27,41. */
export function acumular(pcts: number[]): number {
  return (pcts.reduce((f, p) => f * (1 + p / 100), 1) - 1) * 100;
}

/**
 * Quanto a comida estaria mais cara hoje se, no lugar da alta real do período atual,
 * os preços subissem no ritmo mensal do governo Bolsonaro (`ritmo` = 1 para 100%, 0,5 para 50%).
 * Ritmo mensal = (1 + B)^(1/mesesB) − 1; aplicado por `mesesAtual` meses e dividido pela alta real.
 */
export function fatorCesta(p: {
  bolsonaroPct: number;
  bolsonaroMeses: number;
  atualPct: number;
  atualMeses: number;
  ritmo: number;
}): number {
  const mensal = ((1 + p.bolsonaroPct / 100) ** (1 / p.bolsonaroMeses) - 1) * p.ritmo;
  return (1 + mensal) ** p.atualMeses / (1 + p.atualPct / 100);
}
