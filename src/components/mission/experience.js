// The "mission" intro: a short 3D story played over the homepage on a first visit.
// createMission() builds everything inside `root` and returns destroy() to tear it all down.
import * as THREE from "three";
import gsap from "gsap";
import { C, latLon, createBackdrop, createPlanet, createPod, createTask, taskKinds, createSatellite, createConstellation, createArc, createMarkets } from "./world";
import { LANDING, lean, MARKETS, PHILIPPINES, REGION_MARKETS, reaim, visitorRegion } from "@/lib/markets";

const MARKUP = `
  <canvas class="gvm-gl" aria-hidden="true"></canvas>
  <div class="gvm-bar">
    <img class="gvm-logo" src="/brand/gve-header-mark.svg" alt="Global Virtual Experts" />
    <button type="button" class="gvm-close" data-skip aria-label="Close intro">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
    </button>
  </div>

  <section class="gvm-layer gvm-intro" data-intro>
    <p class="gvm-eyebrow">Real people · AI powered</p>
    <h2 class="gvm-display">Get your <em>time</em> back.</h2>
    <p class="gvm-lede">Skilled virtual experts in the Philippines take the admin off your plate.</p>
    <button type="button" class="gvm-begin" data-begin>
      <span>Begin your mission</span><span class="gvm-begin-icon" aria-hidden="true">→</span>
    </button>
  </section>

  <section class="gvm-layer gvm-captions" data-captions aria-live="polite">
    <p class="gvm-caption" data-caption></p>
    <p class="gvm-sub" data-sub></p>
  </section>

  <div class="gvm-pin" data-pin-mnl><span></span>Philippines</div>
  <div class="gvm-pin" data-pin-sea><span></span>Your business</div>

  <section class="gvm-layer gvm-outro" data-outro>
    <p class="gvm-eyebrow">Mission complete</p>
    <h2 class="gvm-display">You're back in <em>control.</em></h2>
    <p class="gvm-lede">Your Expert handles follow-ups, scheduling, billing and coordination. You get daily reports and sign off on what matters.</p>
    <ul class="gvm-facts">
      <li><b>5–10</b><span>business days to hire</span></li>
      <li><b>4 or 8</b><span>hour shifts in your business hours</span></li>
    </ul>
    <div class="gvm-actions">
      <a href="/contact-us/#book" class="button amber" data-call>Request a free call</a>
      <button type="button" class="gvm-enter" data-enter>Explore GVE →</button>
    </div>
    <button type="button" class="gvm-replay" data-replay>Replay</button>
  </section>

  <div class="gvm-progress" aria-hidden="true"><span data-progress></span></div>
`;

