import type { MetadataRoute } from 'next';
import { services } from '@/content/site';
import { industries } from '@/content/industries';
import { siteUrl } from '@/content/seo';

export const dynamic = 'force-static';

const pages = ['/', '/industries/', '/services/', '/how-it-works/', '/client-stories/', '/stories/', '/about/', '/faq/', '/contact-us/', '/start/', '/privacypolicy/'];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages, ...industries.map(i => '/industries/' + i.slug + '/'), ...services.map(s => '/services/' + s.slug + '/')].map(path => ({ url: siteUrl + path }));
}
