import * as THREE from "three";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath, geoGraticule10 } from "d3-geo";
import land110 from "world-atlas/land-110m.json";

// GVE brand palette
export const C = {
  bg: 0x05070d,
  bg2: 0x0a1020,
  ink: 0xeef2f8,
  blue: 0x2a8cff,
  sky: 0x8cc8ff,
  amber: 0xffa600,
  navy: 0x13203d,
  navy2: 0x1d2f55,
  paper: 0xdbe8f8,
};

// Three-step ramp gives everything the flat, illustrated look.
const ramp = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

export const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra });

const outlineMat = new THREE.MeshBasicMaterial({ color: 0x02040a, side: THREE.BackSide });

// Inverted-hull outline: a slightly larger back-face copy drawn in near-black.
export function outline(mesh, k = 1.06) {
  const o = new THREE.Mesh(mesh.geometry, outlineMat);
  o.scale.setScalar(k);
  o.renderOrder = -1;
  mesh.add(o);
  return mesh;
}

const mesh = (geo, mat, k) => (k === false ? new THREE.Mesh(geo, mat) : outline(new THREE.Mesh(geo, mat), k));

// lat/lon → point on a sphere. lon 0 faces +z, matching the gve-revamp globe.
export function latLon(lat, lon, r) {
  const φ = THREE.MathUtils.degToRad(lat);
  const λ = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r * Math.cos(φ) * Math.sin(λ), r * Math.sin(φ), r * Math.cos(φ) * Math.cos(λ));
}

/* ---------- Backdrop ---------- */

export function createBackdrop() {
  const group = new THREE.Group();

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(80, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        varying vec3 vP; uniform float uTime;
        void main(){
          vec3 deep = vec3(0.020,0.027,0.051);   // #05070d
          vec3 navy = vec3(0.039,0.063,0.125);   // #0a1020
          vec3 blue = vec3(0.165,0.549,1.0);     // #2a8cff
          vec3 amber = vec3(1.0,0.651,0.0);      // #ffa600
          float h = vP.y*0.5+0.5;
          vec3 c = mix(deep, navy, smoothstep(0.15,0.75,h));
          // soft brand-colored nebulae
          c += blue * 0.16 * smoothstep(0.75, 0.0, distance(vP, normalize(vec3(0.7,0.45,-0.6))));
          c += blue * 0.08 * smoothstep(0.9, 0.0, distance(vP, normalize(vec3(-0.8,-0.1,-0.5))));
          c += amber * 0.05 * smoothstep(0.6, 0.0, distance(vP, normalize(vec3(-0.5,-0.6,-0.7))));
          gl_FragColor = vec4(c,1.);
        }`,
    }),
  );
  group.add(sky);

  const n = 1400;
  const pos = new Float32Array(n * 3);
  const size = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 30);
    pos.set([v.x, v.y, v.z], i * 3);
    size[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: { value: 0 }, uPR: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `
      attribute float aSize; uniform float uTime; uniform float uPR; varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.);
        vA = 0.35 + 0.65 * abs(sin(uTime*0.8 + aSize*40.));
        gl_PointSize = (1.0 + aSize*2.4) * uPR;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vA;
      void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(vec3(0.85,0.92,1.0), vA*smoothstep(0.5,0.0,d)); }`,
  });
  const stars = new THREE.Points(g, starMat);
  group.add(stars);

  return { group, update: (t) => (starMat.uniforms.uTime.value = t) };
}

/* ---------- Planet ---------- */

function landTexture() {
  const W = 2048, H = 1024;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
  const path = geoPath(proj, ctx);

  ctx.fillStyle = "#0d3a85"; // ocean: deep brand blue
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  path(geoGraticule10());
  ctx.strokeStyle = "rgba(140,200,255,0.10)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const land = feature(land110, land110.objects.land);
  ctx.beginPath();
  path(land);
  ctx.fillStyle = "#2a8cff"; // land: GVE blue
  ctx.fill();
  ctx.strokeStyle = "#8cc8ff";
  ctx.lineWidth = 2;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.offset.x = 0.25; // three's sphere UV starts at lon -90°
  tex.anisotropy = 4;
  return tex;
}

export function createPlanet(R) {
  const group = new THREE.Group();

  const body = outline(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), toon(0xffffff, { map: landTexture() })), 1.012);
  group.add(body);

  // Wireframe shell echoing the GVE logo globe.
  const grid = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: C.sky, transparent: true, opacity: 0.32 });
  const r = R * 1.07;
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 4) pts.push(latLon(lat, lon, r));
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const pts = [];
    for (let a = 0; a <= 360; a += 4) {
      const v = new THREE.Vector3(0, r * Math.sin(THREE.MathUtils.degToRad(a)), r * Math.cos(THREE.MathUtils.degToRad(a)));
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(lon + 90));
      pts.push(v);
    }
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  grid.rotation.z = 0.35;
  group.add(grid);

  // Atmosphere rim
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.13, 64, 32),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(abs(dot(vN, vV)), 2.0); gl_FragColor = vec4(vec3(0.33,0.65,1.0), f*1.1); }`,
    }),
  );
  group.add(atmo);

  return { group, grid };
}

