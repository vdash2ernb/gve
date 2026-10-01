import Image from "next/image";
import { partners } from "@/content/site";

export default function Partners() {
  const row = [...partners, ...partners];
  return (
    <div className="relative overflow-hidden py-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <ul className="marquee flex w-max items-center gap-16">
        {row.map((p, i) => (
          <li key={i} aria-hidden={i >= partners.length} className="shrink-0">
            <Image src={p.img} alt={p.name} width={120} height={120} className="logo-mono h-16 w-auto object-contain" />
          </li>
        ))}
      </ul>
    </div>
  );
}
