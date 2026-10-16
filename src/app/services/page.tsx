import type {Metadata} from 'next';
import PageHero from '@/components/PageHero';
import ServiceBrowser from '@/components/ServiceBrowser';
import CTA from '@/components/CTA';
export const metadata:Metadata={title:'Services',description:'Virtual support for admin, projects, bookkeeping, sales, marketing, and specialist work.',alternates:{canonical:'/services/'}};
export default function Services(){return <><PageHero eyebrow="Services" title="Virtual assistant services." body="Find help with admin, bookkeeping, sales, marketing, design, and more."/><section className="page-content"><div className="studio-wrap"><ServiceBrowser/></div></section><CTA/></>}
