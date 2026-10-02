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
- `src/components/three/`: the line drawing behind every page. Everything is drawn in lines like the GVE logo:
  - `globe`: the logo mark, with Seattle linked to the Philippines
  - `hub`: every task pulling on you ("Still the hub for everything?")
  - `handoff`: your Expert takes the tasks, updates flow back; service cards light their line on hover
  - `house0`–`house5`: plan → foundation → frame → roof → lights on → extension ("Building your success")
- Colors carry meaning: logo blue = structure, white = you, amber = GVE's people, warm red = overload
- Each page picks its shapes with `<SceneStages stages={[...]} />`, and each `data-stage` section on the page is one step of the scroll morph
- `scripts/gen-globe.mjs`: regenerates the dotted-globe points in `src/lib/globe-points.json`

Built with Next.js, React Three Fiber, Lenis and Motion.
