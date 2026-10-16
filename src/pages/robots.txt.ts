import type { APIRoute } from 'astro';
import { link } from '../site';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(link('/sitemap-index.xml'), site).href}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
