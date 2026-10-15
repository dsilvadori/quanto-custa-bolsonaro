// Simulador 3: exemplo estático com o relatório mais recente da Abicom.
import { barras } from '../graficos/barras';
import { altaPct, efeitoIpca, fracaoFossil, repasse } from '../calc/combustivel';

export interface LinhaCombustivel {
  combustivel: 'gasolina' | 'diesel';
  defasagem: number;
  teorBio: number;
  preco: number;
  peso: number;
}

export const NOMES: Record<LinhaCombustivel['combustivel'], string> = {
  gasolina: 'Gasolina comum',
  diesel: 'Diesel S10',
};

export function calcularCombustivel(l: LinhaCombustivel) {
  const fracao = fracaoFossil(l.teorBio);
  const aumento = repasse(l.defasagem, fracao);
  const alta = altaPct(aumento, l.preco);
  return { fracao, aumento, novoPreco: l.preco + aumento, alta, efeito: efeitoIpca(alta, l.peso) };
}

export function efeitoTotal(linhas: LinhaCombustivel[]): number {
  return linhas.reduce((s, l) => s + calcularCombustivel(l).efeito, 0);
}

/** Tanque cheio hoje e com o PPI, para `litros` do combustível. */
export function tanqueCheio(l: LinhaCombustivel, litros: number) {
  const r = calcularCombustivel(l);
  return { hoje: litros * l.preco, comPpi: litros * r.novoPreco, diferenca: litros * r.aumento };
}

/** Veículos do exemplo. O tamanho do tanque é um exemplo que a pessoa pode mudar na página. */
export const VEICULOS = [
  { id: 'carro', nome: 'Carro de aplicativo', combustivel: 'gasolina', litrosExemplo: 50 },
  { id: 'caminhao', nome: 'Caminhão', combustivel: 'diesel', litrosExemplo: 300 },
] as const;

/** Preço por litro hoje e com o PPI. */
export function graficoBomba(linhas: LinhaCombustivel[]): string {
  const r = linhas.map((l) => ({ l, c: calcularCombustivel(l) }));
  const v = (x: number) => x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return barras({
    id: 'grafico-bomba',
    titulo: 'Preço por litro hoje e com o preço de importação (PPI)',
    descricao: r.map(({ l, c }) => `${NOMES[l.combustivel]}: hoje R$ ${v(l.preco)}, com o PPI R$ ${v(c.novoPreco)}`).join('; ') + '.',
    categorias: r.map(({ l }) => NOMES[l.combustivel]),
    series: [
      { nome: 'Hoje', cor: 'var(--cp-color-on-surface-variant)', valores: r.map(({ l }) => l.preco) },
      { nome: 'Com o PPI', cor: 'var(--cp-color-primary)', valores: r.map(({ c }) => c.novoPreco) },
    ],
    rotulo: (x) => `R$ ${v(x)}`,
  });
}
