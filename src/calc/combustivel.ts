// Simulador 3. Funções puras.
// ICMS e PIS/Cofins são cobrados em reais por litro: não aumentam com o preço e não entram na conta.

/** Parte fóssil do combustível: gasolina com 32% de etanol → 0,68. */
export function fracaoFossil(teorBioPct: number): number {
  return 1 - teorBioPct / 100;
}

/** Aumento na bomba = defasagem do derivado de petróleo × parte fóssil do litro. */
export function repasse(defasagem: number, fracao: number): number {
  return defasagem * fracao;
}

/** Alta percentual sobre o preço médio de hoje. */
export function altaPct(repasseRs: number, precoBomba: number): number {
  return (repasseRs / precoBomba) * 100;
}

/** Efeito direto no IPCA, em pontos percentuais: alta % × peso no IPCA (%). */
export function efeitoIpca(alta: number, pesoPct: number): number {
  return (alta * pesoPct) / 100;
}
