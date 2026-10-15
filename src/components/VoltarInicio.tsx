import { BackLink } from '@boralula/ui';
import { PAGINAS } from '../site';

export function VoltarInicio() {
  return <BackLink href={PAGINAS.inicio.path}>{PAGINAS.inicio.rotulo}</BackLink>;
}
