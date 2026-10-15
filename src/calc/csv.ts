/** CSV simples (vírgula, primeira linha de cabeçalho, sem aspas). Células vazias viram null. */
export function lerCsv(texto: string): Record<string, string | null>[] {
  const linhas = texto.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
  const [cabecalho, ...dados] = linhas;
  const colunas = cabecalho.split(',').map((c) => c.trim());
  return dados.map((linha, i) => {
    const celulas = linha.split(',');
    if (celulas.length !== colunas.length) {
      throw new Error(`CSV: linha ${i + 2} tem ${celulas.length} colunas, esperado ${colunas.length}`);
    }
    return Object.fromEntries(colunas.map((c, j) => [c, celulas[j].trim() || null]));
  });
}
