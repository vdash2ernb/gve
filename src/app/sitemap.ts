import type { MetadataRoute } from 'next';
import { services } from '@/content/site';
import { siteUrl } from '@/content/seo';

export const dynamic = 'force-static';

const pages = ['/', '/services/', '/how-it-works/', '/client-stories/', '/stories/', '/about/', '/faq/', '/contact-us/', '/start/', '/privacypolicy/'];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages, ...services.map(s => '/services/' + s.slug + '/')].map(path => ({ url: siteUrl + path }));
}
