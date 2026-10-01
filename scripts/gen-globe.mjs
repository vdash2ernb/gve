// Precomputes dotted-globe land points so the browser doesn't need map data.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topo = JSON.parse(readFileSync("node_modules/world-atlas/land-110m.json", "utf8"));
const land = feature(topo, topo.objects.land);

const candidates = 22000;
const golden = Math.PI * (3 - Math.sqrt(5));
const pts = [];
for (let i = 0; i < candidates; i++) {
  const y = 1 - (i / (candidates - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = golden * i;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = (Math.atan2(x, z) * 180) / Math.PI;
  if (geoContains(land, [lon, lat])) pts.push(+x.toFixed(4), +y.toFixed(4), +z.toFixed(4));
}
writeFileSync("src/lib/globe-points.json", JSON.stringify(pts));
console.log("land points:", pts.length / 3);
