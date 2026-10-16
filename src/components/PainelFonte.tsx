import { Button, IconButton, Link } from '@boralula/ui';
import { X } from 'lucide-react';
import { PAGINAS, link } from '../site';

// Um painel por página, preenchido por src/scripts/fonte.ts a partir do selo tocado.
// Os campos com data-campo recebem o texto; os links, o href.
// O conteúdo fica num div interno: um toque direto no <dialog> é no fundo e fecha o painel.
export function PainelFonte() {
  return (
    <dialog id="painel-fonte" className="painel-fonte" aria-labelledby="painel-fonte-titulo">
      <div className="painel-fonte__conteudo">
        <div className="painel-fonte__topo">
          <p className="cp-text-label-small" data-campo="orgao" />
          <IconButton icon={<X />} label="Fechar" data-fechar="" />
        </div>
        <h2 id="painel-fonte-titulo" className="cp-text-h3" data-campo="titulo" />
        <dl className="painel-fonte__dados">
          <dt>Publicado em</dt>
          <dd data-campo="publicacao" />
          <dt>Valor usado</dt>
          <dd data-campo="valor" />
        </dl>
        <div className="painel-fonte__acoes">
          <Link href={link(PAGINAS.fontes.path)} external data-link="url">
            Abrir fonte
          </Link>
          <Button variant="outline" type="button" data-copiar="" fullWidth>
            Copiar fonte
          </Button>
          <p className="cp-text-body-small" role="status" data-campo="aviso" />
        </div>
      </div>
    </dialog>
  );
}
