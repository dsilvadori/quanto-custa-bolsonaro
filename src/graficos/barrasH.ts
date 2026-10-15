// Barras horizontais em SVG (uma por linha), com valores positivos e negativos em lados opostos do zero.
// Roda no build e no navegador. Cores e fonte vêm dos tokens do DS.

export interface LinhaH {
  rotulo: string;
  valor: number;
  /** Texto do valor ao lado da barra (ex.: "+38,2%"). */
  texto: string;
  /** Destaque (barra na cor primária); as outras ficam na cor secundária. */
  destaque?: boolean;
}

export interface OpcoesBarrasH {
  id: string;
  titulo: string;
  descricao: string;
  linhas: LinhaH[];
  /** Cor das barras negativas (padrão: tertiary, azul). */
  corNegativa?: string;
}

const L = 360;
const ALTURA_LINHA = 30;
const ROTULO = 128; // largura reservada para o nome
const TEXTO = 58; // largura reservada para o valor

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function barrasH({ id, titulo, descricao, linhas, corNegativa = 'var(--cp-color-tertiary)' }: OpcoesBarrasH): string {
  const A = linhas.length * ALTURA_LINHA + 8;
  const max = Math.max(...linhas.map((l) => Math.max(l.valor, 0)), 0);
  const min = Math.min(...linhas.map((l) => Math.min(l.valor, 0)), 0);
  const area = L - ROTULO - TEXTO * (min < 0 ? 2 : 1);
  const escala = area / (max - min || 1);
  const zero = ROTULO + (min < 0 ? TEXTO : 0) + -min * escala;

  const partes = linhas.map((l, i) => {
    const y = 4 + i * ALTURA_LINHA;
    const meio = y + ALTURA_LINHA / 2;
    const w = Math.abs(l.valor) * escala;
    const x = l.valor >= 0 ? zero : zero - w;
    const cor = l.valor < 0 ? corNegativa : l.destaque ? 'var(--cp-color-primary)' : 'var(--cp-color-on-surface-variant)';
    const tx = l.valor >= 0 ? x + w + 6 : x - 6;
    return (
      `<text x="${ROTULO - 8}" y="${meio + 4}" text-anchor="end" font-size="12" font-weight="700" fill="var(--cp-color-on-surface)">${esc(l.rotulo)}</text>` +
      `<rect x="${x.toFixed(1)}" y="${(y + 6).toFixed(1)}" width="${Math.max(w, 1).toFixed(1)}" height="${ALTURA_LINHA - 12}" rx="3" fill="${cor}"/>` +
      `<text x="${tx.toFixed(1)}" y="${meio + 4}" text-anchor="${l.valor >= 0 ? 'start' : 'end'}" font-size="12" font-weight="800" fill="var(--cp-color-on-surface)">${esc(l.texto)}</text>`
    );
  });

  return (
    `<svg viewBox="0 0 ${L} ${A}" role="img" aria-labelledby="${id}-t ${id}-d" font-family="var(--cp-font)" class="grafico">` +
    `<title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(descricao)}</desc>` +
    `<line x1="${zero.toFixed(1)}" x2="${zero.toFixed(1)}" y1="0" y2="${A}" stroke="var(--cp-color-outline)" stroke-width="1"/>` +
    partes.join('') +
    `</svg>`
  );
}
