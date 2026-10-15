// Fonte única de nome, menus e SEO de cada página.
// Title ≤ 60 e description ≤ 155 caracteres, escritos como a pergunta do eleitor
// (conferido em site.test.ts). O h1 repete o title.

export const SITE = {
  nome: 'Quanto custa Bolsonaro no poder',
  nomeCurto: 'Quanto custa',
  // Lei 9.504/97, art. 57-D: responsável identificado. TODO: preencher.
  responsavel: { nome: '[NOME]', documento: '[CPF/CNPJ]', contato: '[CONTATO]' },
} as const;

export type PaginaId =
  | 'inicio'
  | 'salarioMinimo'
  | 'cestaBasica'
  | 'combustivel'
  | 'aposentadoriaBpc'
  | 'comoCalculamos'
  | 'fontes'
  | 'quemSomos';

export interface Pagina {
  path: string;
  /** Rótulo curto em menus e breadcrumbs. */
  rotulo: string;
  titulo: string;
  descricao: string;
  /** Data da última revisão do conteúdo (AAAA-MM-DD), mostrada na página. */
  atualizadoEm: string;
}

export const PAGINAS: Record<PaginaId, Pagina> = {
  inicio: {
    path: '/',
    rotulo: 'Início',
    titulo: 'Quanto custaria a volta das regras de Bolsonaro para você?',
    descricao:
      'Veja em reais e em horas de trabalho o que mudaria no seu orçamento se as regras econômicas do governo Bolsonaro voltassem. Tudo com fonte oficial.',
    atualizadoEm: '2026-10-15',
  },
  salarioMinimo: {
    path: '/salario-minimo',
    rotulo: 'Salário mínimo',
    titulo: 'Quanto seria o salário mínimo hoje com a regra de Bolsonaro?',
    // TODO (etapa 4): trocar pela descrição com os valores, depois que fontes.json existir.
    descricao:
      'Com a correção só pela inflação, o mínimo de 2026 seria menor. Veja a conta, as fontes oficiais e calcule quanto você perderia por mês.',
    atualizadoEm: '2026-10-15',
  },
  cestaBasica: {
    path: '/cesta-basica',
    rotulo: 'Cesta básica',
    titulo: 'Quanto custaria a cesta básica no ritmo de Bolsonaro?',
    descricao:
      'Se a comida subisse no ritmo do governo Bolsonaro, quanto custaria a cesta básica na sua capital? Veja a conta e as fontes oficiais.',
    atualizadoEm: '2026-10-15',
  },
  combustivel: {
    path: '/combustivel',
    rotulo: 'Combustível',
    titulo: 'Quanto custariam a gasolina e o diesel sem o fim do PPI?',
    descricao:
      'Quanto subiriam a gasolina e o diesel se a Petrobras voltasse a seguir o preço de importação (PPI)? Veja o exemplo, as ressalvas e as fontes.',
    atualizadoEm: '2026-10-15',
  },
  aposentadoriaBpc: {
    path: '/aposentadoria-bpc',
    rotulo: 'Aposentadoria e BPC',
    titulo: 'Aposentadoria e BPC sem o mínimo: quanto você perderia?',
    descricao:
      'Se o BPC tivesse sido desvinculado do salário mínimo em 2023, hoje seria R$ 1.449, e não R$ 1.621. Veja a conta ano a ano e a projeção até 2030.',
    atualizadoEm: '2026-10-15',
  },
  comoCalculamos: {
    path: '/como-calculamos',
    rotulo: 'Como calculamos',
    titulo: 'Como calculamos cada número do site?',
    descricao:
      'As fórmulas, premissas e contrapontos de cada simulador, passo a passo, com a fonte de cada número e o registro público de correções.',
    atualizadoEm: '2026-10-15',
  },
  fontes: {
    path: '/fontes',
    rotulo: 'Fontes',
    titulo: 'De onde vêm os números? Todas as fontes e dados para baixar',
    descricao:
      'Todas as fontes oficiais usadas no site (IBGE, DIEESE, ANP, Diário Oficial), com data, valor usado, cópia arquivada e dados em CSV.',
    atualizadoEm: '2026-10-15',
  },
  quemSomos: {
    path: '/quem-somos',
    rotulo: 'Quem somos',
    titulo: 'Quem faz este site e como falar com a gente?',
    descricao:
      'Quem é responsável pelo site, como entrar em contato e como pedir a correção de um dado.',
    atualizadoEm: '2026-10-15',
  },
};

export const SIMULADORES: PaginaId[] = ['salarioMinimo', 'cestaBasica', 'combustivel', 'aposentadoriaBpc'];

export const MENU: PaginaId[] = [...SIMULADORES, 'comoCalculamos', 'fontes'];

export const RODAPE: PaginaId[] = ['comoCalculamos', 'fontes', 'quemSomos'];

/** "2026-10-15" → "15 de outubro de 2026"; o dia 1 vira "1º". */
export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const texto = new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return dia === 1 ? texto.replace(/^1 /, '1º ') : texto;
}
