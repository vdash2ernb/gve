import { jsonLd, organization } from '@/content/seo';

// GVE's official website and the Google profile supplied by GVE identify the
// same organization. No review or rating markup: the site shows no aggregate Google rating.
export default function BusinessIdentity() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)}/>;
}
