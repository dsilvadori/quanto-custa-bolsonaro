// Simulador 5 no navegador: botões − e +, capital, totais, URL e compartilhamento.
import { atualizarUrl, escrever, lerDados } from './ui';
import { definirCompartilhamento } from './compartilhar';
import {
  MEDIA,
  calcularCarrinho,
  codificarItens,
  decodificarItens,
  estadoPadraoCarrinho,
  frasesCarrinho,
  type DadosCarrinho,
} from '../simuladores/carrinho';
import { preco } from '../formato';

const { dados, urlFontes } = lerDados<{ dados: DadosCarrinho; urlFontes: string }>('dados-carrinho');
const lista = document.querySelector<HTMLElement>('[data-carrinho]')!;
const seletor = document.getElementById('capital') as HTMLSelectElement;

// Link compartilhado: ?capital=Recife&itens=arroz:2,gas:1
const params = new URLSearchParams(location.search);
const capitalUrl = params.get('capital');
const capital = capitalUrl && dados.capitais.includes(capitalUrl) ? capitalUrl : MEDIA;
let estado = decodificarItens(dados, estadoPadraoCarrinho(dados, capital), params.get('itens'));

function mostrar() {
  const r = calcularCarrinho(dados, estado);
  for (const l of r.linhas) {
    const li = lista.querySelector<HTMLElement>(`[data-produto="${l.id}"]`)!;
    li.hidden = !l.disponivel;
    if (!l.disponivel) continue;
    li.querySelector('[data-preco]')!.textContent = preco(l.preco);
    li.querySelector('[data-cenario]')!.textContent = preco(l.cenario);
    li.querySelector('[data-qtd]')!.textContent = String(l.qtd);
    li.classList.toggle('produto--fora', l.qtd === 0);
    li.querySelector<HTMLButtonElement>('[data-menos]')!.disabled = l.qtd === 0;
  }
  const f = frasesCarrinho(dados, estado);
  escrever({ resumo: f.resumo, hoje: f.hoje, cenario: f.cenario, diferenca: `${f.diferenca} (${f.pct})` });
  const url = atualizarUrl({ capital: estado.capital === MEDIA ? null : estado.capital, itens: codificarItens(dados, estado) });
  definirCompartilhamento({ texto: f.whatsapp(url), url, titulo: document.title, cartao: { ...f.cartao, url: urlFontes } });
}

lista.addEventListener('click', (e) => {
  const botao = (e.target as Element).closest<HTMLElement>('[data-menos], [data-mais]');
  if (!botao) return;
  const id = botao.dataset.menos ?? botao.dataset.mais!;
  const passo = botao.dataset.menos ? -1 : 1;
  estado = { ...estado, qtd: { ...estado.qtd, [id]: Math.min(99, Math.max(0, (estado.qtd[id] ?? 0) + passo)) } };
  mostrar();
});

seletor.value = estado.capital;
seletor.addEventListener('change', () => {
  // Troca de capital mantém as quantidades; o que não existe lá fica fora do total.
  estado = { ...estado, capital: seletor.value };
  mostrar();
});

mostrar();
