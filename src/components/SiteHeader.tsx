import { TopNavigation } from '@boralula/ui';
import { MENU, PAGINAS, SITE, type PaginaId, link } from '../site';

// O menu do celular abre com src/scripts/menu.ts (sem React no navegador).
// Sem JS, os mesmos links ficam no rodapé.
export function SiteHeader({ atual }: { atual?: PaginaId }) {
  return (
    <TopNavigation
      surface="red"
      logoHref={link(PAGINAS.inicio.path)}
      links={MENU.map((id) => ({ label: PAGINAS[id].menu ?? PAGINAS[id].rotulo, href: link(PAGINAS[id].path), current: id === atual }))}
      // Logo próprio (scripts/logo.mjs): etiqueta de preço e "Quanto custa Bolsonaro no poder".
      logo={<img className="marca-logo" src={link('/logo/topo.svg')} width={193} height={56} alt={SITE.nome} />}
    />
  );
}
