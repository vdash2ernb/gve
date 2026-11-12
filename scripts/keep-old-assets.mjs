// Runs between the build and the upload (see "deploy" in package.json).
//
// Every build gives its stylesheets and scripts new file names, and a deploy uploads only what is in
// `out/`. For a moment after a deploy, Cloudflare can still hand a visitor the previous version's page,
// which then asks for a stylesheet that is gone and shows unstyled. A visitor with the site already open
// has the same problem with the code for the intro and the 3D scenes.
//
// So this step keeps the files of recent builds in the upload:
//   1. it copies this build's `_next/static` files into a history folder, and
//   2. it copies back into `out/` any file from a build of the last KEEP_DAYS days that this build lacks.
//
// The history folder sits in the user's home folder, not in the project, so every copy of the project
// on this computer (the main folder and any git worktree) shares it. Set GVE_ASSET_HISTORY to move it.
// The file names carry a hash of their contents, so an old file never replaces a new one.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const KEEP_DAYS = 14;
// Far below Cloudflare's limit on files per deploy; the oldest kept files go first.
const MAX_KEPT_FILES = 5000;

const out = process.env.GVE_OUT_DIR || "out";
const history = process.env.GVE_ASSET_HISTORY || join(homedir(), ".gve-asset-history");
const now = Number(process.env.GVE_NOW) || Date.now();
const staticDir = join(out, "_next", "static");
const indexFile = join(history, "index.json");

if (!existsSync(staticDir)) {
  console.error(`keep-old-assets: ${staticDir} is missing. Run the build first.`);
  process.exit(1);
}

function filesUnder(dir, base = dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...filesUnder(path, base));
    else found.push(path.slice(base.length + 1).replaceAll("\\", "/"));
  }
  return found;
}

function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

// index.json: file path -> the last time a build contained it.
let index = {};
try { index = JSON.parse(readFileSync(indexFile, "utf8")); } catch { /* first run, or an unreadable index: start again */ }

mkdirSync(history, { recursive: true });
const current = new Set(filesUnder(staticDir));
for (const file of current) {
  const kept = join(history, file);
  if (!existsSync(kept)) copy(join(staticDir, file), kept);
  index[file] = now;
}

const cutoff = now - KEEP_DAYS * 24 * 60 * 60 * 1000;
const old = Object.keys(index)
  .filter((file) => !current.has(file))
  .sort((a, b) => index[b] - index[a]);

let restored = 0, dropped = 0, bytes = 0;
for (const [position, file] of old.entries()) {
  const kept = join(history, file);
  if (index[file] < cutoff || position >= MAX_KEPT_FILES || !existsSync(kept)) {
    rmSync(kept, { force: true });
    delete index[file];
    dropped++;
    continue;
  }
  copy(kept, join(staticDir, file));
  bytes += statSync(kept).size;
  restored++;
}

writeFileSync(indexFile, JSON.stringify(index));
console.log(
  `keep-old-assets: this build has ${current.size} files; kept ${restored} from earlier builds ` +
    `(${(bytes / 1024 / 1024).toFixed(1)} MB), dropped ${dropped} older than ${KEEP_DAYS} days. History: ${history}`,
);
