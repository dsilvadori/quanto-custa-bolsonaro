// Abre o painel da fonte ao tocar num selo <Fonte>. Sem suporte a <dialog>, o selo segue como link para /fontes#id.
const painel = document.getElementById('painel-fonte') as HTMLDialogElement | null;

if (painel && typeof painel.showModal === 'function') {
  let dados: DOMStringMap = {};
  const campo = (nome: string) => painel.querySelector<HTMLElement>(`[data-campo="${nome}"]`)!;
  const link = (nome: string) => painel.querySelector<HTMLAnchorElement>(`[data-link="${nome}"]`)!;

  document.addEventListener('click', (e) => {
    const selo = (e.target as Element).closest<HTMLAnchorElement>('a[data-fonte]');
    if (!selo) return;
    e.preventDefault();
    dados = selo.dataset;
    campo('orgao').textContent = dados.orgao ?? '';
    campo('titulo').textContent = dados.titulo ?? '';
    campo('publicacao').textContent = dados.publicacao || 'em atualização';
    campo('valor').textContent = dados.valor ?? '';
    campo('aviso').textContent = '';
    link('url').href = dados.url ?? '';
    painel.showModal();
  });

  painel.addEventListener('click', (e) => {
    const alvo = e.target as Element;
    // Toque fora do conteúdo (no fundo) também fecha.
    if (alvo === painel || alvo.closest('[data-fechar]')) painel.close();
    if (alvo.closest('[data-copiar]')) {
      const texto = `${dados.titulo}. ${dados.orgao}${dados.publicacao ? `, ${dados.publicacao}` : ''}. ${dados.url}`;
      const falhou = () => (campo('aviso').textContent = 'Não foi possível copiar. Toque em "Abrir fonte" e copie o endereço.');
      if (!navigator.clipboard) falhou();
      else navigator.clipboard.writeText(texto).then(() => (campo('aviso').textContent = 'Fonte copiada.'), falhou);
    }
  });
}
