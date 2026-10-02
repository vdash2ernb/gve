import Image from 'next/image';
import { partners } from '@/content/site';
import styles from './ClientLogos.module.css';

// Presentation bounds remove transparent export padding without editing the
// original logo artwork. Widths balance the different marks optically.
const artwork: Record<string, { canvas: [number, number]; bounds: [number, number, number, number]; width: number }> = {
  '/partners/hill-mortgage.png': { canvas: [150, 150], bounds: [5, 6, 140, 138], width: 68 },
  '/partners/window-door-shoppe.png': { canvas: [150, 150], bounds: [3, 45, 147, 47], width: 128 },
  '/partners/izozi.png': { canvas: [150, 150], bounds: [3, 43, 145, 60], width: 118 },
  '/partners/silver-peak.png': { canvas: [150, 150], bounds: [7, 9, 137, 128], width: 70 },
  '/partners/antler.png': { canvas: [150, 150], bounds: [3, 6, 144, 133], width: 68 },
  '/partners/mw-design.png': { canvas: [2356, 2160], bounds: [124, 203, 2109, 1754], width: 78 },
  '/partners/river-roofing.png': { canvas: [150, 150], bounds: [4, 47, 142, 57], width: 124 },
  '/partners/truss.png': { canvas: [150, 150], bounds: [4, 29, 142, 85], width: 108 },
};

export default function ClientLogos() {
  return <section className={styles.band} id="clients" aria-labelledby="client-heading">
    <div className={styles.inner}>
      <h2 className={styles.heading} id="client-heading">Clients we work with</h2>
      <ul className={styles.logos} aria-label="GVE clients">
        {partners.map(partner => {
          const { canvas, bounds: [x, y, width, height], width: displayWidth } = artwork[partner.img];
          return <li className={styles.item} key={partner.name}>
            <span className={styles.mark} style={{ width: displayWidth, aspectRatio: `${width} / ${height}` }}>
              <Image src={partner.img} alt={partner.name} width={canvas[0]} height={canvas[1]} className={styles.image}
                style={{ width: `${canvas[0] / width * 100}%`, height: `${canvas[1] / height * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }}/>
            </span>
          </li>;
        })}
      </ul>
    </div>
  </section>;
}
