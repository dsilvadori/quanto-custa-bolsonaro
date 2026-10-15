// Simulador 4 no navegador: valor do benefício e ganho real → perda até o fim do período, gráfico, tabela e compartilhamento.
import { atualizarUrl, escrever, lerDados, validar } from './ui';
import { definirCompartilhamento } from './compartilhar';
import {
  estadoPadraoBeneficio,
  frasesBeneficio,
  graficoBeneficio,
  linhasProjecao,
  type DadosBeneficio,
} from '../simuladores/beneficio';
import { lerNumero, pct } from '../formato';

const { dados, urlFontes } = lerDados<{ dados: DadosBeneficio; urlFontes: string }>('dados-beneficio');
const estado = estadoPadraoBeneficio(dados);
const MAXIMO = 100_000;
const valor = document.getElementById('valor') as HTMLInputElement;
const ganho = document.getElementById('ganho') as HTMLInputElement;
const ajudaValor = document.getElementById(valor.getAttribute('aria-describedby')!)!.textContent!;

// Link compartilhado: ?valor=1800&ganho=1.2
const params = new URLSearchParams(location.search);
const valorUrl = lerNumero(params.get('valor') ?? '');
if (valorUrl > 0 && valorUrl <= MAXIMO) estado.valor = valorUrl;
const ganhoUrl = Number(params.get('ganho'));
if (ganhoUrl >= dados.ganhoMin && ganhoUrl <= dados.ganhoMax) estado.ganho = Math.round(ganhoUrl * 10) / 10;

function mostrar() {
  const f = frasesBeneficio(dados, estado);
  escrever({
    futuro: f.futuro,
    porMesFinal: f.porMesFinal,
    total: f.total,
    perdaPct: f.perdaPct,
    retro: f.retro,
    retroPorMes: f.retroPorMes,
    retroAcumulada: f.retroAcumulada,
    ganho: pct(estado.ganho, 1),
  });
  document.querySelector('[data-grafico]')!.innerHTML = graficoBeneficio(dados, estado);
  document.querySelector('[data-linhas]')!.innerHTML = linhasProjecao(dados, estado);
  ganho.setAttribute('aria-valuetext', `${pct(estado.ganho, 1)} ao ano`);

  const url = atualizarUrl({
    valor: estado.valor === dados.piso ? null : String(estado.valor),
    ganho: estado.ganho === dados.ganhoMin ? null : String(estado.ganho),
  });
  definirCompartilhamento({ texto: f.whatsapp(url), url, titulo: document.title, cartao: { ...f.cartao, url: urlFontes } });
}

valor.addEventListener('input', () => {
  const v = lerNumero(valor.value);
  if (!(v > 0 && v <= MAXIMO)) {
    validar(valor, 'Digite o valor que você recebe por mês, como 1.621 ou 2.300,50.', ajudaValor);
    return;
  }
  validar(valor, v < dados.piso ? `Nenhum benefício é menor que o piso. Usamos ${dados.piso.toLocaleString('pt-BR')}.` : null, ajudaValor);
  valor.removeAttribute('aria-invalid');
  estado.valor = v;
  mostrar();
});

ganho.addEventListener('input', () => {
  estado.ganho = Number(ganho.value);
  mostrar();
});

valor.value = estado.valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
ganho.value = String(estado.ganho);
mostrar();
