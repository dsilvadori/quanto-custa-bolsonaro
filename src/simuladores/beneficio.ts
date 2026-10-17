// Simulador 4: o que a página mostra. Usado no build e no navegador.
import { cestasComAlta, desvincularDesde, perdaPercentual, poderDeCompra, projetarDesvinculacao, type Pagamentos } from '../calc/beneficio';
import type { Vigencia } from '../calc/salarioMinimo';
import { barras } from '../graficos/barras';
import { COR_BOLSONARO, COR_LULA } from '../graficos/cores';
import { numero, pct, reais } from '../formato';

export interface DadosBeneficio {
  /** Vigências do salário mínimo (= piso). */
  real: Vigencia[];
  /** Último ano antes da desvinculação (o piso parte do mínimo de dezembro desse ano). */
  anoBase: number;
  /** INPC do ano anterior, em %, por ano em que seria aplicado. */
  inpcPorAno: Record<number, number>;
  piso: number;
  anoAtual: number;
  ateAno: number;
  /** Limites de ganho real do mínimo, em % ao ano (LC 200/2023 e Lei 15.077/2024). */
  ganhoMin: number;
  ganhoMax: number;
  /** Inflação da projeção, em % ao ano: média do INPC dos anos em `inpcPorAno`. */
  inflacao: number;
  /** Valor médio da cesta básica nas capitais (DIEESE), para medir o poder de compra. */
  cesta: number;
  /** Alta da comida no domicílio (IPCA) por ano, em %, no governo Bolsonaro e no governo Lula. */
  altaComidaBolsonaro: number;
  altaComidaLula: number;
}

const cestas = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type Tipo = 'bpc' | 'aposentadoria';
export const TIPOS: Tipo[] = ['bpc', 'aposentadoria'];
const PAGAMENTOS: Record<Tipo, Pagamentos> = { bpc: 12, aposentadoria: 13 };
const NOME: Record<Tipo, string> = { bpc: 'o BPC', aposentadoria: 'a aposentadoria de 1 salário mínimo' };
/** Concordância: "o BPC … desvinculado", "a aposentadoria … desvinculada". */
const DESVINCULADO: Record<Tipo, string> = { bpc: 'desvinculado', aposentadoria: 'desvinculada' };

export interface EstadoBeneficio {
  tipo: Tipo;
  /** Ganho real do mínimo na projeção, em % ao ano. */
  ganho: number;
}

export function estadoPadraoBeneficio(d: DadosBeneficio): EstadoBeneficio {
  // Ganho real no máximo da lei (2,5% ao ano); a pessoa pode baixar até o mínimo.
  return { tipo: 'bpc', ganho: d.ganhoMax };
}

export function calcularBeneficio(d: DadosBeneficio, e: EstadoBeneficio) {
  const pagamentos = PAGAMENTOS[e.tipo];
  const retro = desvincularDesde({ real: d.real, anoBase: d.anoBase, inpcPorAno: d.inpcPorAno, pagamentos });
  const inflacao = d.inflacao / 100;
  const projecao = projetarDesvinculacao({ piso: d.piso, ganhoReal: e.ganho / 100, inflacao, anoAtual: d.anoAtual, ateAno: d.ateAno, pagamentos });
  const ultimo = projecao.anos[projecao.anos.length - 1];
  const poder = poderDeCompra(projecao, d.cesta, { anoAtual: d.anoAtual, pagamentos, inflacao });
  const poderFinal = poder.anos[poder.anos.length - 1];
  const comida = cestasComAlta(projecao, { piso: d.piso, cesta: d.cesta, altaVinculado: d.altaComidaLula / 100, altaDesvinculado: d.altaComidaBolsonaro / 100, anoAtual: d.anoAtual, pagamentos });
  return { pagamentos, retro, projecao, ultimo, poder, poderFinal, comida, perdaPctFinal: perdaPercentual(e.ganho / 100, d.ateAno - d.anoAtual) * 100 };
}

