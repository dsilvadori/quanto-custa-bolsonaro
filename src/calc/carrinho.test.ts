import { describe, expect, it } from 'vitest';
import { altasSubitem, fatorProduto, totalCarrinho } from './carrinho';
import { fatorCesta } from './cesta';

const periodos = (b: number[], l: number[], ultimoMeses = 9) => [
  ...b.map((pct) => ({ pct, governo: 'bolsonaro', meses: 12 })),
  ...l.map((pct, i) => ({ pct, governo: 'lula', meses: i === l.length - 1 ? ultimoMeses : 12 })),
];

describe('altasSubitem e fatorProduto', () => {
  it('com a alimentação no domicílio, dá o mesmo fator do Simulador 2', () => {
    const a = altasSubitem(periodos([7.84, 18.15, 8.24, 13.23], [-0.52, 8.23, 1.43, 4.44]));
    expect(a.bolsonaroMeses).toBe(48);
    expect(a.atualMeses).toBe(45);
    expect(fatorProduto(a)).toBeCloseTo(fatorCesta({ ...a, ritmo: 1 }), 12);
    expect(a.bolsonaroPct).toBeCloseTo(56.16, 2);
  });

  it('produto que subiu menos no governo Bolsonaro tem fator menor que 1 (ex.: gasolina)', () => {
    const a = altasSubitem(periodos([4.03, -0.19, 47.49, -25.78], [12.09, 9.71, 1.85, 5.56]));
    expect(fatorProduto(a)).toBeLessThan(1);
  });
});

describe('totalCarrinho', () => {
  it('soma preço × quantidade, hoje e no cenário', () => {
    const t = totalCarrinho([
      { preco: 10, fator: 1.5, quantidade: 2 },
      { preco: 4, fator: 1, quantidade: 1 },
    ]);
    expect(t.hoje).toBe(24);
    expect(t.cenario).toBe(34);
    expect(t.diferenca).toBe(10);
    expect(t.pct).toBeCloseTo((34 / 24 - 1) * 100, 10);
  });

  it('item sem preço ou com quantidade zero não entra', () => {
    const t = totalCarrinho([
      { preco: NaN, fator: 2, quantidade: 3 },
      { preco: 5, fator: 2, quantidade: 0 },
      { preco: 5, fator: 2, quantidade: 1 },
    ]);
    expect(t).toEqual({ hoje: 5, cenario: 10, diferenca: 5, pct: 100 });
  });
});
