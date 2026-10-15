import { TopNavigation } from '@boralula/ui';
import { MENU, PAGINAS, SITE, type PaginaId } from '../site';

// O menu do celular abre com src/scripts/menu.ts (sem React no navegador).
// Sem JS, os mesmos links ficam no rodapé.
export function SiteHeader({ atual }: { atual?: PaginaId }) {
  return (
    <TopNavigation
      links={MENU.map((id) => ({ label: PAGINAS[id].rotulo, href: PAGINAS[id].path, current: id === atual }))}
      // TODO: confirmar a marca. O logo padrão do DS é o selo do Comitê Popular do Lula.
      logo={<span className="marca">{SITE.nomeCurto}</span>}
    />
  );
}
