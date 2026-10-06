// The static export writes link-prefetch data as `about/__next.about/__PAGE__.txt`,
// but the browser asks for `about/__next.about.__PAGE__.txt`. Copy each nested file
// to the flat name so prefetching works on a plain static host like Cloudflare.
import { copyFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = "out";
let copied = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("__next.")) flatten(dir, path);
    else walk(path);
  }
}

function flatten(parent, segmentDir) {
  for (const entry of readdirSync(segmentDir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const file = join(entry.parentPath, entry.name);
    const flat = relative(parent, file).split(sep).join(".");
    copyFileSync(file, join(parent, flat));
    copied++;
  }
}

walk(root);
console.log("flattened prefetch files:", copied);
