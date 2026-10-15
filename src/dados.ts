// Lê os CSVs de /data no build. As páginas recebem daqui os números e o id da fonte de cada um.
import salarioMinimoCsv from '../data/salario-minimo.csv?raw';
import inpcCsv from '../data/inpc.csv?raw';
import parametrosCsv from '../data/parametros.csv?raw';
import inpcAnualCsv from '../data/inpc-anual.csv?raw';
import carrinhoCsv from '../data/carrinho-produtos.csv?raw';
import subitensCsv from '../data/ipca-subitens.csv?raw';
import ipcaAlimentacaoCsv from '../data/ipca-alimentacao.csv?raw';
import cestaCapitaisCsv from '../data/cesta-capitais.csv?raw';
import combustivelCsv from '../data/combustivel.csv?raw';
import combustivelPicoCsv from '../data/combustivel-pico.csv?raw';
import { lerCsv } from './calc/csv';
import { acumular } from './calc/cesta';
import { cenarioPorAno } from './calc/salarioMinimo';
import { altasSubitem, fatorProduto } from './calc/carrinho';
import type { DadosCarrinho, Produto } from './simuladores/carrinho';
import { MEDIA, valorHoje, type DadosCesta } from './simuladores/cesta';
import type { Vigencia } from './calc/salarioMinimo';
import type { DadosSalario } from './simuladores/salario';
import type { DadosBeneficio } from './simuladores/beneficio';

export interface VigenciaComFonte extends Vigencia {
  fonte: string;
}

export const SALARIO_MINIMO: VigenciaComFonte[] = lerCsv(salarioMinimoCsv).map((l) => ({
  inicio: l.vigencia_inicio!,
  valor: Number(l.valor),
  fonte: l.fonte!,
}));

export interface InpcComFonte {
  referencia: string;
  pct: number;
  aplicadoNoMinimoDe: number;
  fonte: string;
}

export const INPC: InpcComFonte[] = lerCsv(inpcCsv).map((l) => ({
  referencia: l.referencia!,
  pct: Number(l.variacao_12m_pct),
  aplicadoNoMinimoDe: Number(l.aplicado_no_minimo_de),
  fonte: l.fonte!,
}));

function vigencia(inicio: string): VigenciaComFonte {
  const v = SALARIO_MINIMO.find((s) => s.inicio === inicio);
  if (!v) throw new Error(`Sem salário mínimo com vigência em ${inicio}`);
  return v;
}

/** Simulador 1: o cenário parte de 2023 e aplica o INPC de 2024 em diante. */
export const CENARIO_SM = {
  anoBase: 2023,
  bases: {
    /** Valor de 2023 fixado pelo governo Bolsonaro (MP 1.143/2022). */
    padrao: vigencia('2023-01-01'),
    /** Valor de 2023 a partir de maio (MP 1.172/2023). */
    alternativa: vigencia('2023-05-01'),
  },
  inpc: INPC.filter((i) => i.aplicadoNoMinimoDe > 2023).sort((a, b) => a.aplicadoNoMinimoDe - b.aplicadoNoMinimoDe),
} as const;

/** Salário mínimo em vigor hoje (última vigência). */
export const MINIMO_ATUAL = SALARIO_MINIMO.reduce((a, b) => (b.inicio > a.inicio ? b : a));

export const PARAMETROS: Record<string, { valor: number; fonte: string }> = Object.fromEntries(
  lerCsv(parametrosCsv).map((l) => [l.nome!, { valor: Number(l.valor), fonte: l.fonte! }]),
);

function parametro(nome: string) {
  const p = PARAMETROS[nome];
  if (!p) throw new Error(`Parâmetro ${nome} não existe em data/parametros.csv`);
  return p;
}

/** O que o navegador precisa para refazer as contas (vai como JSON na página). */
export const DADOS_SALARIO: DadosSalario = {
  real: SALARIO_MINIMO.map(({ inicio, valor }) => ({ inicio, valor })),
  anoBase: CENARIO_SM.anoBase,
  inpc: CENARIO_SM.inpc.map((i) => i.pct),
  bases: { padrao: CENARIO_SM.bases.padrao.valor, alternativa: CENARIO_SM.bases.alternativa.valor },
};

