import { StatGroup } from '@boralula/ui';

export interface ItemResultado {
  /** Nome do [data-saida] que o script do simulador atualiza. */
  saida: string;
  valor: string;
  rotulo: string;
}

/** StatGroup do DS com valores que o script do simulador pode trocar. */
export function Resultados({ itens }: { itens: ItemResultado[] }) {
  return (
    <StatGroup
      className="resultados"
      stats={itens.map((i) => ({ value: <span data-saida={i.saida}>{i.valor}</span>, label: i.rotulo }))}
    />
  );
}
