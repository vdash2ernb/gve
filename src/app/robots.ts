import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/seo';

export const dynamic = 'force-static';

// The temporary workers.dev address is kept out of search results by public/_headers,
// so this file is already correct for globalvirtualexperts.com.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: siteUrl + '/sitemap.xml' };
}
