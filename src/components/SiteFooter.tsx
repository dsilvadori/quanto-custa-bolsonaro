import { Footer, Link } from '@boralula/ui';
import { MENU, PAGINAS, RODAPE, SITE } from '../site';

const links = [...new Set([...MENU, ...RODAPE])];

export function SiteFooter() {
  return (
    <Footer
      links={links.map((id) => (
        <Link key={id} href={PAGINAS[id].path}>
          {PAGINAS[id].rotulo}
        </Link>
      ))}
    >
      Responsável: {SITE.responsavel.nome} · {SITE.responsavel.documento}.{' '}
      <Link href={PAGINAS.quemSomos.path}>Saiba quem faz este site</Link>.
    </Footer>
  );
}
