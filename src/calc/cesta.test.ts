import { describe, expect, it } from 'vitest';
import { acumular, fatorCesta } from './cesta';
import { CESTA, DADOS_CESTA } from '../dados';
import { ESTADO_PADRAO_CESTA, MEDIA, calcularCesta, frasesCesta, valorHoje } from '../simuladores/cesta';

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

  it('ritmo menor dá fator menor; ritmo zero só desconta a alta real', () => {
    const base = { bolsonaroPct: 56.16, bolsonaroMeses: 48, atualPct: 12.9, atualMeses: 44 };
    expect(fatorCesta({ ...base, ritmo: 0.5 })).toBeLessThan(fatorCesta({ ...base, ritmo: 1 }));
    expect(fatorCesta({ ...base, ritmo: 0 })).toBeCloseTo(1 / 1.129, 10);
  });
});

describe('dados de /data', () => {
  it('períodos, meses e 27 capitais', () => {
    expect(CESTA.bolsonaro.meses).toBe(48);
    expect(CESTA.bolsonaro.pct).toBeCloseTo(56.16, 2);
    expect(CESTA.atual.meses).toBe(45);
    expect(CESTA.atual.ate).toBe('2026-09');
    expect(CESTA.capitais).toHaveLength(27);
  });
});

describe('Simulador 2 em reais', () => {
  it('média das 27 capitais e uma capital', () => {
    expect(valorHoje(DADOS_CESTA, MEDIA)).toBeCloseTo(752.914, 3);
    expect(valorHoje(DADOS_CESTA, 'São Paulo')).toBe(922.51);
  });

  it('cenário = valor de hoje × fator; diferença por mês e por ano', () => {
    const r = calcularCesta(DADOS_CESTA, { capital: 'São Paulo', ritmo: '100' });
    expect(r.cenario).toBeCloseTo(922.51 * r.fator, 10);
    expect(r.porMes).toBeCloseTo(r.cenario - 922.51, 10);
    expect(r.porAno).toBeCloseTo(r.porMes * 12, 10);
  });

  it('texto padrão fala da média e do governo Bolsonaro', () => {
    expect(frasesCesta(DADOS_CESTA, ESTADO_PADRAO_CESTA).resumo).toMatch(
      /^Se a comida subisse como no governo do Bolsonaro, a cesta básica custaria R\$ [\d.,]+ na média das 27 capitais/,
    );
  });

  it('capital inexistente é erro', () => {
    expect(() => valorHoje(DADOS_CESTA, 'Atlântida')).toThrow();
  });
});
