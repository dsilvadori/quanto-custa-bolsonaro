// Gráfico de barras agrupadas em SVG, sem biblioteca. Roda no build e no navegador.
// Cores e fonte vêm dos tokens do DS (var(--cp-...)), então o SVG precisa estar inline no HTML.

export interface Serie {
  nome: string;
  /** Token do DS, ex.: "var(--cp-color-primary)". */
  cor: string;
  /** Cor de cada barra, quando a série não tem uma cor só. */
  cores?: string[];
  valores: number[];
}

export interface OpcoesBarras {
  id: string;
  titulo: string;
  descricao: string;
  categorias: string[];
  series: Serie[];
  rotulo: (valor: number) => string;
}

const L = 360; // viewBox pensado para 360 px: 1 unidade ≈ 1 px no celular
const A = 240;
const M = { topo: 24, base: 28, lado: 8 };

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function barras({ id, titulo, descricao, categorias, series, rotulo }: OpcoesBarras): string {
  const max = Math.max(...series.flatMap((s) => s.valores));
  const alturaUtil = A - M.topo - M.base;
  const grupo = (L - 2 * M.lado) / categorias.length;
  const vao = 6;
  const largura = Math.min(40, (grupo - 16 - vao * (series.length - 1)) / series.length);
  const larguraGrupo = largura * series.length + vao * (series.length - 1);

  const partes: string[] = [];
  categorias.forEach((cat, i) => {
    const x0 = M.lado + grupo * i + (grupo - larguraGrupo) / 2;
    series.forEach((s, j) => {
      const v = s.valores[i];
      if (v === undefined || Number.isNaN(v)) return;
      const h = (v / max) * alturaUtil;
      const x = x0 + j * (largura + vao);
      const y = A - M.base - h;
      partes.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${largura.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${s.cores?.[i] ?? s.cor}"/>`,
        `<text x="${(x + largura / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--cp-color-on-surface)">${esc(rotulo(v))}</text>`,
      );
    });
    partes.push(
      `<text x="${(M.lado + grupo * i + grupo / 2).toFixed(1)}" y="${A - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--cp-color-on-surface-variant)">${esc(cat)}</text>`,
    );
  });
  partes.push(`<line x1="${M.lado}" x2="${L - M.lado}" y1="${A - M.base}" y2="${A - M.base}" stroke="var(--cp-color-outline)" stroke-width="1"/>`);

  return (
    `<svg viewBox="0 0 ${L} ${A}" role="img" aria-labelledby="${id}-t ${id}-d" font-family="var(--cp-font)" class="grafico">` +
    `<title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(descricao)}</desc>` +
    partes.join('') +
    `</svg>`
  );
}
