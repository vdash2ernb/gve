import WorkStory from '@/components/WorkStory';
import HomeContent from '@/components/HomeContent';
import ClientLogos from '@/components/ClientLogos';
import ClientProof from '@/components/ClientProof';
import styles from '@/components/ClientStories.module.css';
export default function Home(){return <><WorkStory proof={<div className={styles.interlude}><ClientLogos/><ClientProof/></div>}/><HomeContent/></>}
