import { describe, expect, it } from 'vitest';
import { acumular, fatorCesta, horasCenario, horasTexto } from './cesta';
import { CESTA } from '../dados';

describe('acumular', () => {
  it('2019–2022 (acumulados anuais do IBGE) dá 56,16%', () => {
    expect(acumular([7.84, 18.15, 8.24, 13.23])).toBeCloseTo(56.16, 2);
  });
});

describe('fatorCesta: conferência com os números do roteiro', () => {
  it('56,16% em 48 meses aplicado por 44 meses e dividido por 1,129 → ≈ 1,33', () => {
    const f = fatorCesta({ bolsonaroPct: 56.16, bolsonaroMeses: 48, atualPct: 12.9, atualMeses: 44, ritmo: 1 });
    expect(f).toBeCloseTo(1.333, 3);
  });

  it('cenário a partir de 100h24 com o mínimo de 1.476 → ≈ 147 h', () => {
    const f = fatorCesta({ bolsonaroPct: 56.16, bolsonaroMeses: 48, atualPct: 12.9, atualMeses: 44, ritmo: 1 });
    expect(horasCenario(100 + 24 / 60, f, 1621, 1476)).toBeCloseTo(147, 0);
  });

  it('ritmo menor dá fator menor; ritmo zero só desconta a alta real', () => {
    const base = { bolsonaroPct: 56.16, bolsonaroMeses: 48, atualPct: 12.9, atualMeses: 44 };
    const f100 = fatorCesta({ ...base, ritmo: 1 });
    const f50 = fatorCesta({ ...base, ritmo: 0.5 });
    expect(f50).toBeLessThan(f100);
    expect(fatorCesta({ ...base, ritmo: 0 })).toBeCloseTo(1 / 1.129, 10);
  });
});

describe('dados de /data', () => {
  it('períodos e meses', () => {
    expect(CESTA.bolsonaro.meses).toBe(48);
    expect(CESTA.bolsonaro.pct).toBeCloseTo(56.16, 2);
    expect(CESTA.atual.meses).toBe(45);
    expect(CESTA.atual.ate).toBe('2026-09');
    expect(CESTA.horasHoje).toBeCloseTo(102 + 11 / 60, 10);
  });
});

describe('horasTexto', () => {
  it.each([
    [100.4, '100h24'],
    [102 + 11 / 60, '102h11'],
    [146.999, '147h00'],
    [8, '8h00'],
  ])('%s → %s', (h, t) => {
    expect(horasTexto(h)).toBe(t);
  });
});
