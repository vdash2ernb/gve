# Global Virtual Experts — website redesign (demo)

A redesign of globalvirtualexperts.com with a scroll-driven 3D particle scene, smooth scrolling and short, plain copy.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

`/` · `/services` · `/services/[slug]` (11 services) · `/how-it-works` · `/start` · `/about` · `/stories` · `/faq` · `/contact` · `/privacy`

## Where things live

- `src/content/site.ts`: all copy, services, team, FAQ and contact details
- `src/components/three/`: the particle field and its shapes (globe, chaos, grid, spiral, bridge, clock, sphere)
- Each page picks its shapes with `<SceneStages stages={[...]} />`, and each `data-stage` section on the page is one step of the scroll morph
- `scripts/gen-globe.mjs`: regenerates the dotted-globe points in `src/lib/globe-points.json`

Built with Next.js, React Three Fiber, Lenis and Motion.
