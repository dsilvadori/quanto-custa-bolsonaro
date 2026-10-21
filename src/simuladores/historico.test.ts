import { describe, expect, it } from 'vitest';
import { SALARIO_MINIMO_REAL } from '../dados';
import { frasesHistorico, graficoAnoAAno, mesesDoGrafico, variacoesPorGoverno } from './historico';

describe('Salário mínimo de FHC a Lula com a série do Ipea', () => {
  const v = variacoesPorGoverno(SALARIO_MINIMO_REAL);
  const porNome = (nome: string, periodo: string) => v.find((g) => g.nome === nome && g.periodo === periodo)!;

  it('variação real em cada governo', () => {
    expect(porNome('FHC', '1995–2002').total).toBeCloseTo(40.0, 1);
    expect(porNome('Lula', '2003–2010').total).toBeCloseTo(62.4, 1);
    expect(porNome('Dilma', '2011–2016').total).toBeCloseTo(15.7, 1);
    expect(porNome('Temer', '2016–2018').total).toBeCloseTo(2.2, 1);
    expect(porNome('Bolsonaro', '2019–2022').total).toBeCloseTo(-1.2, 1);
    expect(porNome('Lula', '2023 até hoje').total).toBeCloseTo(13.9, 1);
  });

  it('só no governo Bolsonaro o mínimo perdeu poder de compra', () => {
    expect(v.filter((g) => g.total < 0).map((g) => g.nome)).toEqual(['Bolsonaro']);
  });

  it('o governo atual vai até o último mês da série', () => {
    expect(v.at(-1)!.fim).toBe('2026-09');
    expect(porNome('Bolsonaro', '2019–2022').anos).toBe(4);
  });

  it('frases e gráfico', () => {
    expect(frasesHistorico(SALARIO_MINIMO_REAL)).toEqual({ bolsonaro: '−1,2%', lula1: '+62,4%', fhc: '+40,0%' });
    expect(mesesDoGrafico(SALARIO_MINIMO_REAL)).toHaveLength(33);
    expect(graficoAnoAAno(SALARIO_MINIMO_REAL)).toContain('>1.423<');
  });
});
