import { describe, expect, it } from 'vitest';
import { DADOS_CARRINHO, DADOS_CESTA } from '../dados';
import { MEDIA, calcularCarrinho, codificarItens, decodificarItens, estadoFamilia, estadoPadraoCarrinho, estadoVazio, passo, qtdTexto, quantidadeDeCompra } from './carrinho';

describe('carrinho padrão: compra da quinzena de uma família de 4', () => {
  it.each(['São Paulo', 'Recife'])('%s: com quantidades arredondadas, fica a menos de 3%% de 1,5 × a cesta do DIEESE', (capital) => {
    const cesta = DADOS_CESTA.capitais.find((c) => c.nome === capital)!.valor;
    const r = calcularCarrinho(DADOS_CARRINHO, estadoPadraoCarrinho(DADOS_CARRINHO, capital));
    expect(Math.abs(r.hoje / (1.5 * cesta) - 1)).toBeLessThan(0.03);
  });

  it('São Paulo: quantidades redondas (carne 9 kg, leite 11 L, café 1 kg, manteiga 1 kg); gás e batata do Nordeste em 0', () => {
    const q = estadoPadraoCarrinho(DADOS_CARRINHO, 'São Paulo').qtd;
    expect(q.carne).toBe(9);
    expect(q.leite).toBe(11);
    expect(q.cafe).toBe(1);
    expect(q.manteiga).toBe(1);
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

  it.each(['São Paulo', 'Recife', 'Porto Alegre'])('%s: a compra do mês fica a menos de 2%% de 3 × a cesta do DIEESE', (capital) => {
    const cesta = DADOS_CESTA.capitais.find((c) => c.nome === capital)!.valor;
    const r = calcularCarrinho(DADOS_CARRINHO, estadoFamilia(DADOS_CARRINHO, capital));
    expect(Math.abs(r.hoje / (3 * cesta) - 1)).toBeLessThan(0.02);
  });

  it('quantidades do mês em São Paulo: carne 18 kg, leite 23 L, café 2 kg; gás começa em 0', () => {
    const q = estadoFamilia(DADOS_CARRINHO, 'São Paulo').qtd;
    expect(q.carne).toBe(18);
    expect(q.leite).toBe(23);
    expect(q.cafe).toBe(2);
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

describe('quantidadeDeCompra', () => {
  it.each([
    [11.25, 11],
    [13.5, 14],
    [6.75, 7],
    [0.9, 1],
    [1.125, 1],
    [1.5, 1.5],
    [0.45, 0.5],
    [0.1, 0.5],
    [0, 0],
  ])('%s → %s', (v, esperado) => {
    expect(quantidadeDeCompra(v)).toBe(esperado);
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
