import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import policy from '@/content/privacy-policy.json';

export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacypolicy/' } };

export default function PrivacyPolicyPage() {
  return <>
    <PageHero eyebrow={policy.updated} title={policy.title} />
    <section className="page-content">
      <div className="studio-wrap legal-content">
        <div>{policy.intro.map(text => <p key={text}>{text}</p>)}</div>
        {policy.sections.map(section => <article key={section.heading}>
          <h2>{section.heading}</h2>
          {section.blocks.filter(block => block.type === 'paragraph').map(block => <p key={block.text}>{block.text}</p>)}
          {section.blocks.some(block => block.type === 'item') && <ul>
            {section.blocks.filter(block => block.type === 'item').map(block => <li key={block.text}>{block.text}</li>)}
          </ul>}
        </article>)}
      </div>
    </section>
  </>;
}
