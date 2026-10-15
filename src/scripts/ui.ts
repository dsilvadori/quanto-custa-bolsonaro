// Ajudas para dar vida aos componentes do DS renderizados no build.

// Os formulários dos simuladores calculam ao digitar; Enter não deve recarregar a página.
document.getElementById('form-simulador')?.addEventListener('submit', (e) => e.preventDefault());

/** Lê o JSON que a página deixou em <script type="application/json" id="...">. */
export function lerDados<T>(id: string): T {
  return JSON.parse(document.getElementById(id)!.textContent!) as T;
}

/**
 * SegmentedButton do DS sem React: marca a opção escolhida (aria-checked, tabindex, a classe
 * de selecionado e o ícone de check, copiados do botão que veio selecionado do build) e
 * aceita setas do teclado. `valores` segue a ordem das opções.
 */
export function ligarSegmentado<T extends string>(grupo: HTMLElement, valores: T[], aoMudar: (valor: T) => void) {
  const botoes = [...grupo.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
  const inicial = botoes.find((b) => b.getAttribute('aria-checked') === 'true')!;
  const outro = botoes.find((b) => b !== inicial)!;
  const classeSelecionado = [...inicial.classList].filter((c) => !outro.classList.contains(c));
  const check = inicial.querySelector('svg');

  const selecionar = (i: number, focar = false) => {
    botoes.forEach((b, j) => {
      const sim = i === j;
      b.setAttribute('aria-checked', String(sim));
      b.tabIndex = sim ? 0 : -1;
      classeSelecionado.forEach((c) => b.classList.toggle(c, sim));
    });
    if (check) botoes[i].prepend(check);
    if (focar) botoes[i].focus();
    aoMudar(valores[i]);
  };

  botoes.forEach((b, i) => {
    b.addEventListener('click', () => selecionar(i));
    b.addEventListener('keydown', (e) => {
      const passo = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!passo) return;
      e.preventDefault();
      selecionar((i + passo + botoes.length) % botoes.length, true);
    });
  });

  return { selecionar: (valor: T) => selecionar(valores.indexOf(valor)) };
}

/** Troca o texto de todos os elementos [data-saida="nome"]. */
export function escrever(saidas: Record<string, string>) {
  for (const [nome, texto] of Object.entries(saidas)) {
    document.querySelectorAll(`[data-saida="${nome}"]`).forEach((el) => (el.textContent = texto));
  }
}

/** Atualiza a URL (sem recarregar) para o link compartilhado abrir a mesma simulação. */
export function atualizarUrl(params: Record<string, string | null>): string {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  history.replaceState(null, '', url);
  return url.href;
}

/** Marca o campo como inválido com uma mensagem que diz o que fazer, ou limpa. */
export function validar(input: HTMLInputElement, mensagem: string | null, ajudaPadrao: string) {
  const ajuda = input.getAttribute('aria-describedby');
  const p = ajuda ? document.getElementById(ajuda)?.querySelector('span') : null;
  if (mensagem) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  if (p) p.textContent = mensagem ?? ajudaPadrao;
}
