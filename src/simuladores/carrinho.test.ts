import { describe, expect, it } from 'vitest';
import { DADOS_CARRINHO, DADOS_CESTA } from '../dados';
import { MEDIA, calcularCarrinho, codificarItens, decodificarItens, estadoFamilia, estadoPadraoCarrinho, estadoVazio, passo, qtdTexto } from './carrinho';

describe('carrinho padrão: compra da quinzena de uma família de 4', () => {
  it.each(['São Paulo', 'Recife'])('%s: custa 1,5 × o valor da cesta do DIEESE', (capital) => {
    const cesta = DADOS_CESTA.capitais.find((c) => c.nome === capital)!.valor;
    const r = calcularCarrinho(DADOS_CARRINHO, estadoPadraoCarrinho(DADOS_CARRINHO, capital));
    expect(Math.abs(r.hoje - 1.5 * cesta)).toBeLessThan(1);
  });

  it('São Paulo: metade da compra do mês (carne 9 kg, leite 11,25 L); gás e batata do Nordeste em 0', () => {
    const q = estadoPadraoCarrinho(DADOS_CARRINHO, 'São Paulo').qtd;
    expect(q.carne).toBe(9);
    expect(q.leite).toBe(11.25);
    expect(q.gas).toBe(0);
    expect(estadoPadraoCarrinho(DADOS_CARRINHO, 'Recife').qtd.batata).toBe(0);
  });

  it('vazio: tudo em 0 e total zero', () => {
    const r = calcularCarrinho(DADOS_CARRINHO, estadoVazio(DADOS_CARRINHO, MEDIA));
    expect(r.hoje).toBe(0);
    expect(r.itens).toBe(0);
  });
});

describe('atalho: compra do mês de uma família de 4 pessoas', () => {
  it('a família vale 3 cestas de adulto (DIEESE)', () => {
    expect(DADOS_CARRINHO.familia).toBe(3);
  });

  it.each(['São Paulo', 'Recife', 'Porto Alegre'])('%s: a compra padrão custa 3 × o valor da cesta publicado pelo DIEESE', (capital) => {
    const cesta = DADOS_CESTA.capitais.find((c) => c.nome === capital)!.valor;
    const r = calcularCarrinho(DADOS_CARRINHO, estadoFamilia(DADOS_CARRINHO, capital));
    expect(Math.abs(r.hoje - 3 * cesta)).toBeLessThan(1);
  });

  it('quantidades de São Paulo: carne 18 kg, leite 22,5 L, café 1,8 kg; gás começa em 0', () => {
    const q = estadoFamilia(DADOS_CARRINHO, 'São Paulo').qtd;
    expect(q.carne).toBe(18);
    expect(q.leite).toBe(22.5);
    expect(q.cafe).toBe(1.8);
    expect(q.gas).toBe(0);
  });

  it('produto que a capital não pesquisa fica de fora (batata no Nordeste)', () => {
    expect(estadoFamilia(DADOS_CARRINHO, 'Recife').qtd.batata).toBe(0);
  });

  it('na média das capitais, todos os alimentos entram', () => {
    const q = estadoFamilia(DADOS_CARRINHO, MEDIA).qtd;
    for (const p of DADOS_CARRINHO.produtos.filter((p) => p.id !== 'gas')) expect(q[p.id], p.id).toBeGreaterThan(0);
  });
});

describe('quantidades com decimais', () => {
  it('passo de 1 unidade, sem passar de 0 a 99', () => {
    expect(passo(0.9, -1)).toBe(0);
    expect(passo(13.5, 1)).toBe(14.5);
    expect(passo(99, 1)).toBe(99);
  });

  it('texto em pt-BR', () => {
    expect(qtdTexto(13.5)).toBe('13,5');
    expect(qtdTexto(18)).toBe('18');
  });

  it('URL guarda só o que mudou e aceita decimais', () => {
    const base = estadoPadraoCarrinho(DADOS_CARRINHO, 'São Paulo');
    const mudado = { ...base, qtd: { ...base.qtd, gas: 1, carne: 12.5 } };
    const texto = codificarItens(DADOS_CARRINHO, mudado);
    expect(texto).toBe('carne:12.5,gas:1');
    expect(decodificarItens(DADOS_CARRINHO, base, texto)).toEqual(mudado);
  });
});