// Simulador 2: alimentação no domicílio (IPCA) por governo e valor da cesta por capital (DIEESE).
const alimentacao = lerCsv(ipcaAlimentacaoCsv).map((l) => ({
  periodo: l.periodo!,
  pct: Number(l.variacao_pct),
  governo: l.governo!,
  meses: Number(l.meses),
  fonte: l.fonte!,
}));
const porGoverno = (g: string) => {
  const linhas = alimentacao.filter((a) => a.governo === g);
  return {
    pct: acumular(linhas.map((a) => a.pct)),
    meses: linhas.reduce((s, a) => s + a.meses, 0),
    de: linhas[0].periodo,
    ate: linhas[linhas.length - 1].periodo,
    fontes: [...new Set(linhas.map((a) => a.fonte))],
  };
};
const capitais = lerCsv(cestaCapitaisCsv).map((l) => ({
  nome: l.capital!,
  valor: Number(l.valor_cesta),
  referencia: l.referencia!,
  fonte: l.fonte!,
}));

export const CESTA = {
  bolsonaro: porGoverno('bolsonaro'),
  atual: porGoverno('lula'),
  capitais,
  referencia: capitais[0].referencia,
  fonteValores: capitais[0].fonte,
};

// Simulador 3: exemplo com o relatório mais recente da Abicom.
export const COMBUSTIVEIS = lerCsv(combustivelCsv).map((l) => ({
  combustivel: l.combustivel as 'gasolina' | 'diesel',
  defasagem: Number(l.defasagem_rs_l),
  teorBio: Number(l.teor_bio_pct),
  preco: Number(l.preco_bomba_rs_l),
  peso: Number(l.peso_ipca_pct),
  fontes: { defasagem: l.fonte_defasagem!, teor: l.fonte_teor!, preco: l.fonte_preco!, peso: l.fonte_peso! },
}));

/** Maior diferença do ano nos relatórios da Abicom (polos da Petrobras), com a mistura que valia na data. */
export const PICO_COMBUSTIVEL = lerCsv(combustivelPicoCsv).map((l) => ({
  combustivel: l.combustivel as 'gasolina' | 'diesel',
  data: l.data!,
  defasagem: Number(l.defasagem_rs_l),
  teorBio: Number(l.teor_bio_pct),
  fontes: { defasagem: l.fonte_defasagem!, teor: l.fonte_teor! },
}));

export const DADOS_CESTA: DadosCesta = {
  bolsonaroPct: CESTA.bolsonaro.pct,
  bolsonaroMeses: CESTA.bolsonaro.meses,
  atualPct: CESTA.atual.pct,
  atualMeses: CESTA.atual.meses,
  capitais: CESTA.capitais.map(({ nome, valor }) => ({ nome, valor })),
  minimoReal: MINIMO_ATUAL.valor,
  minimoCenario: cenarioPorAno(CENARIO_SM.anoBase, CENARIO_SM.bases.padrao.valor, CENARIO_SM.inpc.map((i) => i.pct))[
    Number(MINIMO_ATUAL.inicio.slice(0, 4))
  ],
};

// Simulador 4: INPC acumulado no ano, aplicado aos benefícios em janeiro do ano seguinte.
export const INPC_ANUAL = lerCsv(inpcAnualCsv).map((l) => ({
  ano: Number(l.ano),
  pct: Number(l.variacao_pct),
  aplicadoEm: Number(l.aplicado_em),
  fonte: l.fonte!,
}));

// Simulador 5: preço de cada produto (DIEESE por capital; ANP para gás e gasolina, média Brasil)
// e alta do subitem do IPCA em cada governo.
const linhasPrecos = lerCsv(carrinhoCsv);
const porSubitem = new Map<string, { pct: number; governo: string; meses: number }[]>();
const nomeSubitem = new Map<string, string>();
const fontesSubitens = new Set<string>();
for (const l of lerCsv(subitensCsv)) {
  const lista = porSubitem.get(l.subitem_ipca!) ?? [];
  lista.push({ pct: Number(l.variacao_pct), governo: l.governo!, meses: Number(l.meses) });
  porSubitem.set(l.subitem_ipca!, lista);
  nomeSubitem.set(l.subitem_ipca!, l.nome!);
  fontesSubitens.add(l.fonte!);
}