export function createMission(root, { onExit }) {
  root.innerHTML = MARKUP;
  const q = (sel) => root.querySelector(sel);
  const introEl = q("[data-intro]");
  const captionsEl = q("[data-captions]");
  const captionEl = q("[data-caption]");
  const subEl = q("[data-sub]");
  const outroEl = q("[data-outro]");
  const progressEl = q("[data-progress]");

  /* ---------- Renderer, scene, camera ---------- */

  const renderer = new THREE.WebGLRenderer({ canvas: q(".gvm-gl"), antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(C.bg, 16, 46);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 200);

  scene.add(new THREE.AmbientLight(0x3b5a99, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2.6);
  sun.position.set(-6, 7, 9);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(C.amber, 0.9);
  rim.position.set(8, -3, -6);
  scene.add(rim);

  /* ---------- World ---------- */

  const backdrop = createBackdrop();
  scene.add(backdrop.group);

  const R = 3;
  const planet = createPlanet(R);
  // The flight goes from the Philippines to the visitor's own region. The globe was tuned with the
  // Philippines ↔ US West Coast route facing the camera; other regions get the same framing, north up.
  const region = visitorRegion();
  const landing = LANDING[region];
  const aim = reaim({ tilt: 0.42, turn: -Math.PI + 0.05 }, [PHILIPPINES, LANDING.na], [PHILIPPINES, landing]);
  planet.group.rotation.set(aim.tilt, aim.turn, 0);
  // Lean the globe a little so the route crosses the screen at the tuned angle instead of hanging low.
  const tilted = lean({ view: { tilt: 0.42, turn: -Math.PI + 0.05 }, from: PHILIPPINES, to: LANDING.na }, aim, PHILIPPINES, landing);
  if (tilted !== null) {
    planet.group.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), tilted));
  } else {
    // Australia and New Zealand lie almost due south of the Philippines: leaning would tip the globe
    // over. Keep it upright, with the landing just above the middle of the globe and the Philippines above.
    const face = latLon(22, 15, 1);
    const [lat, lon] = landing.map(THREE.MathUtils.degToRad);
    const reach = Math.hypot(face.y, face.z), toward = Math.atan2(face.z, face.y);
    const tilt = toward - Math.acos(THREE.MathUtils.clamp(Math.sin(lat) / reach, -1, 1));
    const turn = Math.atan2(face.x, -face.y * Math.sin(tilt) + face.z * Math.cos(tilt)) - lon;
    planet.group.rotation.set(tilt, turn, 0);
  }
  scene.add(planet.group);
  planet.group.updateMatrixWorld(true);

  const onPlanet = ([lat, lon], r) => planet.group.localToWorld(latLon(lat, lon, r));
  const arcPoints = (from, to, lift, height) => {
    const a = latLon(...from, 1);
    const b = latLon(...to, 1);
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      pts.push(planet.group.localToWorld(new THREE.Vector3().copy(a).lerp(b, t).normalize().multiplyScalar(R + lift + height * Math.sin(Math.PI * t))));
    }
    return new THREE.CatmullRomCurve3(pts);
  };

  // The Expert's flight path
  const route = arcPoints(PHILIPPINES, landing, 0.5, 1.3);
  const arc = createArc(route);
  scene.add(arc.mesh);

  // Every other market GVE serves: quiet routes and dots, so the globe never reads as one country.
  const focus = REGION_MARKETS[region];
  const markets = createMarkets(
    Object.entries(MARKETS).flatMap(([market, points]) =>
      points.map((p) => ({ curve: arcPoints(PHILIPPINES, p, 0.06, 0.55), at: onPlanet(p, R * 1.01), lit: focus.includes(market) })),
    ),
  );
  scene.add(markets.group);

  const mnlSurface = onPlanet(PHILIPPINES, R * 1.02);
  const destSurface = onPlanet(landing, R * 1.02);
  const routeStart = route.getPoint(0);
  const routeEnd = route.getPoint(1);
  // Routes heading left of the Philippines mirror the camera moves that follow the flight.
  const side = routeEnd.x < routeStart.x ? -1 : 1;

  // Expert pod
  const pod = createPod();
  scene.add(pod.outer);
  const POD_HOME = new THREE.Vector3(10, 4.6, 0); // right of the headline, clear of the intro text
  pod.outer.position.copy(POD_HOME);
  pod.outer.scale.setScalar(0.85);

  // Seeded random so the layout is the same every visit
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const range = (lo, hi) => lo + rnd() * (hi - lo);

  // Every camera stop in the story; nothing may sit on the path between them.
  const CAM_PATH = [[0, -0.6, 15.5], [2.2, 2.4, 7.2], [0, 3.6, 9.8], [1.6 * side, 3.4, 8.2], [3.4 * side, 4.2, 9.5], [0.4, 2.2, 11.5], [0, -0.6, 14.5]].map(
    (p) => new THREE.Vector3(...p),
  );
  const seg = new THREE.Line3();
  const closest = new THREE.Vector3();
  const distToCamPath = (v) => {
    let d = Infinity;
    for (let i = 0; i < CAM_PATH.length - 1; i++) {
      seg.set(CAM_PATH[i], CAM_PATH[i + 1]).closestPointToPoint(v, true, closest);
      d = Math.min(d, closest.distanceTo(v));
    }
    return d;
  };
  const placed = [{ v: POD_HOME, size: 1.6 }]; // keep icons off the pod
  const freeSpot = (minPlanetDist, box, size = 0.5) => {
    for (let i = 0; i < 400; i++) {
      const v = new THREE.Vector3(range(...box.x), range(...box.y), range(...box.z));
      if (v.length() < minPlanetDist + size) continue;
      if (Math.abs(v.x) < 2.8 + Math.max(v.z, 0) * 0.3 && v.y > -1.5 && v.y < 6 && v.z > -1) continue; // headline area
      if (distToCamPath(v) < 2.2 + size) continue;
      if (placed.some((p) => p.v.distanceTo(v) < p.size + size + 0.3)) continue; // no overlapping objects
      placed.push({ v, size });
      return v;
    }
    return new THREE.Vector3(range(-12, 12), range(6, 9), -8);
  };

  // Tasks: the admin piling up
  const tasks = [];
  for (let i = 0; i < 30; i++) {
    const t = createTask(taskKinds[i % taskKinds.length]);
    const near = i < 12; // a cluster along the camera's first dolly
    const home = freeSpot(R + 1.4, near ? { x: [-6, 7], y: [-1, 7], z: [3, 10] } : { x: [-11, 11], y: [-5, 9], z: [-6, 7] }, 0.6);
    t.position.copy(home);
    t.scale.setScalar(range(0.45, 0.8));
    t.rotation.set(range(-0.6, 0.6), range(-0.8, 0.8), range(-0.5, 0.5));
    t.userData = { ...t.userData, home, phase: rnd() * 10, bob: 0, spin: new THREE.Vector3(range(-1, 1), range(-1, 1), range(-1, 1)) };
    scene.add(t);
    tasks.push(t);
  }

  // Scenery: three small relay satellites and a network of route dots
  const satellites = [];
  const satZones = [
    { x: [-12, 12], y: [-5, 9], z: [-7, 5] },
    { x: [-12, 12], y: [-5, 9], z: [-7, 5] },
    { x: [6.5, 10], y: [-2.5, 2], z: [-2, 3] }, // right side, below the first one
  ];
  for (const zone of satZones) {
    const sat = createSatellite();
    const size = range(0.55, 0.7);
    sat.scale.setScalar(size);
    sat.position.copy(freeSpot(R + 1.6, zone, 1.3 * size));
    sat.rotation.set(range(-0.4, 0.4), range(0, Math.PI * 2), range(-0.3, 0.3));
    sat.userData = { ...sat.userData, phase: rnd() * 10, spin: range(0.15, 0.35) * (rnd() < 0.5 ? -1 : 1) };
    scene.add(sat);
    satellites.push(sat);
  }
  const nodes = [];
  for (let i = 0; i < 46; i++) nodes.push(freeSpot(R + 1.8, { x: [-14, 14], y: [-7, 10], z: [-9, 6] }, 0.15));
  const network = createConstellation(nodes);
  scene.add(network.group);

  // Daily reports flowing back to the client
  const reports = [];
  for (let i = 0; i < 8; i++) {
    const r = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.28),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? C.amber : C.sky, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    scene.add(r);
    reports.push(r);
  }

  /* ---------- Camera rig ---------- */

  // Aimed above the globe so it sits below the intro text, clear of the subtitle.
  const rig = { pos: new THREE.Vector3(0, -0.6, 15.5), look: new THREE.Vector3(0, 5.0, 0), chaos: 0 };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

  const resize = () => {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep a similar horizontal field of view on narrow screens.
    const hfov = THREE.MathUtils.degToRad(70);
    camera.fov = Math.min(80, Math.max(45, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / camera.aspect))));
    camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  /* ---------- UI helpers ---------- */

  const setCaption = (text, sub = "") => {
    captionEl.innerHTML = text
      .split(" ")
      .map((w) => `<span class="gvm-w${w.startsWith("*") ? " gvm-accent" : ""}">${w.replace(/\*/g, "")} </span>`)
      .join("");
    subEl.textContent = sub;
    gsap.fromTo(captionEl.querySelectorAll(".gvm-w"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "power3.out" });
    gsap.fromTo(subEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: "power2.out" });
  };

  const pins = [
    { el: q("[data-pin-mnl]"), pos: mnlSurface, side: -side },
    { el: q("[data-pin-sea]"), pos: destSurface, side },
  ];
  const tmp = new THREE.Vector3();
  const updatePins = () => {
    const W = root.clientWidth, H = root.clientHeight;
    for (const p of pins) {
      tmp.copy(p.pos).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W;
      const y = (-tmp.y * 0.5 + 0.5) * H;
      const w = p.el.offsetWidth;
      const px = THREE.MathUtils.clamp(p.side < 0 ? x - w + 4 : x - 4, 8, W - w - 8);
      p.el.style.transform = `translate(${px}px, ${y - 13}px)`;
    }
  };

  /* ---------- Story timeline ---------- */

  const tl = gsap.timeline({ paused: true, onUpdate: () => (progressEl.style.width = `${tl.progress() * 100}%`) });
  const cam = (pos, look, dur, at, ease = "power2.inOut") => {
    tl.to(rig.pos, { x: pos[0], y: pos[1], z: pos[2], duration: dur, ease }, at);
    tl.to(rig.look, { x: look[0], y: look[1], z: look[2], duration: dur, ease }, at);
  };

  // 0 · Leave the intro
  tl.to(introEl, { autoAlpha: 0, y: -30, duration: 0.8, ease: "power2.in" }, 0);
  tl.to(captionsEl, { autoAlpha: 1, duration: 0.4 }, 0.6);

  // 1 · The admin piles up
  cam([2.2, 2.4, 7.2], [-0.5, 2.6, 0], 4.2, 0.2);
  tl.to(rig, { chaos: 1, duration: 3, ease: "power1.in" }, 0.6);
  tl.call(() => setCaption("Every week, the *admin* piles up.", "Follow-ups. Scheduling. Invoices. Weekends gone."), null, 1.0);

  // 2 · An Expert launches from the Philippines
  cam([0, 3.6, 9.8], [0, 1.6, 0], 3.2, 4.8);
  tl.call(() => setCaption("So an *Expert* launches from the Philippines.", "Screened, trained, and matched to your business."), null, 5.4);
  // Swing around the globe to the Philippines rather than cutting through it.
  const approach = new THREE.CatmullRomCurve3([
    POD_HOME.clone(),
    new THREE.Vector3(1.5, 5.6, 4.5),
    routeStart.clone().normalize().multiplyScalar(R + 2.2),
    routeStart.clone(),
  ]);
  const appr = { t: 0 };
  tl.to(appr, { t: 1, duration: 2.6, ease: "power2.inOut", onUpdate: () => pod.outer.position.copy(approach.getPoint(appr.t)) }, 5.0);
  tl.to(pod.outer.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 2.6, ease: "power2.inOut" }, 5.0);
  tl.to(pins[0].el, { opacity: 1, duration: 0.6 }, 6.4);
  tl.to(pins[1].el, { opacity: 1, duration: 0.6 }, 6.8);

  // 3 · Across the world, onto your hours
  const flight = { t: 0 };
  tl.to(pod.flame.material, { opacity: 0.8, duration: 0.4 }, 7.6);
  tl.to(flight, {
    t: 1,
    duration: 4,
    ease: "power1.inOut",
    onUpdate() {
      arc.mat.uniforms.uProgress.value = flight.t;
      pod.outer.position.copy(route.getPoint(flight.t));
    },
  }, 7.8);
  tl.call(() => setCaption("Working *your* hours, in your time zone.", "4- or 8-hour shifts. Hired in 5–10 business days."), null, 8.6);
  cam([1.6 * side, 3.4, 8.2], [0.8 * side, 2.0, 0], 4, 7.8);
  tl.to(pod.flame.material, { opacity: 0, duration: 0.5 }, 11.6);

  // 4 · The Expert takes the overflow
  tl.call(() => setCaption("They take the *overflow*.", "Your inbox, calendar and billing, handled."), null, 12.2);
  cam([3.4 * side, 4.2, 9.5], [routeEnd.x * 0.6, routeEnd.y, routeEnd.z * 0.6], 3.4, 12.0);
  tl.to(rig, { chaos: 0.2, duration: 2 }, 12.2);
  const order = [...tasks].sort((p, q) => p.position.distanceTo(routeEnd) - q.position.distanceTo(routeEnd));
  order.forEach((t, i) => {
    const at = 12.6 + i * 0.09;
    const badge = t.userData.inner.userData.badge;
    if (badge) tl.to(badge.scale, { x: 0, y: 0, z: 0, duration: 0.3, ease: "back.in" }, at);
    // Swing around the globe into the pod: rotate the direction, interpolate the
    // radius, and never let the radius drop below the surface + clearance.
    const fromDir = t.position.clone().normalize();
    const fromLen = t.position.length();
    const endLen = routeEnd.length();
    const turn = new THREE.Quaternion().setFromUnitVectors(fromDir, routeEnd.clone().normalize());
    const qt = new THREE.Quaternion();
    const k = { t: 0 };
    tl.to(k, {
      t: 1,
      duration: 1.3,
      ease: "power3.in",
      onUpdate: () => {
        qt.identity().slerp(turn, k.t);
        const len = Math.max(R + 0.6, fromLen + (endLen - fromLen) * k.t + 0.8 * Math.sin(Math.PI * k.t));
        t.position.copy(fromDir).applyQuaternion(qt).multiplyScalar(len);
      },
    }, at + 0.1);
    tl.to(t.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.3, ease: "power3.in" }, at + 0.1);
  });
  tl.to(pod.halo.material.color, { r: 1, g: 0.65, b: 0, duration: 0.6 }, 13.0);
  tl.fromTo(pod.halo.scale, { x: 1, y: 1, z: 1 }, { x: 1.35, y: 1.35, z: 1.35, duration: 0.5, yoyo: true, repeat: 5, ease: "sine.inOut" }, 13.0);

  // 5 · Reports come back
  tl.call(() => setCaption("And report back *daily*.", "Every hour tracked. Every task in a clear daily report."), null, 16.6);
  cam([0.4, 2.2, 11.5], [0, 1.4, 0], 3.2, 16.4);
  reports.forEach((r, i) => {
    const at = 16.9 + i * 0.22;
    tl.set(r.position, { x: routeEnd.x, y: routeEnd.y, z: routeEnd.z }, at);
    tl.to(r.material, { opacity: 1, duration: 0.2 }, at);
    tl.to(r.position, { x: range(-3, 3), y: range(0, 4), z: 12, duration: 1.6, ease: "power2.in" }, at);
    tl.to(r.rotation, { x: range(-3, 3), y: range(-3, 3), duration: 1.6 }, at);
    tl.to(r.material, { opacity: 0, duration: 0.3 }, at + 1.3);
  });

  // 6 · Mission complete
  const orbit = { on: false, a: 0.9 };
  const orbitPos = (ang, out = new THREE.Vector3()) => out.set(Math.cos(ang) * 4.8, 1.2 + Math.sin(ang) * 1.0, Math.sin(ang) * 4.8);
  const orbitStart = orbitPos(orbit.a);
  tl.to(pins.map((p) => p.el), { opacity: 0, duration: 0.5 }, 19.6);
  tl.to(arc.mat.uniforms.uProgress, { value: 0, duration: 1 }, 19.6);
  tl.to(captionsEl, { autoAlpha: 0, duration: 0.5 }, 19.8);
  tl.to(pod.outer.position, { x: orbitStart.x, y: orbitStart.y, z: orbitStart.z, duration: 2.2, ease: "power2.inOut" }, 19.8);
  tl.to(pod.outer.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 2.2, ease: "power2.inOut" }, 19.8);
  tl.to(pod.halo.material.color, { r: 0.55, g: 0.78, b: 1, duration: 1 }, 19.8);
  cam([0, -0.6, 14.5], [0, 1.2, 0], 2.6, 19.8);
  tl.fromTo(outroEl, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, 21.0);
  tl.call(() => {
    orbit.on = true;
    q("[data-call]").focus({ preventScroll: true });
  }, null, 22.0);

  /* ---------- Controls ---------- */

  let introReveal;
  const listeners = [];
  const on = (el, type, fn) => {
    el.addEventListener(type, fn);
    listeners.push(() => el.removeEventListener(type, fn));
  };
  on(q("[data-begin]"), "click", () => {
    introReveal?.kill(); // a still-running fade-in would otherwise keep the headline on screen
    tl.play();
  });
  on(q("[data-skip]"), "click", () => onExit());
  on(q("[data-enter]"), "click", () => onExit());
  on(q("[data-call]"), "click", () => onExit({ navigating: true }));
  on(q("[data-replay]"), "click", () => {
    orbit.on = false;
    orbit.a = 0.9;
    tl.pause(0);
    // Paths driven by onUpdate aren't reverted by GSAP, so put things back by hand.
    arc.mat.uniforms.uProgress.value = 0;
    pod.outer.position.copy(POD_HOME);
    for (const t of tasks) t.position.copy(t.userData.home);
    progressEl.style.width = "0";
    introReveal = gsap.to(introEl, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.2 });
  });
  on(window, "keydown", (e) => e.key === "Escape" && onExit());
  on(window, "pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  });

  /* ---------- Loop ---------- */

  // Safety net: nothing may ever pass inside the globe.
  const keepOut = (p, min) => {
    const l = p.length();
    if (l > 0 && l < min) p.multiplyScalar(min / l);
  };

  const timer = new THREE.Timer();
  let raf = 0;
  const frame = () => {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();

    mouse.sx += (mouse.x - mouse.sx) * 0.04;
    mouse.sy += (mouse.y - mouse.sy) * 0.04;
    camera.position.set(rig.pos.x + mouse.sx * 0.7, rig.pos.y - mouse.sy * 0.45, rig.pos.z);
    camera.lookAt(rig.look);

    const c = rig.chaos;
    for (const task of tasks) {
      const u = task.userData;
      // Phase is integrated, so changing speed never makes the icon jump.
      u.bob += dt * (0.6 + c * 0.9);
      u.inner.position.y = Math.sin(u.bob + u.phase) * (0.12 + c * 0.12);
      u.inner.position.x = Math.cos(u.bob * 0.7 + u.phase) * (0.06 + c * 0.08);
      u.inner.rotation.x += u.spin.x * dt * (0.15 + c * 0.45);
      u.inner.rotation.y += u.spin.y * dt * (0.2 + c * 0.55);
      u.inner.rotation.z += u.spin.z * dt * (0.1 + c * 0.3);
      keepOut(task.position, R + 0.45);
    }
    for (const s of satellites) {
      const u = s.userData;
      u.inner.rotation.y += u.spin * dt;
      u.inner.position.y = Math.sin(t * 0.5 + u.phase) * 0.15;
      u.light.material.color.setHex(Math.sin(t * 3 + u.phase) > 0.6 ? C.amber : 0x4a3000);
    }
    network.update(t);

    pod.inner.position.y = Math.sin(t * 1.3) * 0.12;
    pod.inner.rotation.z = Math.sin(t * 0.7) * 0.08;
    pod.inner.rotation.y = Math.sin(t * 0.3) * 0.5 - 0.35;
    pod.halo.rotation.z = t * 0.6;
    pod.beacon.material.color.setHex(Math.sin(t * 4) > 0 ? C.amber : 0x5a3a00);
    if (orbit.on) {
      orbit.a += dt * 0.18;
      orbitPos(orbit.a, pod.outer.position);
    }
    keepOut(pod.outer.position, R + 0.45);

    planet.grid.rotation.y = t * 0.03;
    backdrop.update(t);
    arc.mat.uniforms.uTime.value = t;

    renderer.render(scene, camera);
    updatePins();
    raf = requestAnimationFrame(frame);
  };

  // Compile shaders up front so the first frames don't hitch, then reveal the intro.
  renderer.compile(scene, camera);
  raf = requestAnimationFrame(frame);
  introReveal = gsap.fromTo(introEl, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.1, delay: 0.2, ease: "power3.out" });
  q("[data-begin]").focus({ preventScroll: true });

  return {
    destroy() {
      cancelAnimationFrame(raf);
      tl.kill();
      introReveal?.kill();
      gsap.killTweensOf([captionEl.querySelectorAll(".gvm-w"), subEl]);
      listeners.forEach((off) => off());
      removeEventListener("resize", resize);
      scene.traverse((o) => {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          m.map?.dispose();
          m.dispose();
        });
      });
      timer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      root.innerHTML = "";
    },
  };
}
