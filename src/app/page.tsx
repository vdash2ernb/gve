import WorkStory from '@/components/WorkStory';
import HomeContent from '@/components/HomeContent';
import ClientLogos from '@/components/ClientLogos';
import ClientProof from '@/components/ClientProof';
import styles from '@/components/ClientStories.module.css';
import BusinessIdentity from '@/components/BusinessIdentity';
import MissionIntro from '@/components/MissionIntro';
import type {Metadata} from 'next';
import {pageMeta} from '@/content/seo';
export const metadata:Metadata=pageMeta({title:'Virtual Assistant Agency for Businesses | Global Virtual Experts',description:'Hire skilled virtual assistants in the Philippines for admin, bookkeeping, customer support, marketing, and more. GVE handles screening and onboarding.',path:'/'});
export default function Home(){return <><MissionIntro/><BusinessIdentity/><WorkStory proof={<div className={styles.interlude}><ClientLogos/><ClientProof/></div>}/><HomeContent/></>}
