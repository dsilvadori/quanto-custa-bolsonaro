import { Button } from '@boralula/ui';
import type { ReactNode } from 'react';

/** Atalho do carrinho (um de cada, família de 4, esvaziar). Ligado em src/scripts/sim-carrinho.ts. */
export function BotaoAtalho({ acao, children }: { acao: 'um' | 'familia' | 'vazio'; children: ReactNode }) {
  return (
    <Button variant="outline" type="button" data-atalho={acao}>
      {children}
    </Button>
  );
}
