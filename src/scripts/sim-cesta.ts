// Simulador 2 no navegador: ritmo de alta (100%, 75%, 50%) → horas de trabalho, gráfico e compartilhamento.
import { atualizarUrl, escrever, lerDados, ligarSegmentado } from './ui';
import { definirCompartilhamento } from './compartilhar';
import { RITMOS, frasesCesta, graficoCesta, type DadosCesta, type Ritmo } from '../simuladores/cesta';

const { dados, urlFontes } = lerDados<{ dados: DadosCesta; urlFontes: string }>('dados-cesta');
const param = new URLSearchParams(location.search).get('ritmo') as Ritmo | null;
let ritmo: Ritmo = param && RITMOS.includes(param) ? param : '100';

function mostrar() {
  const f = frasesCesta(dados, ritmo);
  escrever({ resumo: f.resumo, horas: f.horas, extra: `+${f.extra}`, comida: `+${f.comida}` });
  document.querySelector('[data-grafico]')!.innerHTML = graficoCesta(dados, ritmo);
  const url = atualizarUrl({ ritmo: ritmo === '100' ? null : ritmo });
  definirCompartilhamento({ texto: f.whatsapp(url), url, titulo: document.title, cartao: { ...f.cartao, url: urlFontes } });
}

const segmentado = ligarSegmentado<Ritmo>(
  document.querySelector<HTMLElement>('[data-segmentado="ritmo"] [role="radiogroup"]')!,
  RITMOS,
  (valor) => {
    ritmo = valor;
    mostrar();
  },
);

if (ritmo !== '100') segmentado.selecionar(ritmo);
else mostrar();