/* ---------- Expert pod ---------- */

export function createPod() {
  const outer = new THREE.Group(); // positioned by the story
  const inner = new THREE.Group(); // idle bob + tilt
  outer.add(inner);

  const body = mesh(new THREE.SphereGeometry(1, 48, 32), toon(C.paper), 1.04);
  inner.add(body);

  // Wide cockpit window
  const win = mesh(
    new THREE.SphereGeometry(1.015, 48, 24, -0.9, 1.8, 0.75, 0.85),
    toon(C.navy2, { side: THREE.DoubleSide }),
    false,
  );
  inner.add(win);
  const glare = new THREE.Mesh(
    new THREE.SphereGeometry(1.025, 24, 8, -0.55, 0.22, 0.85, 0.6),
    new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  inner.add(glare);

  // Amber equator band (the brand's accent)
  const band = mesh(new THREE.TorusGeometry(1.0, 0.07, 12, 64), toon(C.amber), 1.15);
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.18;
  inner.add(band);

  // Panel seams
  for (let i = 0; i < 3; i++) {
    const seam = new THREE.Mesh(new THREE.TorusGeometry(1.004, 0.012, 6, 64), new THREE.MeshBasicMaterial({ color: 0x8fa4c4 }));
    seam.rotation.x = Math.PI / 2;
    seam.position.y = -0.4 - i * 0.16;
    seam.scale.setScalar(Math.sqrt(1 - (0.4 + i * 0.16) ** 2));
    inner.add(seam);
  }

  // Thruster
  const thr = mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.25, 24), toon(C.navy2), 1.08);
  thr.position.y = -0.98;
  inner.add(thr);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 1.0, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -1.6;
  inner.add(flame);

  // Antenna with amber beacon
  const ant = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), toon(0x9fb3d1), false);
  ant.position.set(0.35, 1.08, 0);
  ant.rotation.z = -0.3;
  inner.add(ant);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), new THREE.MeshBasicMaterial({ color: C.amber }));
  beacon.position.set(0.43, 1.33, 0);
  inner.add(beacon);

  // Halo ring (like a guidance ring) — pulses when the Expert takes work
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.018, 8, 96),
    new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.55 }),
  );
  halo.rotation.x = Math.PI / 2.3;
  inner.add(halo);

  return { outer, inner, flame, halo, beacon };
}

/* ---------- Tasks (the admin debris) ---------- */

const flat = (w, h, d, color, k) => mesh(new THREE.BoxGeometry(w, h, d), toon(color), k);

function badge(group, x, y) {
  const b = mesh(new THREE.SphereGeometry(0.11, 16, 12), toon(C.amber), 1.15);
  b.position.set(x, y, 0.12);
  group.add(b);
  group.userData.badge = b;
}

