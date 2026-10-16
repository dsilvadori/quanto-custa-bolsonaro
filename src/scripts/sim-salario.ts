// Simulador 1 no navegador: lê os campos, refaz as contas e atualiza números, gráfico, URL e compartilhamento.
import { atualizarUrl, escrever, lerDados, validar } from './ui';
import { definirCompartilhamento } from './compartilhar';
import { ESTADO_PADRAO, calcularSalario, frasesSalario, graficoSalario, type DadosSalario } from '../simuladores/salario';
import { lerNumero, reais } from '../formato';

const { dados, urlFontes } = lerDados<{ dados: DadosSalario; urlFontes: string }>('dados-salario');
const estado = { ...ESTADO_PADRAO };
const AJUDA = 'Ex.: 1, 1,5 ou 2';
const MAXIMO = 100;

// Link compartilhado: ?salarios=2
const params = new URLSearchParams(location.search);
const deUrl = lerNumero(params.get('salarios') ?? '');
if (deUrl > 0 && deUrl <= MAXIMO) estado.quantidade = deUrl;

const input = document.getElementById('salarios') as HTMLInputElement;
const grafico = document.querySelector<HTMLElement>('[data-grafico]')!;

function mostrar() {
  const r = calcularSalario(dados, estado);
  const f = frasesSalario(dados, estado);
  const tabela: Record<string, string> = {};
  for (const a of r.anos) {
    tabela[`cen-${a.ano}`] = reais(a.cenario);
    tabela[`dif-${a.ano}`] = reais(a.real - a.cenario);
  }
  escrever({ perda: f.perda, porMes: f.porMes, porAno: f.porAno, acumulada: f.acumulada, resumo: f.resumo, ...tabela });
  grafico.innerHTML = graficoSalario(dados, estado);

  const url = atualizarUrl({ salarios: estado.quantidade === 1 ? null : String(estado.quantidade) });
  definirCompartilhamento({ texto: f.whatsapp(url), url, titulo: document.title, cartao: { ...f.cartao, url: urlFontes } });
}

input.addEventListener('input', () => {
  const v = lerNumero(input.value);
  if (!(v > 0 && v <= MAXIMO)) {
    validar(input, `Digite quantos salários você ganha, entre 0 e ${MAXIMO}. Ex.: 1 ou 1,5.`, AJUDA);
    return;
  }
  validar(input, null, AJUDA);
  estado.quantidade = v;
  mostrar();
});

input.value = estado.quantidade.toLocaleString('pt-BR');
mostrar();