export function graficoRetro(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { retro } = calcularBeneficio(d, e);
  return barras({
    id: 'grafico-retro',
    titulo: `Valor do benefício de ${d.anoBase + 1} a ${d.anoAtual}: ligado ao mínimo e desvinculado`,
    descricao: retro.anos.map((a) => `${a.ano}: ligado ao mínimo ${reais(a.real)}, desvinculado ${reais(a.desvinculado)}`).join('; ') + '.',
    categorias: retro.anos.map((a) => String(a.ano)),
    series: [
      { nome: 'Governo Lula (aumento acima da inflação)', cor: COR_LULA, valores: retro.anos.map((a) => a.real) },
      { nome: 'Proposta da equipe do Flávio', cor: COR_BOLSONARO, valores: retro.anos.map((a) => a.desvinculado) },
    ],
    rotulo: numero,
  });
}

export function graficoProjecao(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { projecao } = calcularBeneficio(d, e);
  return barras({
    id: 'grafico-projecao',
    titulo: `Valor do benefício por mês, com inflação de ${pct(d.inflacao, 1)} ao ano, de ${d.anoAtual + 1} a ${d.ateAno}: ligado ao mínimo e sem aumento real`,
    descricao:
      projecao.anos.map((a) => `${a.ano}: ligado ao mínimo ${reais(a.vinculado)}, sem aumento real ${reais(a.desvinculado)}`).join('; ') + '.',
    categorias: projecao.anos.map((a) => String(a.ano)),
    series: [
      { nome: 'Regra do governo Lula (aumento acima da inflação)', cor: COR_LULA, valores: projecao.anos.map((a) => a.vinculado) },
      { nome: 'Proposta da equipe do Flávio', cor: COR_BOLSONARO, valores: projecao.anos.map((a) => a.desvinculado) },
    ],
    rotulo: numero,
  });
}

export function graficoCestas(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { comida } = calcularBeneficio(d, e);
  return barras({
    id: 'grafico-cestas',
    titulo: `Cestas básicas por mês que o benefício compraria de ${d.anoAtual} a ${d.ateAno}: regra do governo Lula com a comida no ritmo do governo Lula, e proposta do Flávio com a comida no ritmo do governo Bolsonaro`,
    descricao:
      `${d.anoAtual}: ${cestas(comida.hoje)} cestas; ` +
      comida.anos.map((a) => `${a.ano}: regra do governo Lula ${cestas(a.vinculado)}, proposta do Flávio ${cestas(a.desvinculado)}`).join('; ') + '.',
    categorias: [`${d.anoAtual}`, ...comida.anos.map((a) => String(a.ano))],
    series: [
      { nome: 'Regra do governo Lula (aumento acima da inflação)', cor: COR_LULA, valores: [comida.hoje, ...comida.anos.map((a) => a.vinculado)] },
      { nome: 'Proposta da equipe do Flávio', cor: COR_BOLSONARO, valores: [comida.hoje, ...comida.anos.map((a) => a.desvinculado)] },
    ],
    rotulo: cestas,
  });
}

/** Linhas <tr> das tabelas (sem selos: a figura que as contém leva as fontes). */
export function linhasRetro(d: DadosBeneficio, e: EstadoBeneficio): string {
  return calcularBeneficio(d, e)
    .retro.anos.map(
      (a) =>
        `<tr><th scope="row">${a.ano}</th><td>${reais(a.real)}</td><td>${reais(a.desvinculado)}</td><td>${reais(a.perdaMensal)}</td><td>${reais(a.perdaAno)}</td></tr>`,
    )
    .join('');
}

export function linhasProjecao(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { projecao, poder } = calcularBeneficio(d, e);
  return projecao.anos
    .map((a, i) => {
      const p = poder.anos[i];
      return `<tr><th scope="row">${a.ano}</th><td>${reais(a.vinculado)}</td><td>${reais(a.desvinculado)}</td><td>−${pct(p.perdaPct, 1)}</td><td>${reais(a.perdaAno)}</td></tr>`;
    })
    .join('');
}

export function linhasCestas(d: DadosBeneficio, e: EstadoBeneficio): string {
  return calcularBeneficio(d, e)
    .comida.anos.map(
      (a) =>
        `<tr><th scope="row">${a.ano}</th><td>${reais(a.cestaVinculado)}</td><td>${cestas(a.vinculado)}</td><td>${reais(a.cestaDesvinculado)}</td><td>${cestas(a.desvinculado)}</td></tr>`,
    )
    .join('');
}

