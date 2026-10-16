import { describe, expect, it } from 'vitest';
import { altaPct, efeitoIpca, fracaoFossil, repasse } from './combustivel';

describe('combustível', () => {
  it('parte fóssil a partir do teor de biocombustível', () => {
    expect(fracaoFossil(32)).toBeCloseTo(0.68, 10);
    expect(fracaoFossil(15)).toBeCloseTo(0.85, 10);
  });

  it('exemplo do roteiro: diesel +R$ 2,18 × 0,85 e gasolina +R$ 1,26 × 0,70', () => {
    expect(repasse(2.18, 0.85)).toBeCloseTo(1.853, 3);
    expect(repasse(1.26, 0.7)).toBeCloseTo(0.882, 3);
  });

  it('alta % e efeito no IPCA', () => {
    const alta = altaPct(0.3332, 6.54);
    expect(alta).toBeCloseTo(5.095, 3);
    expect(efeitoIpca(alta, 5.1285)).toBeCloseTo(0.2613, 4);
  });
});

describe('tanqueCheio', () => {
  it('litros × preço hoje e com o aumento do PPI', async () => {
    const { tanqueCheio, calcularCombustivel } = await import('../simuladores/combustivel');
    const l = { combustivel: 'diesel' as const, defasagem: 3.24, teorBio: 15, preco: 7.36, peso: 0.2562 };
    const t = tanqueCheio(l, 300);
    const aumento = calcularCombustivel(l).aumento;
    expect(t.hoje).toBeCloseTo(300 * 7.36, 10);
    expect(t.diferenca).toBeCloseTo(300 * aumento, 10);
    expect(t.comPpi).toBeCloseTo(t.hoje + t.diferenca, 10);
  });
});

describe('gastoMensal (motorista de aplicativo)', () => {
  it('5.000 km a 10 km/L = 500 litros; hoje, com o PPI e diferença por mês e por ano', async () => {
    const { gastoMensal, calcularCombustivel } = await import('../simuladores/combustivel');
    const l = { combustivel: 'gasolina' as const, defasagem: 0.66, teorBio: 32, preco: 6.54, peso: 5.1285 };
    const g = gastoMensal(l, 5000, 10);
    expect(g.litros).toBe(500);
    expect(g.hoje).toBeCloseTo(3270, 10);
    expect(g.diferenca).toBeCloseTo(500 * calcularCombustivel(l).aumento, 10);
    expect(g.porAno).toBeCloseTo(g.diferenca * 12, 10);
  });
});