const taskBuilders = {
  envelope() {
    const g = new THREE.Group();
    g.add(flat(0.9, 0.6, 0.07, C.paper, 1.05));
    const s = new THREE.Shape();
    s.moveTo(-0.45, 0.3); s.lineTo(0.45, 0.3); s.lineTo(0, -0.04); s.closePath();
    const flap = new THREE.Mesh(new THREE.ShapeGeometry(s), toon(C.blue));
    flap.position.z = 0.05;
    g.add(flap);
    badge(g, 0.45, 0.3);
    return g;
  },
  calendar() {
    const g = new THREE.Group();
    g.add(flat(0.8, 0.8, 0.08, C.paper, 1.05));
    const top = flat(0.84, 0.2, 0.12, C.blue, false);
    top.position.y = 0.3;
    g.add(top);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const cell = flat(0.14, 0.12, 0.02, c === 1 && r === 0 ? C.amber : C.navy2, false);
        cell.position.set(-0.22 + c * 0.22, 0.02 - r * 0.2, 0.06);
        g.add(cell);
      }
    for (const x of [-0.2, 0.2]) {
      const ring = flat(0.05, 0.16, 0.05, C.navy, false);
      ring.position.set(x, 0.44, 0.0);
      g.add(ring);
    }
    badge(g, 0.4, 0.4);
    return g;
  },
  invoice() {
    const g = new THREE.Group();
    g.add(flat(0.6, 0.82, 0.05, C.paper, 1.05));
    for (let i = 0; i < 4; i++) {
      const line = flat(i === 0 ? 0.24 : 0.4, 0.04, 0.02, i === 0 ? C.blue : C.navy2, false);
      line.position.set(i === 0 ? -0.08 : 0, 0.26 - i * 0.14, 0.045);
      g.add(line);
    }
    const total = flat(0.16, 0.08, 0.02, C.amber, false);
    total.position.set(0.12, -0.3, 0.045);
    g.add(total);
    badge(g, 0.3, 0.41);
    return g;
  },
  chat() {
    const g = new THREE.Group();
    const b = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 32), toon(C.sky), 1.06);
    b.rotation.x = Math.PI / 2;
    b.scale.set(1.15, 1, 0.85);
    g.add(b);
    const tail = mesh(new THREE.ConeGeometry(0.12, 0.25, 3), toon(C.sky), false);
    tail.position.set(-0.3, -0.38, 0);
    tail.rotation.z = 0.6;
    g.add(tail);
    for (let i = 0; i < 3; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), toon(C.navy));
      dot.position.set(-0.16 + i * 0.16, 0, 0.07);
      g.add(dot);
    }
    badge(g, 0.4, 0.3);
    return g;
  },
  clock() {
    const g = new THREE.Group();
    const face = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 40), toon(C.paper), 1.06);
    face.rotation.x = Math.PI / 2;
    g.add(face);
    const rim = mesh(new THREE.TorusGeometry(0.4, 0.05, 10, 40), toon(C.blue), false);
    g.add(rim);
    const h1 = flat(0.04, 0.22, 0.02, C.navy, false);
    h1.position.set(0, 0.09, 0.06);
    g.add(h1);
    const h2 = flat(0.18, 0.04, 0.02, C.amber, false);
    h2.position.set(0.08, 0, 0.075);
    g.add(h2);
    badge(g, 0.33, 0.33);
    return g;
  },
  phone() {
    const g = new THREE.Group();
    g.add(flat(0.42, 0.78, 0.07, C.navy2, 1.05));
    const scr = flat(0.34, 0.62, 0.01, C.sky, false);
    scr.position.z = 0.05;
    g.add(scr);
    badge(g, 0.21, 0.39);
    return g;
  },
};
export const taskKinds = Object.keys(taskBuilders);

export function createTask(kind) {
  const outer = new THREE.Group();
  const inner = taskBuilders[kind]();
  outer.add(inner);
  outer.userData.inner = inner;
  return outer;
}

/* ---------- Scenery ---------- */

