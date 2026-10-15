// Filtro por órgão em /fontes: um chip por vez; "Todos" mostra tudo.
const grupo = document.querySelector<HTMLElement>('[data-filtro-orgaos]');

if (grupo) {
  const chips = [...grupo.querySelectorAll<HTMLButtonElement>('button[data-orgao]')];
  const inicial = chips.find((c) => c.getAttribute('aria-pressed') === 'true')!;
  const outro = chips.find((c) => c !== inicial)!;
  // Classe de selecionado e ícone de check copiados do chip que veio marcado do build.
  const classe = [...inicial.classList].filter((c) => !outro.classList.contains(c));
  const check = inicial.querySelector('svg');
  const fontes = [...document.querySelectorAll<HTMLElement>('[data-registro-fontes] article[data-orgao]')];
  const secoes = [...document.querySelectorAll<HTMLElement>('[data-registro-fontes] > section')];
  const contagem = document.querySelector<HTMLElement>('[data-filtro-contagem]');

  grupo.addEventListener('click', (e) => {
    const chip = (e.target as Element).closest<HTMLButtonElement>('button[data-orgao]');
    if (!chip) return;
    const orgao = chip.dataset.orgao!;
    chips.forEach((c) => {
      const sim = c === chip;
      c.setAttribute('aria-pressed', String(sim));
      classe.forEach((k) => c.classList.toggle(k, sim));
    });
    if (check) chip.prepend(check);
    fontes.forEach((f) => (f.hidden = Boolean(orgao) && f.dataset.orgao !== orgao));
    secoes.forEach((s) => (s.hidden = !s.querySelector('article:not([hidden])')));
    if (contagem) {
      const n = fontes.filter((f) => !f.hidden).length;
      contagem.textContent = `${n} ${n === 1 ? 'fonte' : 'fontes'}${orgao ? ` de ${orgao}` : ''}.`;
    }
  });
}
