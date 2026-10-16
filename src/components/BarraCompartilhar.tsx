import { Button, IconButton } from '@boralula/ui';
import { ImageDown, MessageCircle, Share2 } from 'lucide-react';

/**
 * Bloco "Compartilhe" no fim do resultado de cada simulador (não fica fixo na tela).
 * Sem JS, o WhatsApp leva o texto do resultado padrão; com JS (src/scripts/compartilhar.ts),
 * o texto acompanha a simulação e os botões de link e imagem aparecem.
 */
export function BarraCompartilhar({ textoWhatsapp }: { textoWhatsapp: string }) {
  return (
    <section className="barra-compartilhar cartao" aria-labelledby="compartilhe">
      <h2 id="compartilhe" className="cp-text-h3">Compartilhe esta conta</h2>
      <div className="barra-compartilhar__conteudo">
        <Button
          href={`https://wa.me/?text=${encodeURIComponent(textoWhatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          leadingIcon={<MessageCircle />}
          data-compartilhar="whatsapp"
        >
          Mandar no WhatsApp
        </Button>
        <IconButton className="so-com-js" variant="standard" icon={<Share2 />} label="Compartilhar link" data-compartilhar="link" />
        <IconButton className="so-com-js" variant="standard" icon={<ImageDown />} label="Compartilhar imagem" data-compartilhar="imagem" />
      </div>
      <p className="barra-compartilhar__aviso cp-text-body-small" role="status" data-compartilhar-aviso="" />
    </section>
  );
}
