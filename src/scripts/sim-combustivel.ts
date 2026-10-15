// Simulador 3 no navegador: tamanho do tanque → tanque cheio hoje e com o PPI; compartilhamento.
import { escrever, lerDados, validar } from './ui';
import { definirCompartilhamento, type Compartilhamento } from './compartilhar';
import { tanqueCheio, type LinhaCombustivel } from '../simuladores/combustivel';
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
      [`frase-${id}`]: `Tanque de ${litros.toLocaleString('pt-BR')} litros: ${preco(t.hoje)} hoje e ${preco(t.comPpi)} com o PPI.`,
      [`hoje-${id}`]: preco(t.hoje),
      [`ppi-${id}`]: preco(t.comPpi),
      [`dif-${id}`]: `+${preco(t.diferenca)}`,
    });
  });
}
