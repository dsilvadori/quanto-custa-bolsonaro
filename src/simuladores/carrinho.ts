// Simulador 5: o que a página mostra. Usado no build e no navegador.
import { totalCarrinho } from '../calc/carrinho';
import { pct, preco, reais } from '../formato';
import { barrasH } from '../graficos/barrasH';
import { COR_BOLSONARO, COR_LULA } from '../graficos/cores';

export interface Produto {
  id: string;
  nome: string;
  unidade: string;
  /** Preço no governo do Bolsonaro = preço de hoje × fator. */
  fator: number;
  altaBolsonaro: number;
  altaAtual: number;
  /** Entra no carrinho padrão (alimentos da cesta). */
  alimento: boolean;
  fontePreco: string;
}

export interface DadosCarrinho {
  produtos: Produto[];
  capitais: string[];
  /** Preço por capital (e "media") e produto. Produto ausente = sem preço naquela capital. */
  precos: Record<string, Record<string, number>>;
  /** Quantidade mensal da cesta de um adulto por capital (e "media") e produto (DIEESE). */
  quantidades: Record<string, Record<string, number>>;
  /** Cestas de uma família de 4 pessoas (2 adultos e 2 crianças): 3, pela metodologia do DIEESE. */
  familia: number;
  mesesBolsonaro: number;
  mesesAtual: number;
}

export const MEDIA = 'media';

export interface EstadoCarrinho {
  capital: string;
  qtd: Record<string, number>;
}

/** Quinzena = metade da compra do mês. */
export const QUINZENA = 0.5;

/** Compra de referência do topo da página: a quinzena de uma família de 4 pessoas (1,5 cesta de adulto da capital). */
export function estadoPadraoCarrinho(d: DadosCarrinho, capital = MEDIA): EstadoCarrinho {
  return estadoFamilia(d, capital, QUINZENA);
}

/** Carrinho vazio, para montar do zero. */
export function estadoVazio(d: DadosCarrinho, capital: string): EstadoCarrinho {
  return { capital, qtd: Object.fromEntries(d.produtos.map((p) => [p.id, 0])) };
}

/**
 * Compra de uma família de 4 pessoas: 3 cestas de adulto da capital por mês (DIEESE), vezes `fracao`
 * (1 = mês, 0,5 = quinzena). Gás em 0 (sem dado oficial de consumo).
 */
export function estadoFamilia(d: DadosCarrinho, capital = MEDIA, fracao = 1): EstadoCarrinho {
  const precos = d.precos[capital];
  const qtd = d.quantidades[capital];
  return {
    capital,
    qtd: Object.fromEntries(
      d.produtos.map((p) => [p.id, precos[p.id] !== undefined && qtd[p.id] !== undefined ? quantidadeDeCompra(qtd[p.id] * d.familia * fracao) : 0]),
    ),
  };
}

const arredondar = (v: number) => Math.round(v * 100) / 100;

/** Quantidade que se compra de verdade: de 2 para cima, inteiro; abaixo de 2, de meia em meia (mínimo meia). */
export function quantidadeDeCompra(v: number): number {
  if (v <= 0) return 0;
  if (v >= 2) return Math.round(v);
  return Math.max(0.5, Math.round(v * 2) / 2);
}

/** 13.5 → "13,5"; 0.9 → "0,9". */
export function qtdTexto(v: number): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

/** Um toque em − ou +: passo de 1 unidade, sem passar de 0 a 99. */
export function passo(atual: number, sentido: 1 | -1): number {
  return arredondar(Math.min(99, Math.max(0, atual + sentido)));
}

export function linhasCarrinho(d: DadosCarrinho, e: EstadoCarrinho) {
  const precos = d.precos[e.capital];
  return d.produtos.map((p) => {
    const preco = precos[p.id];
    const disponivel = preco !== undefined;
    const qtd = disponivel ? (e.qtd[p.id] ?? 0) : 0;
    return { ...p, disponivel, preco: disponivel ? preco : NaN, cenario: disponivel ? preco * p.fator : NaN, qtd };
  });
}

export function calcularCarrinho(d: DadosCarrinho, e: EstadoCarrinho) {
  const linhas = linhasCarrinho(d, e);
  const total = totalCarrinho(linhas.map((l) => ({ preco: l.preco, fator: l.fator, quantidade: l.qtd })));
  return { linhas, ...total, itens: linhas.reduce((s, l) => s + l.qtd, 0) };
}

export function lugar(d: DadosCarrinho, capital: string): string {
  return capital === MEDIA ? `na média das ${d.capitais.length} capitais` : `em ${capital}`;
}

/** "arroz:2,cafe:1" ↔ quantidades. O carrinho começa vazio: guarda só o que a pessoa pôs. */
export function codificarItens(d: DadosCarrinho, e: EstadoCarrinho): string | null {
  const itens = d.produtos.filter((p) => (e.qtd[p.id] ?? 0) > 0).map((p) => `${p.id}:${e.qtd[p.id]}`);
  return itens.length ? itens.join(',') : null;
}

