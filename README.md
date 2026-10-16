# Global Virtual Experts

A branded website for Global Virtual Experts, with an original interactive 3D work folio, concise service pages, real team photography and Expert videos.

## Run locally

Use Node.js 20.9 or newer and npm.

```bash
npm ci
npm run dev
```

Development opens at http://localhost:3000. To choose another port:

```bash
npm run dev -- --port 3101
```

## Build and preview

```bash
npm run build
npm start
```

The production build exports static pages into `out/`. The included preview server serves that export at http://127.0.0.1:3100. Keep it running while checking the exported routes:

```bash
npm run check
npm run verify:preview
```

`npm start` serves the static export rather than a Next.js application server. Build the project before starting it. Generated pages, dependencies, environment files and local review evidence are excluded from Git.

## Pages

Home, Services, 11 individual service pages, How it works, About, Expert stories, FAQ, Contact, Start your search and Privacy.

## Editing

| File or folder | Purpose |
| --- | --- |
| `src/content/site.ts` | Website copy, services, team, FAQs, video IDs and contact details |
| `src/content/domains.ts` | Service-to-illustration mapping |
| `src/app/` | Page routes |
| `src/app/globals.css` | Shared visual design and responsive layouts |
| `src/app/fonts.css` | Self-hosted fonts and optional local brand font |
| `src/components/WorkStory.tsx` | Homepage scroll narrative |
| `src/components/folio/FolioCanvas.tsx` | Original procedural 3D geometry, materials, textures and animation |
| `src/components/HomeContent.tsx` | Homepage content sections |
| `public/brand/` | Logo and original favicon assets |
| `public/team/`, `public/partners/` | Team photography and client logos |

## Design and accessibility

Navy and amber branding, a full-width header, legible client logos, simple booking content and real people. The homepage's plans, schedules, accounts and follow-up documents change with scrolling. Desktop illustrations stay beside the copy; phone illustrations follow the text in reserved spaces. Service selection changes the front sheet without moving the physical layers through one another.

Keyboard navigation, visible focus states, an expandable mobile menu, reduced-motion preferences and a homepage motion control are supported. The 3D has a fallback for unsupported graphics environments.

The full original GVE logo and matching original favicon are used. Local Codec Pro is optional; openly licensed, self-hosted Poppins provides the complete fallback. Its license is in `public/fonts/OFL.txt`. The website does not require fonts extracted from the brand PDF.

Contact uses GVE's Calendly calendar. Stories embed the original Expert videos. These integrations require internet access. No contact or payment credentials are stored in this repository.

## Stack

Next.js, React, TypeScript, Three.js, React Three Fiber, Drei, Motion, Lenis and Tailwind CSS.

## Hosting

The website is configured for static export. A static host must serve `out/`, support directory-index URLs, and serve the application at the domain root. Uploading this repository alone does not publish the website.
