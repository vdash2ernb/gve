import WorkStory from '@/components/WorkStory';
import HomeContent from '@/components/HomeContent';
import ClientLogos from '@/components/ClientLogos';
import ClientProof from '@/components/ClientProof';
import styles from '@/components/ClientStories.module.css';
import BusinessIdentity from '@/components/BusinessIdentity';
import type {Metadata} from 'next';
export const metadata:Metadata={alternates:{canonical:'/'}};
export default function Home(){return <><BusinessIdentity/><WorkStory proof={<div className={styles.interlude}><ClientLogos/><ClientProof/></div>}/><HomeContent/></>}
