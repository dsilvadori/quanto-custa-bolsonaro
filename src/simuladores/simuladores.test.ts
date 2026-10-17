import { describe, expect, it } from 'vitest';
import { DADOS_BENEFICIO, DADOS_SALARIO } from '../dados';
import { PAGINAS } from '../site';
import { calcularBeneficio } from './beneficio';
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

  it('padrão: BPC e ganho real máximo da lei', () => {
    expect(padrao).toEqual({ tipo: 'bpc', ganho: 2.5 });
    expect(DADOS_BENEFICIO.anoBase).toBe(2022);
  });

  it('BPC desvinculado desde 2023: R$ 1.449,42 hoje, R$ 171,58 a menos por mês', () => {
    const f = frasesBeneficio(DADOS_BENEFICIO, padrao);
    expect(f.hoje).toBe('R$\u00a01.449,42');
    expect(f.retroPorMes).toBe('R$\u00a0171,58');
    expect(f.retroTotal).toBe('R$\u00a04.862,40');
    expect(f.retro).toMatch(/^Se o BPC tivesse sido desvinculado do salário mínimo em 2023/);
  });

  it('a descrição de SEO usa os números do cálculo', () => {
    const { retro } = calcularBeneficio(DADOS_BENEFICIO, padrao);
    const ultimo = retro.anos[retro.anos.length - 1];
    const inteiro = (v: number) => `R$ ${Math.floor(v).toLocaleString('pt-BR')}`;
    expect(PAGINAS.aposentadoriaBpc.descricao).toContain(`hoje seria ${inteiro(ultimo.desvinculado)}, e não ${inteiro(ultimo.real)}`);
  });

  it('aposentadoria de 1 mínimo soma o 13º', () => {
    expect(frasesBeneficio(DADOS_BENEFICIO, { tipo: 'aposentadoria', ganho: 0.6 }).retroTotal).toBe('R$\u00a05.273,60');
  });

  const milhar = (v: number) => `R$\u00a0${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  it('inflação da projeção: média do INPC dos últimos anos', () => {
    expect(DADOS_BENEFICIO.inflacao).toBe(4.6);
  });

  it('projeção com a inflação média: os dois sobem, o ligado ao mínimo sobe mais', () => {
    const f = frasesBeneficio(DADOS_BENEFICIO, { tipo: 'bpc', ganho: 2.5 });
    const total = [1, 2, 3, 4].reduce((s, n) => s + 12 * 1621 * 1.046 ** n * (1.025 ** n - 1), 0);
    expect(f.total).toBe(milhar(total));
    expect(f.futuro).toContain(`o BPC sem aumento real só repõe a inflação: iria de R$\u00a01.621 para ${milhar(1621 * 1.046 ** 4)} em 2030`);
  });

  it('projeção com 2,5%: perda de 2030 e % batem com a fórmula', () => {
    const f = frasesBeneficio(DADOS_BENEFICIO, { tipo: 'bpc', ganho: 2.5 });
    expect(f.porMesFinal).toBe(milhar(1621 * 1.046 ** 4 * (1.025 ** 4 - 1)));
    expect(f.perdaPct).toBe('9,4%');
  });
});

describe('Simulador 4: cestas com a comida do governo Bolsonaro', () => {
  it('ritmo anual da comida em cada governo e diferença de cestas em 2030', () => {
    expect(DADOS_BENEFICIO.altaComidaBolsonaro).toBe(11.8);
    expect(DADOS_BENEFICIO.altaComidaLula).toBe(3.6);
    const f = frasesBeneficio(DADOS_BENEFICIO, { tipo: 'bpc', ganho: 2.5 });
    const queda = (1 - (1.046 / 1.118) ** 4 / ((1.046 * 1.025) / 1.036) ** 4) * 100;
    expect(f.cestasPct).toBe(`${queda.toFixed(1).replace('.', ',')}%`);
    expect(f.comida).toMatch(/^Hoje, o BPC compra 2,15 cestas básicas por mês\. Com a regra do governo Lula/);
  });
});

describe('Simulador 4: concordância', () => {
  it('aposentadoria no feminino, BPC no masculino', () => {
    const apos = frasesBeneficio(DADOS_BENEFICIO, { tipo: 'aposentadoria', ganho: 0.6 });
    expect(apos.retro).toMatch(/aposentadoria de 1 salário mínimo tivesse sido desvinculada/);
    expect(apos.futuro).toContain('a aposentadoria de 1 salário mínimo sem aumento real');
  });
});
