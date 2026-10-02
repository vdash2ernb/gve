import { contact } from '@/content/site';

// GVE's official website and the Google profile supplied by GVE identify the
// same organization. These testimonials are not an aggregate Google rating.
const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://globalvirtualexperts.com/#organization',
  name: 'Global Virtual Experts',
  url: 'https://globalvirtualexperts.com/',
  email: contact.email,
  telephone: contact.phoneHref.replace('tel:', ''),
  sameAs: [contact.googleBusinessProfile],
};

export default function BusinessIdentity() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(organization).replace(/</g, '\\u003c'),
  }}/>;
}
