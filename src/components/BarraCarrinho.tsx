import { BarraCompartilhar } from './BarraCompartilhar';

/** Barra fixa do carrinho: total de hoje e no governo do Bolsonaro acima dos botões de compartilhar. */
export function BarraCarrinho({ textoWhatsapp, hoje, cenario }: { textoWhatsapp: string; hoje: string; cenario: string }) {
  return (
    <BarraCompartilhar
      textoWhatsapp={textoWhatsapp}
      topo={
        <p className="total-fixo" aria-hidden="true">
          <span>
            Hoje <strong data-saida="hoje">{hoje}</strong>
          </span>
          <span>
            Governo do Bolsonaro <strong data-saida="cenario">{cenario}</strong>
          </span>
        </p>
      }
    />
  );
}
