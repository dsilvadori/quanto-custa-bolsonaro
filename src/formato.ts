// Formatação usada no build e no navegador.

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const centavos = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1476 → "R$ 1.476"; 217.5 → "R$ 217,50". Centavos só quando existem. Espaço não separável: o R$ nunca fica sozinho no fim da linha. */
export function reais(valor: number): string {
  const v = Math.round(valor * 100) / 100;
  return `R$\u00a0${Number.isInteger(v) ? inteiro.format(v) : centavos.format(v)}`;
}

/** 1476 → "1.476" (rótulos de gráfico). */
export function numero(valor: number): string {
  return inteiro.format(Math.round(valor));
}

/** 4.84 → "4,84%"; casas fixas. */
export function pct(valor: number, casas = 2): string {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}

/** "1,5" ou "1.5" → 1.5; texto inválido → NaN. Aceita "R$ 1.621,00". */
export function lerNumero(texto: string): number {
  const limpo = texto.replace(/[R$\s]/g, '');
  if (limpo === '') return NaN;
  // Com vírgula, o ponto é separador de milhar; sem vírgula, o ponto é decimal ("1.5").
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  return /^\d+(\.\d+)?$/.test(normal) ? Number(normal) : NaN;
}
