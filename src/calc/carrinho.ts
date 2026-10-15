// Simulador 5. Funções puras.
import { acumular, fatorCesta } from './cesta';

/** Altas de um subitem do IPCA por governo, a partir das variações de cada período. */
export function altasSubitem(periodos: { pct: number; governo: string; meses: number }[]) {
  const de = (g: string) => periodos.filter((p) => p.governo === g);
  return {
    bolsonaroPct: acumular(de('bolsonaro').map((p) => p.pct)),
    bolsonaroMeses: de('bolsonaro').reduce((s, p) => s + p.meses, 0),
    atualPct: acumular(de('lula').map((p) => p.pct)),
    atualMeses: de('lula').reduce((s, p) => s + p.meses, 0),
  };
}

/** Quanto o produto estaria mais caro (ou mais barato) se tivesse subido no ritmo do governo Bolsonaro. */
export function fatorProduto(a: ReturnType<typeof altasSubitem>): number {
  return fatorCesta({ ...a, ritmo: 1 });
}

export interface ItemCarrinho {
  preco: number;
  fator: number;
  quantidade: number;
}

/** Totais do carrinho hoje e no ritmo de Bolsonaro. Itens sem preço não entram (ficam "em atualização"). */
export function totalCarrinho(itens: ItemCarrinho[]) {
  const validos = itens.filter((i) => Number.isFinite(i.preco) && i.quantidade > 0);
  const hoje = validos.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const cenario = validos.reduce((s, i) => s + i.preco * i.fator * i.quantidade, 0);
  return { hoje, cenario, diferenca: cenario - hoje, pct: hoje ? (cenario / hoje - 1) * 100 : 0 };
}
