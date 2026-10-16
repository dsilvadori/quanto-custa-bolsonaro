import { BackLink } from '@boralula/ui';
import { PAGINAS, link } from '../site';

export function VoltarInicio() {
  return <BackLink href={link(PAGINAS.inicio.path)}>{PAGINAS.inicio.rotulo}</BackLink>;
}
