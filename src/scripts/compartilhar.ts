// Barra de compartilhar dos simuladores. Cada simulador chama definirCompartilhamento a cada mudança.
import type { DadosCartao } from './cartao';

export interface Compartilhamento {
  /** Texto pronto, já com o link. */
  texto: string;
  url: string;
  titulo: string;
  cartao: DadosCartao;
}

let atual: Compartilhamento | null = null;
const barra = document.querySelector<HTMLElement>('.barra-compartilhar');
const aviso = barra?.querySelector<HTMLElement>('[data-compartilhar-aviso]');

function avisar(texto: string) {
  if (!aviso) return;
  aviso.textContent = texto;
  window.setTimeout(() => aviso.textContent === texto && (aviso.textContent = ''), 4000);
}

export function definirCompartilhamento(c: Compartilhamento) {
  atual = c;
  const wa = barra?.querySelector<HTMLAnchorElement>('[data-compartilhar="whatsapp"]');
  if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(c.texto)}`;
}

async function copiar(texto: string, sucesso: string) {
  try {
    await navigator.clipboard.writeText(texto);
    avisar(sucesso);
  } catch {
    avisar('Não foi possível copiar. Copie o endereço na barra do navegador.');
  }
}

async function compartilharLink(c: Compartilhamento) {
  if (navigator.share) {
    try {
      await navigator.share({ title: c.titulo, text: c.texto, url: c.url });
    } catch {
      // A pessoa fechou a janela de compartilhar: nada a fazer.
    }
    return;
  }
  await copiar(c.url, 'Link copiado.');
}

async function compartilharImagem(c: Compartilhamento) {
  avisar('Gerando a imagem…');
  // Só carrega o gerador do cartão quando alguém pede a imagem.
  const { gerarCartao } = await import('./cartao');
  const png = await gerarCartao(c.cartao);
  const arquivo = new File([png], 'quanto-custa.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], text: c.texto });
      avisar('');
    } catch {
      avisar('');
    }
    return;
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(png);
  link.download = arquivo.name;
  link.click();
  URL.revokeObjectURL(link.href);
  avisar('Imagem baixada.');
}

barra?.addEventListener('click', (e) => {
  const botao = (e.target as Element).closest<HTMLElement>('[data-compartilhar]');
  if (!botao || !atual) return;
  const acao = botao.dataset.compartilhar;
  if (acao === 'link') compartilharLink(atual);
  if (acao === 'imagem') compartilharImagem(atual).catch(() => avisar('Não foi possível gerar a imagem.'));
});
