// Simulador 3: exemplo estático com o relatório mais recente da Abicom.
import { altaPct, efeitoIpca, fracaoFossil, repasse } from '../calc/combustivel';

export interface LinhaCombustivel {
  combustivel: 'gasolina' | 'diesel';
  defasagem: number;
  teorBio: number;
  preco: number;
  peso: number;
}

export const NOMES: Record<LinhaCombustivel['combustivel'], string> = {
  gasolina: 'Gasolina comum',
  diesel: 'Diesel S10',
};

export function calcularCombustivel(l: LinhaCombustivel) {
  const fracao = fracaoFossil(l.teorBio);
  const aumento = repasse(l.defasagem, fracao);
  const alta = altaPct(aumento, l.preco);
  return { fracao, aumento, novoPreco: l.preco + aumento, alta, efeito: efeitoIpca(alta, l.peso) };
}

export function efeitoTotal(linhas: LinhaCombustivel[]): number {
  return linhas.reduce((s, l) => s + calcularCombustivel(l).efeito, 0);
}
