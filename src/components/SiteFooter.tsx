import { BrandStripes, Footer, Link } from '@boralula/ui';
import { MENU, PAGINAS, RODAPE, SITE, link } from '../site';

const links = [...new Set([...MENU, ...RODAPE])];

export function SiteFooter() {
  return (
    <div className="rodape">
      <div className="rodape__faixa" aria-hidden="true">
        <BrandStripes base="red" />
      </div>
      <Footer
        links={links.map((id) => (
          <Link key={id} href={link(PAGINAS[id].path)}>
            {PAGINAS[id].rotulo}
          </Link>
        ))}
      >
        {SITE.nome}
      </Footer>
    </div>
  );
}