export function frasesBeneficio(d: DadosBeneficio, e: EstadoBeneficio) {
  const r = calcularBeneficio(d, e);
  const ultimoRetro = r.retro.anos[r.retro.anos.length - 1];
  const nome = NOME[e.tipo];
  const desv = DESVINCULADO[e.tipo];
  const ganho = pct(e.ganho, 1);
  const periodo = `${d.anoBase + 1} a ${d.anoAtual}`;
  return {
    pagamentos: e.tipo === 'bpc' ? '12 pagamentos por ano (o BPC não tem 13º)' : '12 pagamentos e o 13º',
    hoje: reais(ultimoRetro.desvinculado),
    retroPorMes: reais(r.retro.porMes),
    retroTotal: reais(r.retro.total),
    retro: `Se ${nome} tivesse sido ${desv} do salário mínimo em ${d.anoBase + 1}, hoje seria ${reais(ultimoRetro.desvinculado)}, e não ${reais(ultimoRetro.real)}: ${reais(r.retro.porMes)} a menos por mês. De ${periodo}, a perda somaria ${reais(r.retro.total)}.`,
    porMesFinal: reais(r.ultimo.perdaMensal),
    total: reais(r.projecao.total),
    perdaPct: pct(r.perdaPctFinal, 1),
    futuro: `Com a inflação na média dos últimos anos (${pct(d.inflacao, 1)} ao ano), ${nome} sem aumento real só repõe a inflação: iria de ${reais(d.piso)} para ${reais(r.ultimo.desvinculado)} em ${d.ateAno}. Ligado a um mínimo com ganho real de ${ganho} ao ano, chegaria a ${reais(r.ultimo.vinculado)}: ${reais(r.ultimo.perdaMensal)} a menos por mês. De ${d.anoAtual + 1} a ${d.ateAno}, a perda somaria ${reais(r.projecao.total)}.`,
    cestasHoje: cestas(r.comida.hoje),
    cestasLula: cestas(r.comida.anos[r.comida.anos.length - 1].vinculado),
    cestasFinal: cestas(r.comida.anos[r.comida.anos.length - 1].desvinculado),
    cestasPct: pct((1 - r.comida.anos[r.comida.anos.length - 1].desvinculado / r.comida.anos[r.comida.anos.length - 1].vinculado) * 100, 1),
    cestasPerdidas: cestas(r.comida.perdidas),
    comida: (() => {
      const fim = r.comida.anos[r.comida.anos.length - 1];
      return `Hoje, ${nome} compra ${cestas(r.comida.hoje)} cestas básicas por mês. Com a regra do governo Lula (ganho real de ${ganho} ao ano) e a comida subindo no ritmo do governo Lula (${pct(d.altaComidaLula, 1)} ao ano), compraria ${cestas(fim.vinculado)} em ${d.ateAno}. Com a proposta da equipe do Flávio e a comida subindo como no governo Bolsonaro (${pct(d.altaComidaBolsonaro, 1)} ao ano), compraria ${cestas(fim.desvinculado)}: ${pct((1 - fim.desvinculado / fim.vinculado) * 100, 1)} a menos. De ${d.anoAtual + 1} a ${d.ateAno}, seriam ${cestas(r.comida.perdidas)} cestas a menos.`;
    })(),
    whatsapp: (url: string) =>
      `Se ${nome} tivesse sido ${desv} do salário mínimo em ${d.anoBase + 1}, hoje seria ${reais(ultimoRetro.desvinculado)}, e não ${reais(ultimoRetro.real)}: ${reais(r.retro.porMes)} a menos por mês e ${reais(r.retro.total)} perdidos de ${periodo}. Veja a conta e as fontes: ${url}`,
    cartao: {
      numero: `−${reais(r.retro.porMes)}`,
      linha: `por mês para quem recebe ${e.tipo === 'bpc' ? 'o BPC' : 'aposentadoria de 1 mínimo'}`,
      premissa: `Se ${nome} tivesse sido ${desv} do mínimo em ${d.anoBase + 1} e subisse só pela inflação: ${reais(ultimoRetro.desvinculado)} hoje, e não ${reais(ultimoRetro.real)}. Perda de ${reais(r.retro.total)} de ${periodo}.`,
      fonte: 'Fontes: Diário Oficial e IBGE',
    },
  };
}
