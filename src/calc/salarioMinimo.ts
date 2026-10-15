// Simulador 1. Funções puras: recebem os dados e não leem arquivos.

export interface Vigencia {
  /** AAAA-MM-DD */
  inicio: string;
  valor: number;
}

/**
 * Regra "só INPC": SM(t) = SM(t−1) × (1 + INPC até novembro de t−1), arredondado ao real.
 * Devolve [base, ano seguinte, ...], um valor por INPC.
 */
export function corrigirSoPeloInpc(base: number, inpcPct: number[]): number[] {
  const serie = [base];
  for (const pct of inpcPct) serie.push(Math.round(serie[serie.length - 1] * (1 + pct / 100)));
  return serie;
}

/** Valor em vigor no mês (1 a 12) do ano, pela última vigência iniciada até o dia 1º. */
export function valorNoMes(vigencias: Vigencia[], ano: number, mes: number): number {
  const dia = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const vigente = [...vigencias].sort((a, b) => a.inicio.localeCompare(b.inicio)).filter((v) => v.inicio <= dia).pop();
  if (!vigente) throw new Error(`Sem salário mínimo em vigor em ${dia}`);
  return vigente.valor;
}

export interface PerdaAno {
  ano: number;
  /** Mínimo real em dezembro. */
  real: number;
  cenario: number;
  /** 12 meses + 13º (pelo valor de dezembro), por salário mínimo. */
  perdaAno: number;
}

export interface ResultadoSalarioMinimo {
  anos: PerdaAno[];
  /** Último ano: perda num mês, já multiplicada pela quantidade de salários. */
  porMes: number;
  /** Último ano: porMes × 13. */
  porAno: number;
  /** Soma de todos os anos (12 meses + 13º em cada), pela quantidade de salários. */
  acumulada: number;
}

/**
 * Perda de quem ganha `quantidade` salários mínimos se o mínimo seguisse só o INPC.
 * `cenario` traz o valor anual do cenário a partir do primeiro ano (ex.: 2023 → base).
 * Num ano com mais de uma vigência real (2023), cada mês usa o valor em vigor.
 */
export function perdaSalarioMinimo(params: {
  quantidade: number;
  real: Vigencia[];
  cenario: Record<number, number>;
}): ResultadoSalarioMinimo {
  const { quantidade, real, cenario } = params;
  const anos = Object.keys(cenario).map(Number).sort((a, b) => a - b);
  const detalhe = anos.map((ano): PerdaAno => {
    let perdaAno = 0;
    for (let mes = 1; mes <= 12; mes++) perdaAno += valorNoMes(real, ano, mes) - cenario[ano];
    const dezembro = valorNoMes(real, ano, 12);
    perdaAno += dezembro - cenario[ano];
    return { ano, real: dezembro, cenario: cenario[ano], perdaAno };
  });
  const ultimo = detalhe[detalhe.length - 1];
  const porMes = quantidade * (ultimo.real - ultimo.cenario);
  return {
    anos: detalhe,
    porMes,
    porAno: porMes * 13,
    acumulada: quantidade * detalhe.reduce((s, a) => s + a.perdaAno, 0),
  };
}

/** Monta o cenário { ano: valor } a partir do ano-base e dos INPCs dos anos seguintes. */
export function cenarioPorAno(anoBase: number, base: number, inpcPct: number[]): Record<number, number> {
  return Object.fromEntries(corrigirSoPeloInpc(base, inpcPct).map((v, i) => [anoBase + i, v]));
}
