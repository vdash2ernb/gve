// Where GVE's clients are, for the globes in the intro and on the homepage.
// Every market is drawn as a route from the Philippines; the visitor's own region is the one in focus.

export type LatLon = [lat: number, lon: number];
export type Market = "us" | "ca" | "uk" | "ie" | "au" | "nz";
export type Region = "na" | "ukie" | "au" | "nz";

export const PHILIPPINES: LatLon = [14.6, 121.0];

export const MARKETS: Record<Market, LatLon[]> = {
  us: [[47.6, -122.3], [34.0, -118.2], [32.8, -96.8], [41.9, -87.6], [40.7, -74.0]],
  ca: [[43.7, -79.4], [49.3, -123.1]],
  uk: [[51.5, -0.1]],
  ie: [[53.35, -6.26]],
  au: [[-33.9, 151.2], [-37.8, 144.9], [-31.95, 115.86]],
  nz: [[-36.8, 174.8]],
};

/** The markets lit up for a visitor from each region. */
export const REGION_MARKETS: Record<Region, Market[]> = {
  na: ["us", "ca"],
  ukie: ["uk", "ie"],
  au: ["au", "nz"],
  nz: ["au", "nz"],
};

/** Where the visitor's region sits on the globe: the intro's Expert lands here. */
export const LANDING: Record<Region, LatLon> = {
  na: [47.6, -122.3],
  ukie: [52.8, -3.5],
  au: [-33.9, 151.2],
  nz: [-36.8, 174.8],
};

const isRegion = (v: string | null): v is Region => !!v && v in REGION_MARKETS;

/**
 * The visitor's region, from the browser's time zone (no location lookup). Visitors outside the
 * four regions get the nearest one. `?region=na|ukie|au|nz` forces one, for previewing.
 */
export function visitorRegion(): Region {
  try {
    const forced = new URLSearchParams(location.search).get("region");
    if (isRegion(forced)) return forced;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (/^(Pacific\/(Auckland|Chatham)|NZ|NZ-CHAT|Antarctica\/McMurdo)$/.test(tz)) return "nz";
    if (/^(Australia\/|Asia\/|Indian\/|Pacific\/)/.test(tz) && tz !== "Pacific/Honolulu") return "au";
    if (/^(Europe\/|Africa\/|Atlantic\/|GB|Eire)/.test(tz)) return "ukie";
  } catch {}
  return "na";
}

const D2R = Math.PI / 180;

/** The average direction of points on the globe, as lat/lon. */
export function centroid(points: LatLon[]): LatLon {
  let x = 0, y = 0, z = 0;
  for (const [lat, lon] of points) {
    x += Math.cos(lat * D2R) * Math.sin(lon * D2R);
    y += Math.sin(lat * D2R);
    z += Math.cos(lat * D2R) * Math.cos(lon * D2R);
  }
  return [Math.atan2(y, Math.hypot(x, z)) / D2R, Math.atan2(x, z) / D2R];
}

/**
 * Turns a globe tuned to face one pair of places so it faces another pair the same way, north kept up.
 * The globe's rotation is a turn about its axis (`turn`) and then a tilt toward the camera (`tilt`), in radians.
 */
export function reaim(base: { tilt: number; turn: number }, tunedFor: LatLon[], aimAt: LatLon[]) {
  const [lat0, lon0] = centroid(tunedFor), [lat1, lon1] = centroid(aimAt);
  let dLon = lon1 - lon0;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  return { tilt: base.tilt + (lat1 - lat0) * D2R, turn: base.turn - dLon * D2R };
}

type View = { tilt: number; turn: number };

/** Where a place sits across the screen once the globe is turned and tilted: [right, up]. */
function onScreen([lat, lon]: LatLon, { tilt, turn }: View) {
  const x = Math.cos(lat * D2R) * Math.sin(lon * D2R), y = Math.sin(lat * D2R), z = Math.cos(lat * D2R) * Math.cos(lon * D2R);
  return [x * Math.cos(turn) + z * Math.sin(turn), y * Math.cos(tilt) - (-x * Math.sin(turn) + z * Math.cos(turn)) * Math.sin(tilt)];
}
const slant = (from: LatLon, to: LatLon, view: View) => {
  const [ax, ay] = onScreen(from, view), [bx, by] = onScreen(to, view);
  return Math.atan2(by - ay, bx - ax);
};

/**
 * How far to lean the globe (radians, anticlockwise on screen) so a route crosses the screen at the same
 * angle as the tuned one, mirrored when it heads the other way. A route needing more than `max` (a
 * north–south one, like Australia or New Zealand) would put the globe on its side, so it gets null: keep it upright.
 */
export function lean(tuned: { view: View; from: LatLon; to: LatLon }, view: View, from: LatLon, to: LatLon, max = 0.7) {
  const was = slant(tuned.from, tuned.to, tuned.view), now = slant(from, to, view);
  const wanted = Math.cos(now) < 0 ? Math.PI - was : was;
  const needed = Math.atan2(Math.sin(wanted - now), Math.cos(wanted - now));
  return Math.abs(needed) <= max ? needed : null;
}
