import * as THREE from 'three';
import { makeNoise, clamp, lerp, smoothstep } from './noise.js';

// Satu-satunya sumber kebenaran geometri dunia: jalur 45 lokasi, tinggi tanah, sungai, danau.
// Urutan, nomor, dan wilayah 45 petak sama dengan engine asli (0..44; 9 petak per pulau).
export const SEA_LEVEL = 0;
export const RING_R = 54;
const DEG = Math.PI / 180;
const K = 24;                     // sampel per petak (jalan = 45*K sampel)
const M = 45 * K;
const ROAD_HALF = 2.4;

const CORNER_RADIUS = [56, 52, 57, 53, 56];
const BEND_A = [3.0, -3.0, 4.0, -2.0, 3.5];
const BEND_B = [2.5, 3.0, -2.5, 3.0, -2.0];

export const ISLAND_MID_ANGLE = [0, 1, 2, 3, 4].map((k) => (90 + 72 * k) * DEG);
const angDist = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

export function regionOfAngle(ang) {
  let deg = ang / DEG - 54;
  deg = ((deg % 360) + 360) % 360;
  return Math.floor(deg / 72) % 5;
}

export function createWorld() {
  const n = makeNoise(62);

  // ---------- 1. Jalur 45 titik kendali (pentagon organik, bukan papan kaku) ----------
  const corners = [0, 1, 2, 3, 4].map((k) => {
    const a = (54 + 72 * k) * DEG;
    return new THREE.Vector2(Math.cos(a) * CORNER_RADIUS[k], Math.sin(a) * CORNER_RADIUS[k]);
  });
  const control = [];
  for (let i = 0; i < 45; i++) {
    const k = Math.floor(i / 9), slot = i % 9, u = slot / 9;
    const a = corners[k], b = corners[(k + 1) % 5];
    const mid = a.clone().lerp(b, 0.5);
    const inward = mid.clone().multiplyScalar(-1).normalize();
    const bend = Math.sin(Math.PI * u) * BEND_A[k] + Math.sin(2 * Math.PI * u) * BEND_B[k] * 0.6;
    const p = a.clone().lerp(b, u).addScaledVector(inward, bend);
    control.push(new THREE.Vector3(p.x, 0, p.y));
  }
  const curve = new THREE.CatmullRomCurve3(control, true, 'centripetal');

  // ---------- 2. Sampel jalan (padat) ----------
  const sx = new Float32Array(M), sz = new Float32Array(M), sy = new Float32Array(M);
  const stx = new Float32Array(M), stz = new Float32Array(M), ss = new Float32Array(M);
  for (let j = 0; j < M; j++) {
    const p = curve.getPoint(j / M);
    sx[j] = p.x; sz[j] = p.z;
  }
  let acc = 0;
  for (let j = 0; j < M; j++) {
    ss[j] = acc;
    const nx = sx[(j + 1) % M], nz = sz[(j + 1) % M];
    acc += Math.hypot(nx - sx[j], nz - sz[j]);
  }
  const roadLength = acc;
  for (let j = 0; j < M; j++) {
    const px = sx[(j + 1) % M] - sx[(j - 1 + M) % M], pz = sz[(j + 1) % M] - sz[(j - 1 + M) % M];
    const l = Math.hypot(px, pz) || 1;
    stx[j] = px / l; stz[j] = pz / l;
  }

  // ---------- 3. Tinggi dasar (pulau, gunung, pantai) ----------
  const riverAng = Math.atan2(control[0].z, control[0].x); // diganti setelah titik sungai ditentukan
  const world = {
    n, curve, M, K, roadLength, ROAD_HALF,
    samples: { x: sx, y: sy, z: sz, tx: stx, tz: stz, s: ss },
    riverAng,
  };

  const coastR = (ang) => 118 + 7 * Math.sin(ang * 3 + 0.7) + 4 * Math.sin(ang * 7 + 2.1) + 2 * Math.sin(ang * 13);
  world.coastR = coastR;
  const volcano = { x: Math.cos(18 * DEG) * 103, z: Math.sin(18 * DEG) * 103 };
  world.volcano = volcano;

  const baseHeight = (x, z) => {
    const r = Math.hypot(x, z), ang = Math.atan2(z, x);
    const coast = coastR(ang);
    const land = smoothstep(coast + 3, coast - 11, r);
    const inland = smoothstep(24, 46, r);
    let h = 2.5 + n.fbm(x * 0.045 + 10, z * 0.045 - 4, 3) * 2.6 * (0.25 + 0.75 * inland);
    h += n.noise(x * 0.25, z * 0.25) * 0.12;
    // Pegunungan sebagai batas alami di sisi luar jalan.
    const valley = world.riverAng === undefined ? 1 : smoothstep(0.12, 0.42, angDist(ang, world.riverAng));
    const ring = smoothstep(78, 96, r) * smoothstep(coast - 1, coast - 18, r);
    const region = regionOfAngle(ang);
    const boost = [1.0, 0.6, 0.85, 1.35, 0.8][region];
    const ridge = 1 - Math.abs(n.noise(x * 0.055 + 3, z * 0.055 + 7));
    const body = 0.5 + 0.5 * n.fbm(x * 0.02 - 8, z * 0.02 + 5, 3);
    h += ring * valley * boost * (4 + 17 * Math.pow(ridge, 1.5) * (0.5 + 0.7 * body));
    // Gunung berapi di sisi Jawa.
    const dv = Math.hypot(x - volcano.x, z - volcano.z);
    h += 19 * Math.exp(-(dv * dv) / 210) * land - 4 * Math.exp(-(dv * dv) / 8);
    return lerp(-3.4, h, land);
  };
  world.baseHeight = baseHeight;

  // ---------- 4. Tinggi jalan: mengikuti kontur, dihaluskan ----------
  const raw = new Float32Array(M);
  for (let j = 0; j < M; j++) raw[j] = baseHeight(sx[j], sz[j]);
  let cur = raw;
  for (let pass = 0; pass < 3; pass++) {
    const next = new Float32Array(M), W = 26;
    for (let j = 0; j < M; j++) {
      let sum = 0;
      for (let d = -W; d <= W; d++) sum += cur[(j + d + M) % M];
      next[j] = sum / (2 * W + 1);
    }
    cur = next;
  }
  for (let j = 0; j < M; j++) sy[j] = Math.max(cur[j], 1.5);

  // ---------- 5. Data setiap lokasi ----------
  const tiles = [];
  for (let i = 0; i < 45; i++) {
    const j = i * K;
    const x = sx[j], z = sz[j], tx = stx[j], tz = stz[j];
    let nx = -tz, nz = tx;
    if (nx * -x + nz * -z < 0) { nx = -nx; nz = -nz; }   // normal ke arah dalam (pusat)
    tiles.push({ index: i, island: Math.floor(i / 9), slot: i % 9, sample: j, x, y: sy[j], z, tx, tz, nx, nz, corner: i % 9 === 0 });
  }
  world.tiles = tiles;
  world.WALK_Y = 0.32;      // tinggi pijakan pion di atas permukaan jalur

  // Lokasi lima landmark wilayah: di sisi LUAR jalan, di tengah tiap pulau (tidak menutupi 45 petak).
  const heroDefs = [{ k: 0, ti: 4.5 }, { k: 1, ti: 13.5 }, { k: 2, ti: 25.4 }, { k: 3, ti: 31.5 }, { k: 4, ti: 40.5 }];
  world.heroes = heroDefs.map((d) => {
    const j = Math.round(d.ti * K) % M;
    let nx = -stz[j], nz = stx[j];
    if (nx * -sx[j] + nz * -sz[j] < 0) { nx = -nx; nz = -nz; }
    const D = 25;
    return { k: d.k, x: sx[j] - nx * D, z: sz[j] - nz * D, y: sy[j], r0: 11.5, r1: 16, rotationY: Math.atan2(nx, nz), labelY: 20 };
  });
  world.landmarkPositions = world.heroes.map((h) => ({ island: h.k, x: h.x, z: h.z }));

  // Plat miniatur kota di sisi luar jalan (6.8 x 9). Didaftarkan oleh GameBridge untuk tiap petak aset.
  world.plates = [];
  world.addPlate = (i) => {
    const t = tiles[i], OUT = 7.5;
    world.plates.push({ i, x: t.x - t.nx * OUT, z: t.z - t.nz * OUT, y: t.y, nx: t.nx, nz: t.nz, ux: t.nz, uz: -t.nx, hw: 3.4, hd: 4.5, ry: Math.atan2(t.nx, t.nz) });
  };

  // ---------- 6. Sungai & danau ----------
  const crossIdx = Math.round(21.5 * K);
  const C = new THREE.Vector3(sx[crossIdx], 0, sz[crossIdx]);
  world.riverAng = Math.atan2(C.z, C.x);
  const lake = { x: C.x * 0.3, z: C.z * 0.3, r: 8.4 };
  world.lake = lake;
  const river = [];
  const dirOut = new THREE.Vector3(C.x, 0, C.z).normalize();
  const perp = new THREE.Vector3(-dirOut.z, 0, dirOut.x);
  for (let s = 0; s <= 1.001; s += 0.1) {
    const p = new THREE.Vector3(lake.x, 0, lake.z).lerp(C, s);
    p.addScaledVector(perp, Math.sin(s * Math.PI * 2) * 1.6 * (1 - s));
    river.push({ x: p.x, z: p.z, hw: 1.6 + s * 0.8 });
  }
  for (let s = 3; s <= 80; s += 3) {
    const wob = Math.sin(s / 11) * 4 * smoothstep(0, 10, s);
    river.push({ x: C.x + dirOut.x * s + perp.x * wob, z: C.z + dirOut.z * s + perp.z * wob, hw: 2.4 + s * 0.035 });
  }
  world.river = river;
  world.crossing = { x: C.x, z: C.z, sample: crossIdx, tx: stx[crossIdx], tz: stz[crossIdx] };

  const riverInfo = (x, z) => {
    let best = Infinity, hw = 2;
    for (let i = 0; i < river.length - 1; i++) {
      const a = river[i], b = river[i + 1];
      const abx = b.x - a.x, abz = b.z - a.z;
      const t = clamp(((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz), 0, 1);
      const d = Math.hypot(x - (a.x + abx * t), z - (a.z + abz * t));
      if (d < best) { best = d; hw = a.hw + (b.hw - a.hw) * t; }
    }
    return { d: best, hw };
  };
  world.riverInfo = riverInfo;
  const lakeDist = (x, z) => {
    const ang = Math.atan2(z - lake.z, x - lake.x);
    const wob = 1 + 0.16 * Math.sin(ang * 3 + 1) + 0.08 * Math.sin(ang * 5);
    return Math.hypot(x - lake.x, z - lake.z) / wob;
  };
  world.lakeDist = lakeDist;
  world.isWater = (x, z) => {
    const r = riverInfo(x, z);
    return r.d < r.hw + 0.6 || lakeDist(x, z) < lake.r + 0.4;
  };

  // ---------- 7. Lot / landmark di sisi dalam (atau luar bila terhalang air) ----------
  const lots = [];
  for (const t of tiles) {
    const off = t.corner ? 9.5 : 5.7;
    let side = 1;
    let x = t.x + t.nx * off, z = t.z + t.nz * off;
    const blocked = (px, pz) => { const r = riverInfo(px, pz); return r.d < r.hw + 5 || lakeDist(px, pz) < lake.r + 4.5; };
    if (blocked(x, z) || blocked(t.x + t.nx * (off - 2.4), t.z + t.nz * (off - 2.4))) {
      side = -1; x = t.x - t.nx * off; z = t.z - t.nz * off;
    }
    lots.push({ index: t.index, x, z, y: t.y, side, fx: -t.nx * side, fz: -t.nz * side, rotationY: Math.atan2(-t.nx * side, -t.nz * side) });
  }
  world.lots = lots;

  // ---------- 8. Tinggi akhir: kontur + jalan + lot + kota + air ----------
  const nearestRoad = (x, z) => {
    let best = Infinity, bj = 0;
    for (let j = 0; j < M; j += 2) {
      const dx = x - sx[j], dz = z - sz[j];
      const d = dx * dx + dz * dz;
      if (d < best) { best = d; bj = j; }
    }
    for (let j = bj - 1; j <= bj + 1; j++) {
      const jj = (j + M) % M;
      const dx = x - sx[jj], dz = z - sz[jj];
      const d = dx * dx + dz * dz;
      if (d < best) { best = d; bj = jj; }
    }
    return { d: Math.sqrt(best), j: bj };
  };
  world.nearestRoad = nearestRoad;

  world.heightAt = (x, z, opts = {}) => {
    let h = baseHeight(x, z);
    const r = Math.hypot(x, z);
    // Alas kota yang datar.
    h = lerp(h, 2.5, 1 - smoothstep(26, 35, r));
    if (r > 28 && r < 76) {
      const nr = nearestRoad(x, z);
      const w = 1 - smoothstep(3.3, 8.2, nr.d);
      if (w > 0) h = lerp(h, sy[nr.j] - 0.04, w);
    }
    for (let i = 0; i < 45; i++) {
      const lot = lots[i];
      const dx = x - lot.x, dz = z - lot.z;
      if (dx > 9.5 || dx < -9.5 || dz > 9.5 || dz < -9.5) continue;
      const d = Math.hypot(dx, dz);
      const w = 1 - smoothstep(tiles[i].corner ? 7.5 : 4.4, tiles[i].corner ? 11 : 8.4, d);
      if (w > 0) h = lerp(h, lot.y - 0.02, w);
    }
    for (const pl of world.plates) {
      const dx = x - pl.x, dz = z - pl.z;
      if (dx > 8.6 || dx < -8.6 || dz > 8.6 || dz < -8.6) continue;
      const u = dx * pl.ux + dz * pl.uz, v = dx * pl.nx + dz * pl.nz;
      const dd = Math.max(Math.abs(u) / (pl.hw + 0.4), Math.abs(v) / (pl.hd + 0.4));
      const w = 1 - smoothstep(1.0, 1.75, dd);
      if (w > 0) h = lerp(h, pl.y - 0.02, w);
    }
    for (const hero of world.heroes) {
      const dx = x - hero.x, dz = z - hero.z;
      if (dx > hero.r1 || dx < -hero.r1 || dz > hero.r1 || dz < -hero.r1) continue;
      const w = 1 - smoothstep(hero.r0, hero.r1, Math.hypot(dx, dz));
      if (w > 0) h = lerp(h, hero.y - 0.02, w);
    }
    if (!opts.dry) {
      const ri = riverInfo(x, z);
      if (ri.d < ri.hw + 4) h = lerp(-1.9, h, smoothstep(ri.hw * 0.55, ri.hw + 3.2, ri.d));
      const ld = lakeDist(x, z);
      if (ld < lake.r + 5) h = lerp(-2.0, h, smoothstep(lake.r * 0.7, lake.r + 3.4, ld));
    }
    return h;
  };

  // Posisi di sepanjang jalan berdasarkan jarak tempuh (s) -> dipakai animasi jalan karakter & kendaraan.
  world.pointAtS = (s, out = {}) => {
    s = ((s % roadLength) + roadLength) % roadLength;
    let lo = 0, hi = M - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ss[mid] <= s) lo = mid; else hi = mid - 1;
    }
    const j0 = lo, j1 = (lo + 1) % M;
    const segLen = (j1 === 0 ? roadLength : ss[j1]) - ss[j0] || 1;
    const f = (s - ss[j0]) / segLen;
    out.x = lerp(sx[j0], sx[j1], f); out.z = lerp(sz[j0], sz[j1], f); out.y = lerp(sy[j0], sy[j1], f);
    out.tx = lerp(stx[j0], stx[j1], f); out.tz = lerp(stz[j0], stz[j1], f);
    return out;
  };
  world.tileS = (i) => ss[(((i % 45) + 45) % 45) * K];
  world.regionOf = (x, z) => regionOfAngle(Math.atan2(z, x));
  return world;
}
