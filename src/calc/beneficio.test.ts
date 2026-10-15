import { describe, expect, it } from 'vitest';
import { perdaPercentual, projetarDesvinculacao, recebePiso } from './beneficio';

describe('perdaPercentual', () => {
  it('1 − 1/(1+g)^anos', () => {
    expect(perdaPercentual(0.025, 4)).toBeCloseTo(1 - 1 / 1.025 ** 4, 12);
    expect(perdaPercentual(0.006, 1)).toBeCloseTo(0.006 / 1.006, 12);
  });

  it('sem ganho real não há perda', () => {
    expect(perdaPercentual(0, 4)).toBe(0);
  });
});

describe('projetarDesvinculacao', () => {
  const base = { piso: 1621, anoAtual: 2026, ateAno: 2030 };

  it('quem recebe o piso perde piso × ((1+g)^n − 1) por mês', () => {
    const r = projetarDesvinculacao({ ...base, valor: 1621, ganhoReal: 0.025 });
    expect(r.anos.map((a) => a.ano)).toEqual([2027, 2028, 2029, 2030]);
    r.anos.forEach((a, i) => {
      expect(a.perdaMensal).toBeCloseTo(1621 * (1.025 ** (i + 1) - 1), 9);
      expect(a.perdaAno).toBeCloseTo(a.perdaMensal * 13, 9);
    });
    expect(r.total).toBeCloseTo(r.anos.reduce((s, a) => s + a.perdaAno, 0), 9);
  });

  it('a perda relativa ao benefício vinculado bate com perdaPercentual', () => {
    const r = projetarDesvinculacao({ ...base, valor: 1621, ganhoReal: 0.012 });
    const ultimo = r.anos[3];
    expect(1 - ultimo.beneficioDesvinculado / ultimo.beneficioVinculado).toBeCloseTo(perdaPercentual(0.012, 4), 12);
  });

  it('benefício bem acima do piso não perde nada até 2030', () => {
    const r = projetarDesvinculacao({ ...base, valor: 3000, ganhoReal: 0.025 });
    expect(r.total).toBe(0);
  });

  it('benefício pouco acima do piso perde quando o piso o ultrapassa', () => {
    const r = projetarDesvinculacao({ ...base, valor: 1650, ganhoReal: 0.025 });
    // 2027: piso vinculado 1.621 × 1,025 = 1.661,53, acima de 1.650
    expect(r.anos[0].perdaMensal).toBeCloseTo(1621 * 1.025 - 1650, 9);
    const r2 = projetarDesvinculacao({ ...base, valor: 1700, ganhoReal: 0.006 });
    // 1.621 × 1,006^n só passa de 1.700 depois de 2030
    expect(r2.total).toBe(0);
  });

  it('valor abaixo do piso é tratado como piso', () => {
    const a = projetarDesvinculacao({ ...base, valor: 1000, ganhoReal: 0.01 });
    const b = projetarDesvinculacao({ ...base, valor: 1621, ganhoReal: 0.01 });
    expect(a).toEqual(b);
  });
});

describe('recebePiso', () => {
  it('só quem recebe o piso entra no cálculo retrospectivo', () => {
    expect(recebePiso(1621, 1621)).toBe(true);
    expect(recebePiso(1800, 1621)).toBe(false);
  });
});
