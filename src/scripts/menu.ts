// Abre e fecha o menu do TopNavigation no celular, sem React no navegador.
const botao = document.querySelector<HTMLButtonElement>('header button[aria-controls]');
const menu = botao && document.getElementById(botao.getAttribute('aria-controls')!);

if (botao && menu) {
  botao.addEventListener('click', () => {
    const abrir = menu.hidden;
    menu.hidden = !abrir;
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
}
