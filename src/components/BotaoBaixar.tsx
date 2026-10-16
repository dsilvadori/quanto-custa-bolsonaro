import { Button } from '@boralula/ui';
import { link } from '../site';
import { Download } from 'lucide-react';

export function BotaoBaixar({ arquivo }: { arquivo: string }) {
  return (
    <Button variant="outline" href={link(`/dados/${arquivo}`)} download={arquivo} leadingIcon={<Download />}>
      Baixar {arquivo}
    </Button>
  );
}
