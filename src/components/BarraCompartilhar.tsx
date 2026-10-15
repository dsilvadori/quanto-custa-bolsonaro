import { Button, IconButton } from '@boralula/ui';
import { ImageDown, MessageCircle, Share2 } from 'lucide-react';

/**
 * Barra fixa no rodapé da tela nos simuladores. Sem JS, o WhatsApp leva o texto do resultado padrão;
 * com JS (src/scripts/compartilhar.ts), o texto acompanha a simulação e os outros dois botões aparecem.
 */
export function BarraCompartilhar({ textoWhatsapp }: { textoWhatsapp: string }) {
  return (
    <div className="barra-compartilhar" role="region" aria-label="Compartilhar o resultado">
      <div className="cp-container barra-compartilhar__conteudo">
        <Button
          href={`https://wa.me/?text=${encodeURIComponent(textoWhatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          leadingIcon={<MessageCircle />}
          data-compartilhar="whatsapp"
          fullWidth
        >
          Mandar no WhatsApp
        </Button>
        <IconButton className="so-com-js" variant="standard" icon={<Share2 />} label="Compartilhar link" data-compartilhar="link" />
        <IconButton className="so-com-js" variant="standard" icon={<ImageDown />} label="Compartilhar imagem" data-compartilhar="imagem" />
      </div>
      <p className="barra-compartilhar__aviso cp-text-body-small" role="status" data-compartilhar-aviso="" />
    </div>
  );
}
