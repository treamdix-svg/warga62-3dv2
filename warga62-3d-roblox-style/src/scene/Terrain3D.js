import * as THREE from 'three';
import { clamp, lerp, smoothstep } from '../world/noise.js';

const REGION_GRASS = [0x6cc35a, 0x4ea85b, 0x8ccf5f, 0x5fb86d, 0x7bd957].map((c) => new THREE.Color(c));
const SAND = new THREE.Color(0xf2dca4);
const WET_SAND = new THREE.Color(0xd9c28a);
const ROCK = new THREE.Color(0xa6a29a);
const ROCK_DARK = new THREE.Color(0x85817c);
const SNOW = new THREE.Color(0xf6fbff);
const SEABED_SHALLOW = new THREE.Color(0x7fd3c4);
const SEABED_DEEP = new THREE.Color(0x1d6f86);
const DIRT = new THREE.Color(0xa7845a);
const _c = new THREE.Color();

// Medan 3D: pulau luas, pegunungan, pantai, sungai & danau. Warna per-vertex (tanpa tekstur) agar ringan.
export class Terrain3D {
  constructor(scene, world, quality) {
    this.world = world;
    const half = 128, seg = quality.terrainSegments;
    const geo = new THREE.PlaneGeometry(half * 2, half * 2, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const count = pos.count;
    const heights = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const h = world.heightAt(pos.getX(i), pos.getZ(i));
      heights[i] = h;
      pos.setY(i, h);
    }
    geo.computeVertexNormals();
    const normals = geo.attributes.normal;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = heights[i];
      const slope = 1 - normals.getY(i);
      this.colorAt(x, z, h, slope, _c);
      colors[i * 3] = _c.r; colors[i * 3 + 1] = _c.g; colors[i * 3 + 2] = _c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }));
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = quality.terrainCastShadow;
    scene.add(this.mesh);

    this.createWater(scene);
    this.createFarSea(scene);
  }

  colorAt(x, z, h, slope, out) {
    const w = this.world;
    const ang = Math.atan2(z, x);
    const region = w.regionOf(x, z);
    const jitter = w.n.noise(x * 0.16, z * 0.16) * 0.06 + w.n.noise(x * 0.5, z * 0.5) * 0.03;
    // Campur warna dua wilayah bertetangga secara halus (tanpa garis sambungan).
    let deg = ang / (Math.PI / 180) - 54;
    deg = ((deg % 360) + 360) % 360;
    const f = deg / 72 - Math.floor(deg / 72);
    out.copy(REGION_GRASS[region]);
    if (f < 0.2) out.lerp(REGION_GRASS[(region + 4) % 5], 0.5 * (1 - f / 0.2));
    else if (f > 0.8) out.lerp(REGION_GRASS[(region + 1) % 5], 0.5 * ((f - 0.8) / 0.2));
    // Sedikit variasi warna rumput agar tidak monoton.
    out.offsetHSL(0, 0, jitter + (w.n.fbm(x * 0.03, z * 0.03, 2)) * 0.05);
    const r = Math.hypot(x, z);
    if (region === 4 && r > 56) out.lerp(new THREE.Color(0xc9e36a), 0.25 * smoothstep(0.2, 0.7, w.n.noise(x * 0.06, z * 0.06) * 0.5 + 0.5));
    // Tebing curam -> batu.
    const strata = w.n.noise(x * 0.12 + 5, z * 0.12) * 0.12;
    const rockAmt = clamp(smoothstep(0.3 + strata, 0.66 + strata, slope) + smoothstep(14, 24, h) * 0.7, 0, 1);
    if (rockAmt > 0) out.lerp(slope > 0.45 ? ROCK_DARK : ROCK, rockAmt);
    // Puncak bersalju.
    const snowLine = region === 3 ? 12.5 : 17.5;
    const snow = smoothstep(snowLine, snowLine + 4, h + w.n.noise(x * 0.1, z * 0.1) * 1.5);
    if (snow > 0) out.lerp(SNOW, snow);
    // Pantai.
    const beach = 1 - smoothstep(0.35, 1.45, h);
    if (beach > 0 && h > -0.4) out.lerp(SAND, beach);
    if (h <= 0.35 && h > -0.4) out.lerp(WET_SAND, 0.4);
    // Dasar laut: dangkal turkuaz -> dalam biru tua.
    if (h <= -0.4) {
      const depth = smoothstep(-0.4, -3.4, h);
      out.copy(SEABED_SHALLOW).lerp(SEABED_DEEP, depth);
    }
    // Tanah gembur di dekat jalan setapak.
    return out;
  }

  createWater(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(150,215,235,0.55)'; ctx.lineWidth = 3;
    const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    for (let i = 0; i < 46; i++) {
      const x = rnd() * 256, y = rnd() * 256, l = 16 + rnd() * 26;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 6, x + l, y); ctx.stroke();
      // sambung di tepi supaya tekstur mulus saat diulang
      ctx.beginPath(); ctx.moveTo(x - 256, y); ctx.quadraticCurveTo(x - 256 + l / 2, y - 6, x - 256 + l, y); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(500, 500);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.waterTex = tex;
    const mat = new THREE.MeshStandardMaterial({
      color: 0x38c3dc, map: tex, transparent: true, opacity: 0.8, roughness: 0.12, metalness: 0.05, depthWrite: false,
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), mat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.18;
    water.renderOrder = 1;
    scene.add(water);
    this.water = water;
  }

  createFarSea(scene) {
    // Laut luas sampai horizon, menyatu dengan kabut.
    const far = new THREE.Mesh(
      new THREE.CircleGeometry(900, 48),
      new THREE.MeshStandardMaterial({ color: SEABED_DEEP, roughness: 1 }),
    );
    far.rotation.x = -Math.PI / 2;
    far.position.y = -3.42;
    scene.add(far);
  }

  update(time) {
    if (this.waterTex) { this.waterTex.offset.set(time * 0.004, time * 0.0025); }
  }
}
