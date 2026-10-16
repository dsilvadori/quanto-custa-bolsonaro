// Barras horizontais em lista (estilo ranking), em SVG. Roda no build e no navegador.
// Cada linha: nome à esquerda e valor à direita; embaixo, a barra sobre um trilho; e, se houver, um detalhe (ex.: os preços).
// Cores e fonte vêm dos tokens do DS.

export interface LinhaH {
  rotulo: string;
  valor: number;
  /** Texto do valor à direita (ex.: "+38%"). */
  texto: string;
  /** Destaque na cor primária (padrão). Com `false`, a barra fica cinza. */
  destaque?: boolean;
  /** Linha embaixo da barra (ex.: "Lula R$ 4,99 → Bolsonaro R$ 7,33 (kg)"). */
  detalhe?: string;
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
const NOME = 14; // altura da linha do nome
const BARRA = 10;
const DETALHE = 16;
const ESPACO = 14;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function barrasH({ id, titulo, descricao, linhas, corNegativa = 'var(--cp-color-tertiary)' }: OpcoesBarrasH): string {
  const comDetalhe = linhas.some((l) => l.detalhe);
  const altura = NOME + 6 + BARRA + (comDetalhe ? DETALHE : 0) + ESPACO;
  const A = linhas.length * altura;
  const max = Math.max(...linhas.map((l) => Math.abs(l.valor)), 1);

  const partes = linhas.map((l, i) => {
    const y = i * altura;
    const yBarra = y + NOME + 6;
    const w = (Math.abs(l.valor) / max) * L;
    const cor = l.valor < 0 ? corNegativa : l.destaque === false ? 'var(--cp-color-on-surface-variant)' : 'var(--cp-color-primary)';
    return (
      `<text x="0" y="${y + NOME - 2}" font-size="13" font-weight="800" fill="var(--cp-color-on-surface)">${esc(l.rotulo)}</text>` +
      `<text x="${L}" y="${y + NOME - 2}" text-anchor="end" font-size="13" font-weight="800" fill="${cor}">${esc(l.texto)}</text>` +
      `<rect x="0" y="${yBarra}" width="${L}" height="${BARRA}" rx="${BARRA / 2}" fill="var(--cp-color-surface-container)"/>` +
      `<rect x="0" y="${yBarra}" width="${Math.max(w, BARRA).toFixed(1)}" height="${BARRA}" rx="${BARRA / 2}" fill="${cor}"/>` +
      (l.detalhe
        ? `<text x="0" y="${yBarra + BARRA + 13}" font-size="11" font-weight="700" fill="var(--cp-color-on-surface-variant)">${esc(l.detalhe)}</text>`
        : '')
    );
  });

  return (
    `<svg viewBox="0 0 ${L} ${A}" role="img" aria-labelledby="${id}-t ${id}-d" font-family="var(--cp-font)" class="grafico">` +
    `<title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(descricao)}</desc>` +
    partes.join('') +
    `</svg>`
  );
}
