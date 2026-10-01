import Link from "next/link";
import { SceneStages } from "@/components/Scene";

export default function NotFound() {
  return (
    <section data-stage={0} className="flex min-h-svh items-center justify-center px-4 text-center">
      <SceneStages stages={[{ shape: "chaos", dim: 0.6 }]} />
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">
          This page got <span className="accent">lost</span>.
        </h1>
        <Link href="/" className="btn-primary mt-8">
          Back home
        </Link>
      </div>
    </section>
  );
}
