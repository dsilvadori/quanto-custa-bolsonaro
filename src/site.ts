// Fonte única de nome, menus e SEO de cada página.
// Title ≤ 60 e description ≤ 155 caracteres, escritos como a pergunta do eleitor
// (conferido em site.test.ts). O h1 repete o title.

export const SITE = {
  nome: 'Quanto custa Bolsonaro no poder',
  nomeCurto: 'Quanto custa',
} as const;

/**
 * Caminho interno com a base do site. Vazia no domínio próprio; "/quanto-custa-bolsonaro"
 * em dsilvadori.github.io/quanto-custa-bolsonaro/ (variável BASE_PATH no build).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const link = (path: string) => (path === '/' ? `${BASE}/` : `${BASE}${path}`);

export type PaginaId =
  | 'inicio'
  | 'salarioMinimo'
  | 'cestaBasica'
  | 'carrinho'
  | 'combustivel'
  | 'aposentadoriaBpc'
  | 'covid'
  | 'comoCalculamos'
  | 'fontes';

export interface Pagina {
  path: string;
  /** Rótulo curto em cartões, rodapé e breadcrumbs. */
  rotulo: string;
  /** Rótulo no menu do topo, quando o rótulo não cabe. */
  menu?: string;
  titulo: string;
  descricao: string;
  /** Data da última revisão do conteúdo (AAAA-MM-DD), mostrada na página. */
  atualizadoEm: string;
}

export const PAGINAS: Record<PaginaId, Pagina> = {
  inicio: {
    path: '/',
    rotulo: 'Início',
    titulo: 'Quanto custaria o seu mês no governo do Bolsonaro?',
    descricao:
      'Salário, comida, gás, combustível e aposentadoria: veja em reais quanto custaria o seu mês no governo do Bolsonaro. Todo número tem fonte oficial.',
    atualizadoEm: '2026-10-15',
  },
  salarioMinimo: {
    path: '/salario-minimo',
    rotulo: 'Salário mínimo',
    titulo: 'Quanto seria o salário mínimo no governo do Bolsonaro?',
    // TODO (etapa 4): trocar pela descrição com os valores, depois que fontes.json existir.
    descricao:
      'Com a correção só pela inflação, o mínimo de 2026 seria menor. Veja a conta, as fontes oficiais e calcule quanto você perderia por mês.',
    atualizadoEm: '2026-10-15',
  },
  cestaBasica: {
    path: '/cesta-basica',
    rotulo: 'Cesta básica',
    titulo: 'Quanto custaria a cesta básica no governo do Bolsonaro?',
    descricao:
      'Se a comida subisse como no governo do Bolsonaro, quanto custaria a cesta básica na sua capital? Veja a conta e as fontes oficiais.',
    atualizadoEm: '2026-10-15',
  },
  carrinho: {
    path: '/carrinho',
    rotulo: 'Carrinho de supermercado',
    menu: 'Supermercado',
    titulo: 'Carrinho de supermercado no governo do Bolsonaro: quanto dá?',
    descricao:
      'A compra da quinzena de uma família de 4 pessoas, produto a produto: quanto custaria se os preços subissem como no governo do Bolsonaro?',
    atualizadoEm: '2026-10-15',
  },
  combustivel: {
    path: '/combustivel',
    rotulo: 'Combustível',
    titulo: 'Gasolina e diesel no governo do Bolsonaro: quanto custariam?',
    descricao:
      'Com o preço de importação (PPI) do governo do Bolsonaro, quanto custariam o litro e o tanque cheio de gasolina e diesel? Veja a conta e as fontes.',
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
  covid: {
    path: '/covid',
    rotulo: 'Vidas perdidas na covid',
    menu: 'Covid',
    titulo: 'Quantas vidas o governo do Bolsonaro custou na pandemia?',
    descricao:
      'Quase 694 mil mortes por covid no governo do Bolsonaro. Veja quantas poderiam ter sido evitadas e quantas vidas custou o atraso das vacinas.',
    atualizadoEm: '2026-10-20',
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
    titulo: 'De onde vêm os números? Todas as fontes oficiais',
    descricao:
      'Todas as fontes oficiais usadas no site (IBGE, DIEESE, ANP, Diário Oficial), com data, valor usado e link para a página oficial.',
    atualizadoEm: '2026-10-15',
  },
};

export const SIMULADORES: PaginaId[] = ['salarioMinimo', 'cestaBasica', 'carrinho', 'combustivel', 'aposentadoriaBpc'];

// Menu do topo: os simuladores, as vidas perdidas na covid e as fontes. "Como calculamos" fica no rodapé e em cada simulador.
export const MENU: PaginaId[] = [...SIMULADORES, 'covid', 'fontes'];

export const RODAPE: PaginaId[] = ['comoCalculamos', 'fontes'];

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
