import { jsonLd, organization } from '@/content/seo';

// GVE's official website and the Google profile supplied by GVE identify the
// same organization. These testimonials are not an aggregate Google rating.
export default function BusinessIdentity() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)}/>;
}
