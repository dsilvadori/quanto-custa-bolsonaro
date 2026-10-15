import { describe, expect, it } from 'vitest';
import { desvincularDesde, perdaPercentual, poderDeCompra, projetarDesvinculacao } from './beneficio';
import { SALARIO_MINIMO } from '../dados';

const inpcPorAno = { 2023: 5.93, 2024: 3.71, 2025: 4.77, 2026: 3.9 };

describe('desvincularDesde (BPC e piso só com a inflação desde 2023)', () => {
  it('valores ano a ano a partir de R$ 1.212 (2022), arredondados ao centavo', () => {
    const r = desvincularDesde({ real: SALARIO_MINIMO, anoBase: 2022, inpcPorAno, pagamentos: 12 });
    expect(r.anos.map((a) => a.desvinculado)).toEqual([1283.87, 1331.5, 1395.01, 1449.42]);
    expect(r.anos.map((a) => a.real)).toEqual([1320, 1412, 1518, 1621]);
    expect(r.porMes).toBe(171.58);
  });

  it('BPC: 12 pagamentos; 2023 com 1.302 até abril e 1.320 a partir de maio', () => {
    const r = desvincularDesde({ real: SALARIO_MINIMO, anoBase: 2022, inpcPorAno, pagamentos: 12 });
    // 2023: 4 × 18,13 + 8 × 36,13; depois 12 × diferença de cada ano
    expect(r.anos.map((a) => a.perdaAno)).toEqual([361.56, 966, 1475.88, 2058.96]);
    expect(r.total).toBe(4862.4);
  });

  it('aposentadoria de 1 mínimo: soma também o 13º pelo valor de dezembro', () => {
    const r = desvincularDesde({ real: SALARIO_MINIMO, anoBase: 2022, inpcPorAno, pagamentos: 13 });
    expect(r.total).toBe(5273.6); // 4.862,40 + 13º: 36,13 + 80,50 + 122,99 + 171,58
  });
});

describe('perdaPercentual', () => {
  it('1 − 1/(1+g)^anos', () => {
    expect(perdaPercentual(0.025, 4)).toBeCloseTo(1 - 1 / 1.025 ** 4, 12);
    expect(perdaPercentual(0, 4)).toBe(0);
  });
});

describe('poderDeCompra', () => {
  it('desvinculado compra sempre o mesmo; a perda % cresce com o ganho real do mínimo', () => {
    const p = projetarDesvinculacao({ piso: 1621, ganhoReal: 0.025, anoAtual: 2026, ateAno: 2030, pagamentos: 12 });
    const c = poderDeCompra(p, 750);
    expect(new Set(c.anos.map((a) => a.cestasDesvinculado))).toEqual(new Set([1621 / 750]));
    c.anos.forEach((a, i) => expect(a.perdaPct).toBeCloseTo(perdaPercentual(0.025, i + 1) * 100, 9));
    expect(c.cestasPerdidas).toBeCloseTo(p.total / 750, 9);
  });
});

describe('projetarDesvinculacao', () => {
  const base = { piso: 1621, anoAtual: 2026, ateAno: 2030 };

  it('perda mensal = piso × ((1+g)^n − 1); por ano × pagamentos', () => {
    const bpc = projetarDesvinculacao({ ...base, ganhoReal: 0.025, pagamentos: 12 });
    const apos = projetarDesvinculacao({ ...base, ganhoReal: 0.025, pagamentos: 13 });
    expect(bpc.anos.map((a) => a.ano)).toEqual([2027, 2028, 2029, 2030]);
    bpc.anos.forEach((a, i) => {
      expect(a.perdaMensal).toBeCloseTo(1621 * (1.025 ** (i + 1) - 1), 9);
      expect(a.perdaAno).toBeCloseTo(a.perdaMensal * 12, 9);
    });
    expect(apos.total).toBeCloseTo((bpc.total * 13) / 12, 9);
  });

  it('a perda relativa bate com perdaPercentual', () => {
    const ultimo = projetarDesvinculacao({ ...base, ganhoReal: 0.012, pagamentos: 12 }).anos[3];
    expect(1 - ultimo.desvinculado / ultimo.vinculado).toBeCloseTo(perdaPercentual(0.012, 4), 12);
  });
});
