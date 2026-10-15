import { Button } from '@boralula/ui';
import { Download } from 'lucide-react';

export function BotaoBaixar({ arquivo }: { arquivo: string }) {
  return (
    <Button variant="outline" href={`/dados/${arquivo}`} download={arquivo} leadingIcon={<Download />}>
      Baixar {arquivo}
    </Button>
  );
}
