import { describe, expect, it } from 'vitest';
import { lerNumero, numero, pct, preco, reais } from './formato';

describe('reais', () => {
  it('sem centavos quando o valor é inteiro', () => {
    expect(reais(1476)).toBe('R$\u00a01.476');
    expect(reais(145)).toBe('R$\u00a0145');
  });

  it('com centavos quando existem', () => {
    expect(reais(217.5)).toBe('R$\u00a0217,50');
    expect(reais(11.525)).toBe('R$\u00a011,53');
  });
});

describe('numero e pct', () => {
  it('formata em pt-BR', () => {
    expect(numero(1621.4)).toBe('1.621');
    expect(pct(4.84)).toBe('4,84%');
    expect(pct(0.6, 1)).toBe('0,6%');
  });
});

describe('lerNumero', () => {
  it.each([
    ['1', 1],
    ['1,5', 1.5],
    ['1.5', 1.5],
    ['R$ 1.621,00', 1621],
    ['1.621,50', 1621.5],
    [' 2 ', 2],
  ])('"%s" → %s', (texto, esperado) => {
    expect(lerNumero(texto)).toBe(esperado);
  });

  it.each(['', 'abc', '-1', '1,2,3'])('"%s" é inválido', (texto) => {
    expect(lerNumero(texto)).toBeNaN();
  });
});

describe('preco', () => {
  it('sempre com centavos', () => {
    expect(preco(6)).toBe('R$ 6,00');
    expect(preco(114.61)).toBe('R$ 114,61');
  });
});
