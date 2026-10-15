// Simulador 2 no navegador: capital e ritmo de alta → valor da cesta, gráfico e compartilhamento.
import { atualizarUrl, escrever, lerDados, ligarSegmentado } from './ui';
import { definirCompartilhamento } from './compartilhar';
import { ESTADO_PADRAO_CESTA, MEDIA, RITMOS, frasesCesta, graficoCapitais, graficoCesta, type DadosCesta, type Ritmo } from '../simuladores/cesta';

const { dados, urlFontes } = lerDados<{ dados: DadosCesta; urlFontes: string }>('dados-cesta');
const estado = { ...ESTADO_PADRAO_CESTA };
const seletor = document.getElementById('capital') as HTMLSelectElement;

// Link compartilhado: ?capital=Recife&ritmo=75
const params = new URLSearchParams(location.search);
const capitalUrl = params.get('capital');
if (capitalUrl && dados.capitais.some((c) => c.nome === capitalUrl)) estado.capital = capitalUrl;
const ritmoUrl = params.get('ritmo') as Ritmo | null;
if (ritmoUrl && RITMOS.includes(ritmoUrl)) estado.ritmo = ritmoUrl;

function mostrar() {
  const f = frasesCesta(dados, estado);
  escrever({ resumo: f.resumo, cenario: f.cenario, porMes: `+${f.porMes}`, porAno: `+${f.porAno}`, pesoTexto: f.pesoTexto });
  document.querySelector('[data-grafico]')!.innerHTML = graficoCesta(dados, estado);
  document.querySelector('[data-grafico="capitais"]')!.innerHTML = graficoCapitais(dados, estado);
  const url = atualizarUrl({
    capital: estado.capital === MEDIA ? null : estado.capital,
    ritmo: estado.ritmo === '100' ? null : estado.ritmo,
  });
  definirCompartilhamento({ texto: f.whatsapp(url), url, titulo: document.title, cartao: { ...f.cartao, url: urlFontes } });
}

seletor.value = estado.capital;
seletor.addEventListener('change', () => {
  estado.capital = seletor.value;
  mostrar();
});

const segmentado = ligarSegmentado<Ritmo>(
  document.querySelector<HTMLElement>('[data-segmentado="ritmo"] [role="radiogroup"]')!,
  RITMOS,
  (ritmo) => {
    estado.ritmo = ritmo;
    mostrar();
  },
);

if (estado.ritmo !== '100') segmentado.selecionar(estado.ritmo);
else mostrar();
