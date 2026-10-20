// Ícones Lucide (os mesmos do DS), desenhados como SVG no build. Sem imagens para baixar.
import {
  Banana,
  Bean,
  Beef,
  Candy,
  Car,
  Cherry,
  Coffee,
  CookingPot,
  Croissant,
  Droplet,
  Flame,
  Fuel,
  HandCoins,
  HeartCrack,
  Milk,
  Salad,
  Sandwich,
  ShoppingBasket,
  ShoppingCart,
  Sprout,
  Truck,
  Wallet,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import type { PaginaId } from './site';

/** Produto do carrinho → ícone. Batata e manteiga não têm ícone próprio no Lucide: usam ícones genéricos de comida. */
export const ICONE_PRODUTO: Record<string, LucideIcon> = {
  carne: Beef,
  leite: Milk,
  feijao: Bean,
  arroz: CookingPot,
  'farinha-trigo': Wheat,
  'farinha-mandioca': Sprout,
  batata: Salad,
  tomate: Cherry,
  pao: Croissant,
  cafe: Coffee,
  banana: Banana,
  acucar: Candy,
  oleo: Droplet,
  manteiga: Sandwich,
  gas: Flame,
  gasolina: Fuel,
};

export const ICONE_PAGINA: Partial<Record<PaginaId, LucideIcon>> = {
  salarioMinimo: Wallet,
  cestaBasica: ShoppingBasket,
  carrinho: ShoppingCart,
  combustivel: Fuel,
  aposentadoriaBpc: HandCoins,
  covid: HeartCrack,
};

export const ICONE_VEICULO: Record<string, LucideIcon> = { carro: Car, caminhao: Truck };

/** Ícone num círculo com o fundo suave da cor primária. Decorativo: o texto ao lado já diz o que é. */
export function Selo({ icone: Icone, tamanho = 'md' }: { icone?: LucideIcon; tamanho?: 'md' | 'lg' }) {
  if (!Icone) return null;
  return (
    <span className={`selo-icone selo-icone--${tamanho}`} aria-hidden="true">
      <Icone />
    </span>
  );
}