export function decodificarItens(d: DadosCarrinho, base: EstadoCarrinho, texto: string | null): EstadoCarrinho {
  const qtd = { ...base.qtd };
  for (const par of (texto ?? '').split(',')) {
    const [id, n] = par.split(':');
    const v = Number(n);
    if (d.produtos.some((p) => p.id === id) && Number.isFinite(v) && v >= 0 && v <= 99) qtd[id] = arredondar(v);
  }
  return { ...base, qtd };
}

/** Texto para compartilhar a compra de referência (quinzena da família de 4), usado quando o carrinho está vazio. */
export function textoReferencia(d: DadosCarrinho, capital: string, url: string): string {
  const r = calcularCarrinho(d, estadoPadraoCarrinho(d, capital));
  return `A compra da quinzena de uma família de 4 pessoas ${lugar(d, capital)} custa ${reais(r.hoje)} hoje. No governo do Bolsonaro, custaria ${reais(r.cenario)}. Monte o seu carrinho e veja as fontes: ${url}`;
}

export function frasesCarrinho(d: DadosCarrinho, e: EstadoCarrinho) {
  const r = calcularCarrinho(d, e);
  const onde = lugar(d, e.capital);
  const mais = r.diferenca >= 0;
  // Os itens que mais mudariam de preço, para o cartão.
  const destaques = r.linhas
    .filter((l) => l.qtd > 0)
    .sort((a, b) => (b.cenario - b.preco) * b.qtd - (a.cenario - a.preco) * a.qtd)
    .slice(0, 3)
    .map((l) => `${l.nome}: ${reais(l.preco)} → ${reais(l.cenario)}`);
  return {
    hoje: reais(r.hoje),
    cenario: reais(r.cenario),
    diferenca: `${mais ? '+' : '−'}${reais(Math.abs(r.diferenca))}`,
    pct: `${mais ? '+' : '−'}${pct(Math.abs(r.pct), 1)}`,
    resumo:
      r.itens === 0
        ? 'Seu carrinho está vazio. Toque em + para pôr produtos.'
        : `${onde.charAt(0).toUpperCase()}${onde.slice(1)}, este carrinho custa ${reais(r.hoje)} hoje. No governo do Bolsonaro, custaria ${reais(r.cenario)}: ${reais(Math.abs(r.diferenca))} ${mais ? 'a mais' : 'a menos'}.`,
    whatsapp: (url: string) =>
      `Montei um carrinho de supermercado ${onde}: ${reais(r.hoje)} hoje, ${reais(r.cenario)} no governo do Bolsonaro. Monte o seu e veja as fontes: ${url}`,
    cartao: {
      numero: `${mais ? '+' : '−'}${reais(Math.abs(r.diferenca))}`,
      linha: `no carrinho de supermercado ${onde}`,
      premissa: `Governo Lula: ${reais(r.hoje)}; governo do Bolsonaro: ${reais(r.cenario)}. ${destaques.join('. ')}.`,
      fonte: 'Fontes: DIEESE, ANP e IBGE',
    },
  };
}

// Nomes curtos para caber no rótulo do gráfico.
const NOME_CURTO: Record<string, string> = {
  carne: 'Carne',
  leite: 'Leite',
  'farinha-mandioca': 'Farinha mandioca',
  gas: 'Gás de botijão',
};

/** Quanto cada produto mudaria de preço, com o preço no governo Lula (hoje) e como no governo do Bolsonaro (média das capitais). */
export function graficoProdutos(d: DadosCarrinho): string {
  const precos = d.precos[MEDIA];
  const linhas = [...d.produtos]
    .map((p) => ({ p, v: (p.fator - 1) * 100, hoje: precos[p.id], cenario: precos[p.id] * p.fator }))
    .sort((a, b) => b.v - a.v);
  const sinal = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;
  return barrasH({
    id: 'grafico-produtos',
    titulo: 'Preço de cada produto no governo Lula (hoje) e como seria no governo do Bolsonaro, média das capitais',
    descricao: linhas.map(({ p, v, hoje, cenario }) => `${p.nome} (${p.unidade}): ${preco(hoje)} no governo Lula, ${preco(cenario)} no governo do Bolsonaro, ${sinal(v)}`).join('; ') + '.',
    linhas: linhas.map(({ p, v, hoje, cenario }) => ({
      rotulo: NOME_CURTO[p.id] ?? p.nome,
      valor: v,
      texto: sinal(v),
      cor: COR_BOLSONARO,
      detalhe: `Lula ${preco(hoje)} → Bolsonaro ${preco(cenario)} (${p.unidade})`,
    })),
  });
}
