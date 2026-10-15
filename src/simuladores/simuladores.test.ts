import { describe, expect, it } from 'vitest';
import { DADOS_BENEFICIO, DADOS_SALARIO } from '../dados';
import { ESTADO_PADRAO, frasesSalario, graficoSalario } from './salario';
import { estadoPadraoBeneficio, frasesBeneficio } from './beneficio';

describe('Simulador 1 com os dados de /data', () => {
  it('resultado padrão da página', () => {
    const f = frasesSalario(DADOS_SALARIO, ESTADO_PADRAO);
    expect(f.resumo).toBe('Com a correção só pela inflação, o mínimo de 2026 seria R$\u00a01.476, e não R$\u00a01.621.');
    expect(f.porMes).toBe('R$\u00a0145');
    expect(f.porAno).toBe('R$\u00a01.885');
    expect(f.acumulada).toBe('R$\u00a04.140');
  });

  it('texto do WhatsApp leva a quantidade e o link', () => {
    const f = frasesSalario(DADOS_SALARIO, { quantidade: 2, base: 'padrao' });
    expect(f.whatsapp('https://x/salario-minimo?salarios=2')).toContain('quem ganha 2 salários mínimos teria R$\u00a0290 a menos');
  });

  it('o gráfico muda com a base', () => {
    expect(graficoSalario(DADOS_SALARIO, ESTADO_PADRAO)).toContain('>1.476<');
    expect(graficoSalario(DADOS_SALARIO, { quantidade: 1, base: 'alternativa' })).toContain('>1.497<');
  });
});

describe('Simulador 4 com os dados de /data', () => {
  const padrao = estadoPadraoBeneficio(DADOS_BENEFICIO);

  it('padrão: piso de hoje e ganho real mínimo da lei', () => {
    expect(padrao).toEqual({ valor: 1621, ganho: 0.6 });
  });

  it('retrospectivo do piso igual ao Simulador 1', () => {
    expect(frasesBeneficio(DADOS_BENEFICIO, padrao).retroPorMes).toBe('R$\u00a0145');
  });

  it('benefício acima do piso: sem perda retroativa', () => {
    const f = frasesBeneficio(DADOS_BENEFICIO, { valor: 3000, ganho: 2.5 });
    expect(f.retroPorMes).toBe('R$\u00a00');
    expect(f.retro).toMatch(/acima do piso/);
    expect(f.total).toBe('R$\u00a00');
  });

  it('piso com 2,5%: perda de 2030 e total batem com a fórmula', () => {
    const f = frasesBeneficio(DADOS_BENEFICIO, { valor: 1621, ganho: 2.5 });
    const mensal = (n: number) => 1621 * (1.025 ** n - 1);
    expect(f.porMesFinal).toBe(`R$\u00a0${mensal(4).toFixed(2).replace('.', ',')}`);
    const total = [1, 2, 3, 4].reduce((s, n) => s + 13 * mensal(n), 0);
    expect(f.total).toBe(`R$\u00a0${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    expect(f.perdaPct).toBe('9,4%'); // 1 − 1/1,025^4
  });
});
