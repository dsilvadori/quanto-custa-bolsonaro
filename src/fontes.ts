import registro from '../data/fontes.json';

export interface Fonte {
  id: string;
  titulo: string;
  orgao: string;
  /** Link para a página web da fonte (tabela, ato, relatório), de preferência a arquivos de dados. */
  url: string;
  /** AAAA-MM-DD; null quando ainda não confirmada ("em atualização"). */
  data_publicacao: string | null;
  data_coleta: string;
  /** O número ou trecho exato tirado da fonte. */
  valor_usado: string;
  usado_em: string[];
}

export const FONTES: Fonte[] = registro.fontes;

const porId = new Map(FONTES.map((f) => [f.id, f]));

/** Falha o build se o id não existir: número sem fonte não vai ao ar. */
export function fonte(id: string): Fonte {
  const f = porId.get(id);
  if (!f) throw new Error(`Fonte "${id}" não existe em data/fontes.json`);
  return f;
}

export function existeFonte(id: string): boolean {
  return porId.has(id);
}
