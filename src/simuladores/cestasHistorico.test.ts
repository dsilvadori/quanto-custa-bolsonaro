import { describe, expect, it } from 'vitest';
import { CESTAS_SALARIO_MINIMO } from '../dados';
import { cestasPorAno, cestasPorGoverno, frasesCestas, graficoCestasPorAno } from './cestasHistorico';

describe('Cestas básicas que o mínimo comprava, com DIEESE e Ipea', () => {
  it('série mensal de janeiro de 2003 a setembro de 2026', () => {
    expect(CESTAS_SALARIO_MINIMO[0].referencia).toBe('2003-01');
    expect(CESTAS_SALARIO_MINIMO.at(-1)!.referencia).toBe('2026-09');
    expect(CESTAS_SALARIO_MINIMO).toHaveLength(285);
  });

  it('média de cada ano', () => {
    const porAno = Object.fromEntries(cestasPorAno(CESTAS_SALARIO_MINIMO).map((a) => [a.ano, a.cestas]));
    expect(porAno[2003]).toBeCloseTo(1.56, 2);
    expect(porAno[2018]).toBeCloseTo(2.47, 2);
    expect(porAno[2022]).toBeCloseTo(1.85, 2);
    expect(porAno[2026]).toBeCloseTo(2.15, 2);
  });

  it('do começo ao fim de cada governo', () => {
    const g = cestasPorGoverno(CESTAS_SALARIO_MINIMO);
    const bolsonaro = g.find((x) => x.nome === 'Bolsonaro')!;
    expect(bolsonaro.de).toBeCloseTo(2.49, 2);
    expect(bolsonaro.ate).toBeCloseTo(1.81, 2);
    expect(g.filter((x) => x.variacao < -0.5).map((x) => x.nome)).toEqual(['Bolsonaro']);
    expect(g.at(-1)!.fim).toBe('2026-09');
  });

  it('frases e gráfico', () => {
    expect(frasesCestas(CESTAS_SALARIO_MINIMO)).toMatchObject({ bolsonaroDe: '2,49', bolsonaroAte: '1,81', lula1De: '1,39', lula1Ate: '2,26' });
    expect(graficoCestasPorAno(CESTAS_SALARIO_MINIMO)).toContain('>1,56<');
  });
});