// Relay satellite: the link between the Philippines and your business.
export function createSatellite() {
  const outer = new THREE.Group();
  const inner = new THREE.Group();
  outer.add(inner);

  inner.add(flat(0.42, 0.42, 0.42, C.paper, 1.06));
  inner.add(flat(0.44, 0.08, 0.44, C.amber, false));

  for (const side of [-1, 1]) {
    const arm = flat(0.22, 0.04, 0.04, 0x9fb3d1, false);
    arm.position.x = side * 0.32;
    inner.add(arm);
    const panel = flat(0.7, 0.03, 0.34, C.blue, 1.06);
    panel.position.x = side * 0.78;
    inner.add(panel);
    for (let i = 1; i < 4; i++) {
      const line = flat(0.012, 0.036, 0.342, C.sky, false);
      line.position.set(side * (0.43 + i * 0.175), 0, 0);
      inner.add(line);
    }
  }

  const dish = mesh(new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(C.paper, { side: THREE.DoubleSide }), false);
  dish.rotation.x = Math.PI / 2;
  dish.position.z = 0.32;
  inner.add(dish);
  const feed = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), toon(0x9fb3d1), false);
  feed.rotation.x = Math.PI / 2;
  feed.position.z = 0.42;
  inner.add(feed);

  const light = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: C.amber }));
  light.position.set(0, 0.25, 0);
  inner.add(light);

  outer.userData = { inner, light };
  return outer;
}

// Faint network of dots and lines, echoing the routes on the GVE globe.
export function createConstellation(points) {
  const group = new THREE.Group();
  const pos = new Float32Array(points.length * 3);
  const col = new Float32Array(points.length * 3);
  const seed = new Float32Array(points.length);
  const amber = new THREE.Color(C.amber), sky = new THREE.Color(C.sky);
  points.forEach((p, i) => {
    pos.set([p.x, p.y, p.z], i * 3);
    const c = i % 4 === 0 ? amber : sky;
    col.set([c.r, c.g, c.b], i * 3);
    seed[i] = Math.random() * 10;
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uPR: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `
      attribute vec3 aColor; attribute float aSeed; uniform float uTime; uniform float uPR; varying vec3 vC; varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.);
        vC = aColor;
        vA = 0.55 + 0.45 * sin(uTime*1.2 + aSeed);
        gl_PointSize = (90.0 / -mv.z) * uPR;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA;
      void main(){
        float d = length(gl_PointCoord-0.5);
        float core = smoothstep(0.22, 0.12, d);
        float glow = smoothstep(0.5, 0.0, d) * 0.35;
        if (core + glow < 0.01) discard;
        gl_FragColor = vec4(vC, (core + glow) * vA);
      }`,
  });
  group.add(new THREE.Points(g, mat));

  // Link each dot to its two nearest neighbours.
  const seg = [];
  points.forEach((p, i) => {
    points
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((o) => o.j !== i && o.d < 6)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => i < j && seg.push(p, points[j]));
  });
  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(seg),
      new THREE.LineBasicMaterial({ color: C.sky, transparent: true, opacity: 0.14, depthWrite: false }),
    ),
  );

  return { group, update: (t) => (mat.uniforms.uTime.value = t) };
}

/* ---------- Route arc ---------- */

export function createArc(curve) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uProgress: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      varying vec2 vUv; uniform float uProgress; uniform float uTime;
      void main(){
        if (vUv.x > uProgress) discard;
        float dash = step(0.45, fract(vUv.x*48.0 - uTime*1.5));
        float head = smoothstep(uProgress-0.06, uProgress, vUv.x);
        vec3 col = mix(vec3(1.0,0.65,0.0), vec3(1.0,0.85,0.5), head);
        gl_FragColor = vec4(col, max(dash*0.9, head));
      }`,
  });
  return { mesh: new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.035, 8, false), mat), mat };
}

/* ---------- Markets ---------- */

// Quiet routes from the Philippines to every market, with a dot on each. The visitor's region is lit amber.
export function createMarkets(items) {
  const group = new THREE.Group();
  const lit = { route: new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.45, depthWrite: false }), dot: new THREE.MeshBasicMaterial({ color: C.amber }) };
  const quiet = { route: new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.3, depthWrite: false }), dot: new THREE.MeshBasicMaterial({ color: C.sky }) };
  const dotGeo = new THREE.SphereGeometry(0.055, 12, 12);
  for (const { curve, at, lit: on } of items) {
    const m = on ? lit : quiet;
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.014, 6, false), m.route));
    const dot = new THREE.Mesh(dotGeo, m.dot);
    dot.position.copy(at);
    group.add(dot);
  }
  return { group };
}