const CAPITAIS_CARRINHO = [...new Set(linhasPrecos.filter((l) => l.capital !== 'Brasil').map((l) => l.capital!))].sort((a, b) =>
  a.localeCompare(b, 'pt-BR'),
);

const produtosCarrinho: Produto[] = [];
for (const l of linhasPrecos) {
  if (produtosCarrinho.some((p) => p.id === l.produto)) continue;
  const periodos = porSubitem.get(l.subitem_ipca!);
  if (!periodos) throw new Error(`Subitem ${l.subitem_ipca} sem dados em data/ipca-subitens.csv`);
  const a = altasSubitem(periodos);
  produtosCarrinho.push({
    id: l.produto!,
    nome: l.nome!,
    unidade: l.unidade!,
    fator: fatorProduto(a),
    altaBolsonaro: a.bolsonaroPct,
    altaAtual: a.atualPct,
    alimento: l.capital !== 'Brasil',
    fontePreco: l.fonte_preco!,
  });
}

function precosDe(capital: string): Record<string, number> {
  return Object.fromEntries(
    linhasPrecos.filter((l) => l.capital === capital || l.capital === 'Brasil').map((l) => [l.produto!, Number(l.preco)]),
  );
}
const precosCapitais = Object.fromEntries(CAPITAIS_CARRINHO.map((c) => [c, precosDe(c)]));
// Quantidade mensal da cesta de um adulto em cada capital (DIEESE, Decreto-Lei 399/1938).
const qtdCapitais = Object.fromEntries(
  CAPITAIS_CARRINHO.map((c) => [
    c,
    Object.fromEntries(linhasPrecos.filter((l) => l.capital === c && l.qtd_cesta).map((l) => [l.produto!, Number(l.qtd_cesta)])),
  ]),
);
const media = (valores: number[]) => valores.reduce((s, v) => s + v, 0) / valores.length;
const mediaPrecos = Object.fromEntries(
  produtosCarrinho.map((p) => {
    const valores = Object.values(precosCapitais)
      .map((pr) => pr[p.id])
      .filter((v) => v !== undefined);
    return [p.id, valores.reduce((s, v) => s + v, 0) / valores.length];
  }),
);
const mediaQtd = Object.fromEntries(
  produtosCarrinho
    .map((p) => [p.id, Object.values(qtdCapitais).map((q) => q[p.id]).filter((v) => v !== undefined)] as const)
    .filter(([, v]) => v.length > 0)
    .map(([id, v]) => [id, Math.round(media(v) * 100) / 100]),
);
const periodoExemplo = altasSubitem(porSubitem.values().next().value!);

export const DADOS_CARRINHO: DadosCarrinho = {
  produtos: produtosCarrinho,
  capitais: CAPITAIS_CARRINHO,
  precos: { media: mediaPrecos, ...precosCapitais },
  quantidades: { media: mediaQtd, ...qtdCapitais },
  familia: PARAMETROS.familia_cestas.valor,
  mesesBolsonaro: periodoExemplo.bolsonaroMeses,
  mesesAtual: periodoExemplo.atualMeses,
};

export const CARRINHO = {
  fontesSubitens: [...fontesSubitens],
  fontesPreco: [...new Set(produtosCarrinho.map((p) => p.fontePreco))],
  fonteQtd: linhasPrecos.find((l) => l.fonte_qtd)!.fonte_qtd!,
  referencia: linhasPrecos.find((l) => l.capital !== 'Brasil')!.referencia!,
  nomeSubitem,
};

export const DADOS_BENEFICIO: DadosBeneficio = {
  real: DADOS_SALARIO.real,
  anoBase: Math.min(...INPC_ANUAL.map((i) => i.aplicadoEm)) - 1,
  inpcPorAno: Object.fromEntries(INPC_ANUAL.map((i) => [i.aplicadoEm, i.pct])),
  piso: MINIMO_ATUAL.valor,
  anoAtual: Number(MINIMO_ATUAL.inicio.slice(0, 4)),
  ateAno: parametro('ganho_real_ate_ano').valor,
  ganhoMin: parametro('ganho_real_min_pct').valor,
  ganhoMax: parametro('ganho_real_max_pct').valor,
  cesta: valorHoje(DADOS_CESTA, MEDIA),
};
