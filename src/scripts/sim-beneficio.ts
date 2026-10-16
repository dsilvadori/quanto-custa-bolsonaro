// Simulador 4 no navegador: BPC ou aposentadoria e ganho real → perda nos últimos anos e projeção.
import { atualizarUrl, escrever, lerDados, ligarSegmentado } from './ui';
import { definirCompartilhamento } from './compartilhar';
import {
  TIPOS,
  estadoPadraoBeneficio,
  frasesBeneficio,
  graficoProjecao,
  graficoRetro,
  linhasProjecao,
  linhasRetro,
  type DadosBeneficio,
  type Tipo,
} from '../simuladores/beneficio';
import { pct } from '../formato';

const { dados, urlFontes } = lerDados<{ dados: DadosBeneficio; urlFontes: string }>('dados-beneficio');
const padrao = estadoPadraoBeneficio(dados);
const estado = { ...padrao };
const ganho = document.getElementById('ganho') as HTMLInputElement;

// Link compartilhado: ?beneficio=aposentadoria&ganho=1.2
const params = new URLSearchParams(location.search);
const tipoUrl = params.get('beneficio') as Tipo | null;
if (tipoUrl && TIPOS.includes(tipoUrl)) estado.tipo = tipoUrl;
const ganhoUrl = Number(params.get('ganho'));
if (ganhoUrl >= dados.ganhoMin && ganhoUrl <= dados.ganhoMax) estado.ganho = Math.round(ganhoUrl * 10) / 10;

const html = (seletor: string, conteudo: string) => (document.querySelector(seletor)!.innerHTML = conteudo);

function mostrar() {
  const f = frasesBeneficio(dados, estado);
  escrever({
    pagamentos: f.pagamentos,
    retro: f.retro,
    hoje: f.hoje,
    retroPorMes: `−${f.retroPorMes}`,
    retroTotal: `−${f.retroTotal}`,
    futuro: f.futuro,
    porMesFinal: `−${f.porMesFinal}`,
    total: `−${f.total}`,
    perdaPct: `−${f.perdaPct}`,
    ganho: pct(estado.ganho, 1),
  });
  html('[data-grafico="retro"]', graficoRetro(dados, estado));
  html('[data-linhas="retro"]', linhasRetro(dados, estado));
  html('[data-grafico="projecao"]', graficoProjecao(dados, estado));
  html('[data-linhas="projecao"]', linhasProjecao(dados, estado));
  ganho.setAttribute('aria-valuetext', `${pct(estado.ganho, 1)} ao ano`);

  const url = atualizarUrl({
    beneficio: estado.tipo === padrao.tipo ? null : estado.tipo,
    ganho: estado.ganho === padrao.ganho ? null : String(estado.ganho),
  });
  definirCompartilhamento({ texto: f.whatsapp(url), url, titulo: document.title, cartao: { ...f.cartao, url: urlFontes } });
}

const segmentado = ligarSegmentado<Tipo>(
  document.querySelector<HTMLElement>('[data-segmentado="tipo"] [role="radiogroup"]')!,
  TIPOS,
  (tipo) => {
    estado.tipo = tipo;
    mostrar();
  },
);

ganho.addEventListener('input', () => {
  estado.ganho = Number(ganho.value);
  mostrar();
});

ganho.value = String(estado.ganho);
if (estado.tipo !== padrao.tipo) segmentado.selecionar(estado.tipo);
else mostrar();
