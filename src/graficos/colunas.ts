// Série longa em colunas finas (uma por ano), em SVG. Cada coluna tem a sua cor; o valor só aparece nas colunas marcadas,
// e embaixo vão os nomes dos grupos (ex.: governos), em duas linhas alternadas para caber no celular.
// Colunas e valores levam as classes "barra"/"valor" e a ordem (--i) da animação de entrada (global.css).

export interface Coluna {
  valor: number;
  cor: string;
  /** Texto acima da coluna; sem ele, a coluna fica sem rótulo. */
  rotulo?: string;
}

export interface Grupo {
  nome: string;
  /** Índices da primeira e da última coluna do grupo. */
  de: number;
  ate: number;
}

export interface OpcoesColunas {
  id: string;
  titulo: string;
  descricao: string;
  colunas: Coluna[];
  grupos: Grupo[];
}

const L = 360;
const A = 250;
const M = { topo: 20, base: 40, lado: 16 }; // lado: espaço para o rótulo da primeira e da última coluna

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function colunas({ id, titulo, descricao, colunas, grupos }: OpcoesColunas): string {
  const max = Math.max(...colunas.map((c) => c.valor));
  const util = A - M.topo - M.base;
  const passo = (L - 2 * M.lado) / colunas.length;
  const largura = Math.max(2, passo * 0.7);
  const base = A - M.base;
  const centro = (i: number) => M.lado + passo * i + passo / 2;

  const topo = (i: number) => base - ((colunas[i]?.valor ?? 0) / max) * util;
  const partes = colunas.map((c, i) => {
    const h = (c.valor / max) * util;
    const x = centro(i) - largura / 2;
    const y = base - h;
    // O valor fica acima da coluna mais alta entre ela e as vizinhas, para não encostar nelas.
    const yValor = Math.min(y, topo(i - 1), topo(i + 1)) - 5;
    const anim = `style="--i:${i};--h:${h.toFixed(1)}px"`;
    return (
      `<rect class="barra" ${anim} x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${largura.toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${c.cor}"/>` +
      (c.rotulo
        ? `<text class="valor" ${anim} x="${centro(i).toFixed(1)}" y="${yValor.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--cp-color-on-surface)">${esc(c.rotulo)}</text>`
        : '')
    );
  });

  grupos.forEach((g, k) => {
    const meio = (centro(g.de) + centro(g.ate)) / 2;
    const y = base + 16 + (k % 2) * 14;
    partes.push(
      `<line x1="${(centro(g.de) - largura / 2).toFixed(1)}" x2="${(centro(g.ate) + largura / 2).toFixed(1)}" y1="${base + 5}" y2="${base + 5}" stroke="var(--cp-color-outline)" stroke-width="1"/>`,
      `<text x="${meio.toFixed(1)}" y="${y}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--cp-color-on-surface-variant)">${esc(g.nome)}</text>`,
    );
  });
  partes.push(`<line x1="${M.lado}" x2="${L - M.lado}" y1="${base}" y2="${base}" stroke="var(--cp-color-outline)" stroke-width="1"/>`);

  return (
    `<svg viewBox="0 0 ${L} ${A}" role="img" aria-labelledby="${id}-t ${id}-d" font-family="var(--cp-font)" class="grafico">` +
    `<title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(descricao)}</desc>` +
    partes.join('') +
    `</svg>`
  );
}
