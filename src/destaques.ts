// Número principal de cada simulador, para os cartões da Início e de "Veja também".
import { CARRINHO, CESTA, COMBUSTIVEIS, DADOS_BENEFICIO, DADOS_CARRINHO, DADOS_CESTA, DADOS_SALARIO, INPC_ANUAL, MINIMO_ATUAL } from './dados';
import { ESTADO_PADRAO, calcularSalario } from './simuladores/salario';
import { ESTADO_PADRAO_CESTA, calcularCesta } from './simuladores/cesta';
import { calcularCarrinho, estadoPadraoCarrinho } from './simuladores/carrinho';
import { calcularCombustivel } from './simuladores/combustivel';
import { estadoPadraoBeneficio, calcularBeneficio } from './simuladores/beneficio';
import { preco, reais } from './formato';
import type { PaginaId } from './site';

export interface Destaque {
  numero: string;
  texto: string;
  fonte: string;
}

const s = calcularSalario(DADOS_SALARIO, ESTADO_PADRAO);
const c = calcularCesta(DADOS_CESTA, ESTADO_PADRAO_CESTA);
const car = calcularCarrinho(DADOS_CARRINHO, estadoPadraoCarrinho(DADOS_CARRINHO));
const diesel = COMBUSTIVEIS.find((x) => x.combustivel === 'diesel')!;
const b = calcularBeneficio(DADOS_BENEFICIO, estadoPadraoBeneficio(DADOS_BENEFICIO)).retro;

export const DESTAQUES: Partial<Record<PaginaId, Destaque>> = {
  salarioMinimo: { numero: `−${reais(s.porMes)}`, texto: 'por mês para quem ganha 1 salário mínimo', fonte: MINIMO_ATUAL.fonte },
  cestaBasica: { numero: `+${reais(c.porMes)}`, texto: 'por mês na cesta básica, na média das capitais', fonte: CESTA.fonteValores },
  carrinho: { numero: `+${reais(car.diferenca)}`, texto: 'por mês na compra de uma família de 4 pessoas', fonte: CARRINHO.fontesPreco[0] },
  combustivel: { numero: `+${preco(calcularCombustivel(diesel).aumento)}`, texto: 'no litro do diesel com o PPI', fonte: diesel.fontes.defasagem },
  aposentadoriaBpc: { numero: `−${reais(b.porMes)}`, texto: 'por mês no BPC desvinculado desde 2023', fonte: INPC_ANUAL[0].fonte },
};
