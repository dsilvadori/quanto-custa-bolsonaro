// Simulador 5 no navegador: botões − e +, capital, totais, URL e compartilhamento.
import { atualizarUrl, escrever, lerDados } from './ui';
import { definirCompartilhamento } from './compartilhar';
import {
  MEDIA,
  calcularCarrinho,
  codificarItens,
  decodificarItens,
  estadoFamilia,
  estadoPadraoCarrinho,
  estadoVazio,
  frasesCarrinho,
  passo,
  qtdTexto,
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
    li.querySelector('[data-qtd]')!.textContent = qtdTexto(l.qtd);
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
  estado = { ...estado, qtd: { ...estado.qtd, [id]: passo(estado.qtd[id] ?? 0, botao.dataset.menos ? -1 : 1) } };
  mostrar();
});

// Atalhos: compra da quinzena (padrão) ou do mês de uma família de 4 (DIEESE), ou carrinho vazio.
document.querySelector('.atalhos')?.addEventListener('click', (e) => {
  const acao = (e.target as Element).closest<HTMLElement>('[data-atalho]')?.dataset.atalho;
  if (!acao) return;
  const gerar = { quinzena: estadoPadraoCarrinho, mes: estadoFamilia, vazio: estadoVazio }[acao];
  if (gerar) {
    estado = gerar(dados, estado.capital);
    mostrar();
  }
});

seletor.value = estado.capital;
seletor.addEventListener('change', () => {
  // Itens que a pessoa não mexeu seguem a compra da família na nova capital (as quantidades variam por região);
  // os que ela mudou ficam como estão.
  const antes = estadoPadraoCarrinho(dados, estado.capital).qtd;
  const depois = estadoPadraoCarrinho(dados, seletor.value).qtd;
  const qtd = Object.fromEntries(Object.keys(depois).map((id) => [id, estado.qtd[id] === antes[id] ? depois[id] : estado.qtd[id]]));
  estado = { capital: seletor.value, qtd };
  mostrar();
});

mostrar();
