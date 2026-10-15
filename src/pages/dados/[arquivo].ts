// Publica os arquivos de /data em /dados/<arquivo> para download.
import type { APIRoute, GetStaticPaths } from 'astro';
import { ARQUIVOS } from '../../arquivos-dados';

export const getStaticPaths: GetStaticPaths = () =>
  ARQUIVOS.map((a) => ({ params: { arquivo: a.nome }, props: { conteudo: a.conteudo, tipo: a.tipo } }));

export const GET: APIRoute = ({ props }) => new Response(props.conteudo as string, { headers: { 'content-type': props.tipo as string } });
