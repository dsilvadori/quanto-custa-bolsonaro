import { describe, expect, it } from 'vitest';
import { cenarioPorAno, corrigirSoPeloInpc, perdaSalarioMinimo, valorNoMes } from './salarioMinimo';
import { CENARIO_SM, SALARIO_MINIMO } from '../dados';

const inpc = CENARIO_SM.inpc.map((i) => i.pct);

describe('corrigirSoPeloInpc (dados de /data)', () => {
  it('usa os INPCs de nov/23, nov/24 e nov/25', () => {
    expect(inpc).toEqual([3.85, 4.84, 4.18]);
  });

  it('base R$ 1.302 → 1.352 · 1.417 · 1.476 (2026 = 1.476)', () => {
    expect(CENARIO_SM.bases.padrao.valor).toBe(1302);
    expect(corrigirSoPeloInpc(1302, inpc)).toEqual([1302, 1352, 1417, 1476]);
  });

  it('base R$ 1.320 → 1.371 · 1.437 · 1.497 (2026 = 1.497)', () => {
    expect(CENARIO_SM.bases.alternativa.valor).toBe(1320);
    expect(corrigirSoPeloInpc(1320, inpc)).toEqual([1320, 1371, 1437, 1497]);
  });

  it('arredonda ao real em cada ano, não só no fim', () => {
    expect(corrigirSoPeloInpc(100, [0.4, 0.4])).toEqual([100, 100, 100]);
  });
});

describe('valorNoMes', () => {
  it('2023 tem duas vigências: 1.302 até abril e 1.320 a partir de maio', () => {
    expect(valorNoMes(SALARIO_MINIMO, 2023, 4)).toBe(1302);
    expect(valorNoMes(SALARIO_MINIMO, 2023, 5)).toBe(1320);
  });

  it('2020: 1.039 em janeiro (MP 916) e 1.045 a partir de fevereiro (MP 919)', () => {
    expect(valorNoMes(SALARIO_MINIMO, 2020, 1)).toBe(1039);
    expect(valorNoMes(SALARIO_MINIMO, 2020, 2)).toBe(1045);
  });

  it('falha antes da primeira vigência', () => {
    expect(() => valorNoMes(SALARIO_MINIMO, 2018, 12)).toThrow();
  });
});

describe('perdaSalarioMinimo', () => {
  const cenario = cenarioPorAno(2023, 1302, inpc);

  it('1 salário mínimo: R$ 145 por mês em 2026 e R$ 1.885 no ano (×13)', () => {
    const r = perdaSalarioMinimo({ quantidade: 1, real: SALARIO_MINIMO, cenario });
    expect(r.porMes).toBe(145);
    expect(r.porAno).toBe(1885);
  });

  it('acumulado 2023–2026 com 13º pelo valor de dezembro', () => {
    const r = perdaSalarioMinimo({ quantidade: 1, real: SALARIO_MINIMO, cenario });
    // 2023: 8 meses × 18 + 13º 18 = 162; 2024: 60 × 13; 2025: 101 × 13; 2026: 145 × 13
    expect(r.anos.map((a) => a.perdaAno)).toEqual([162, 780, 1313, 1885]);
    expect(r.acumulada).toBe(162 + 780 + 1313 + 1885);
  });

  it('escala com a quantidade de salários', () => {
    const r = perdaSalarioMinimo({ quantidade: 2.5, real: SALARIO_MINIMO, cenario });
    expect(r.porMes).toBe(362.5);
    expect(r.acumulada).toBe(2.5 * 4140);
  });

  it('base R$ 1.320: em 2023 o cenário pagaria mais de janeiro a abril', () => {
    const r = perdaSalarioMinimo({ quantidade: 1, real: SALARIO_MINIMO, cenario: cenarioPorAno(2023, 1320, inpc) });
    expect(r.anos[0].perdaAno).toBe(-18 * 4);
    expect(r.porMes).toBe(1621 - 1497);
  });
});
