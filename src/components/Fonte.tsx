import { Tag } from '@boralula/ui';
import { fonte } from '../fontes';
import { PAGINAS, dataPorExtenso, link } from '../site';

/**
 * Selo de fonte ao lado de um número. Sem JS é um link para /fontes#id;
 * com JS (src/scripts/fonte.ts) abre o painel com os dados abaixo.
 */
export function Fonte({ id }: { id: string }) {
  const f = fonte(id);
  return (
    <a
      className="fonte"
      href={link(`${PAGINAS.fontes.path}#${f.id}`)}
      data-fonte={f.id}
      data-titulo={f.titulo}
      data-orgao={f.orgao}
      data-url={f.url}
      data-publicacao={f.data_publicacao ? dataPorExtenso(f.data_publicacao) : ''}
      data-valor={f.valor_usado}
    >
      <span className="cp-visually-hidden">Fonte: </span>
      <Tag tone="neutral">{f.orgao}</Tag>
    </a>
  );
}
