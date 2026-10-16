// Simulador 3 no navegador: tamanho do tanque → tanque cheio hoje e com o PPI; compartilhamento.
import { escrever, lerDados, validar } from './ui';
import { definirCompartilhamento, type Compartilhamento } from './compartilhar';
import { gastoMensal, tanqueCheio, type LinhaCombustivel } from '../simuladores/combustivel';
import { lerNumero, preco } from '../formato';

const c = lerDados<Omit<Compartilhamento, 'titulo'>>('dados-combustivel');
definirCompartilhamento({ ...c, titulo: document.title });

const tanques = lerDados<{ id: string; linha: LinhaCombustivel }[]>('dados-tanques');
const MAXIMO = 2000;

for (const { id, linha } of tanques) {
  const input = document.getElementById(`litros-${id}`) as HTMLInputElement | null;
  if (!input) continue;
  const ajuda = document.getElementById(input.getAttribute('aria-describedby') ?? '')?.textContent ?? '';
  input.addEventListener('input', () => {
    const litros = lerNumero(input.value);
    if (!(litros > 0 && litros <= MAXIMO)) {
      validar(input, `Digite quantos litros cabem no tanque, de 1 a ${MAXIMO}.`, ajuda);
      return;
    }
    validar(input, null, ajuda);
    const t = tanqueCheio(linha, litros);
    escrever({
      [`frase-${id}`]: `Tanque de ${litros.toLocaleString('pt-BR')} litros: ${preco(t.hoje)} no governo Lula e ${preco(t.comPpi)} com o PPI do governo do Bolsonaro.`,
      [`hoje-${id}`]: preco(t.hoje),
      [`ppi-${id}`]: preco(t.comPpi),
      [`dif-${id}`]: `+${preco(t.diferenca)}`,
    });
  });
}

// Motorista de aplicativo: km por mês e km por litro → gasto por mês hoje e com o PPI.
const app = lerDados<{ linha: LinhaCombustivel; pico: number | null }>('dados-aplicativo');
const kmMes = document.getElementById('km-mes') as HTMLInputElement | null;
const kmLitro = document.getElementById('km-litro') as HTMLInputElement | null;
if (kmMes && kmLitro) {
  const ajudaMes = document.getElementById(kmMes.getAttribute('aria-describedby') ?? '')?.textContent ?? '';
  const ajudaLitro = document.getElementById(kmLitro.getAttribute('aria-describedby') ?? '')?.textContent ?? '';
  const atualizar = () => {
    const km = lerNumero(kmMes.value);
    const porLitro = lerNumero(kmLitro.value);
    const kmOk = km > 0 && km <= 20000;
    const litroOk = porLitro >= 2 && porLitro <= 40;
    validar(kmMes, kmOk ? null : 'Digite quantos km você roda por mês, de 1 a 20.000.', ajudaMes);
    validar(kmLitro, litroOk ? null : 'Digite quantos km o carro faz por litro, de 2 a 40.', ajudaLitro);
    if (!kmOk || !litroOk) return;
    const g = gastoMensal(app.linha, km, porLitro);
    escrever({
      'app-frase': `Rodando ${km.toLocaleString('pt-BR')} km por mês a ${porLitro.toLocaleString('pt-BR')} km por litro, são ${g.litros.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} litros de gasolina: ${preco(g.hoje)} no governo Lula e ${preco(g.comPpi)} com o PPI do governo do Bolsonaro.`,
      'app-dif': `+${preco(g.diferenca)}`,
      'app-ano': `+${preco(g.porAno)}`,
      'app-ppi': preco(g.comPpi),
      ...(app.pico !== null ? { 'app-pico': `+${preco(g.litros * app.pico)}` } : {}),
    });
  };
  kmMes.addEventListener('input', atualizar);
  kmLitro.addEventListener('input', atualizar);
}
