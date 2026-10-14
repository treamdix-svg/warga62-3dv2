import * as THREE from 'three';
import { engine, world, formatRupiah } from '../engine/GameBridge.js';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import { tileColorHex, tileTopColor } from './tileStyle.js';
import { CITIES } from '../world/Cities.js';
import * as P from '../world/Prefabs.js';

const HALF = 2.7, BORDER = 0.4, CORNER_R = 3.7;
const TOP_Y = 0.28, RIM_Y = 0.36, SKIRT = 1.0;
const COLS = 8, ROWS = 6, CELL_W = 320, CELL_H = 205;
const MORTAR = new THREE.Color(0x474d55), SKIRT_COLOR = new THREE.Color(0x3a3f46);

// Jalur permainan = deretan 45 PETAK BATU bersambungan (seperti petak papan asli), bukan jalan raya:
// tiap petak memuat nomor, nama kota/lokasi, dan harga di permukaannya; bingkainya berwarna pulau
// dan berubah mengikuti pemilik. Tanah (lot) menempel di sisi dalam dan kota di sisi luar tiap petak.
export class Roads3D {
  constructor(scene, world_, renderer) {
    this.renderer = renderer;
    this.world = world; this.scene = scene;
    this.group = new THREE.Group(); scene.add(this.group);
    this.baseHex = []; this.ownerHex = new Array(45).fill(null); this.hover = -1;
    this.range = [];
    this.buildTiles();
    this.buildBridge();
  }

  // Gambar landmark tiap petak dirender dari model 3D-nya sendiri (bukan ikon datar buatan tangan),
  // lalu ditaruh di permukaan petak. Tanpa nomor; hanya nama kecil di bawah gambar.
  renderThumbs() {
    const r = this.renderer, out = [];
    const W = CELL_W * 2, H = CELL_H * 2;
    const rt = new THREE.WebGLRenderTarget(W, H); rt.texture.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6d7f60, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2dc, 1.7); sun.position.set(-4, 9, 6); scene.add(sun);
    const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
    const special = { start: P.gateMulai, jail: P.penjara, tax: P.kantorPajak, court: P.pengadilan, pungli: P.parkiranPungli, fate: P.takdirGate, hazard: P.musibahCloud, toll: P.tollGate, fine: P.tilangPost };
    const mat = vertexMaterial({ flatShading: true });
    const oldClear = r.getClearColor(new THREE.Color()), oldAlpha = r.getClearAlpha(), oldTM = r.toneMapping;
    const pixels = new Uint8Array(W * H * 4);
    for (let i = 0; i < 45; i++) {
      const [name, type] = engine.tiles[i];
      const b = new MeshBuilder();
      if (type === 'asset' && CITIES[name]) CITIES[name](b); else special[type]?.(b);
      const geo = b.build(); geo.computeBoundingBox();
      const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
      const box = geo.boundingBox, c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
      const rad = 0.5 * Math.hypot(size.x, size.y, size.z);
      const dir = new THREE.Vector3(0.4, 0.55, 1).normalize();
      cam.position.copy(c).addScaledVector(dir, (rad / Math.sin((15 * Math.PI) / 180)) * 0.62);
      cam.lookAt(c.x, c.y - size.y * 0.05, c.z);
      r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.toneMapping = THREE.NoToneMapping; r.clear(); r.render(scene, cam);
      r.readRenderTargetPixels(rt, 0, 0, W, H, pixels);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const img = cv.getContext('2d').createImageData(W, H);
      for (let y = 0; y < H; y++) img.data.set(pixels.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
      cv.getContext('2d').putImageData(img, 0, 0);
      out[i] = cv;
      scene.remove(mesh); geo.dispose();
    }
    r.setRenderTarget(null); r.setClearColor(oldClear, oldAlpha); r.toneMapping = oldTM;
    rt.dispose();
    return out;
  }

  atlas() {
    const thumbs = this.renderer ? this.renderThumbs() : [];
    const c = document.createElement('canvas'); c.width = COLS * CELL_W; c.height = ROWS * CELL_H;
    const x = c.getContext('2d');
    for (let i = 0; i < 45; i++) {
      const data = engine.tiles[i], hex = tileColorHex(i), ox = (i % COLS) * CELL_W, oy = Math.floor(i / COLS) * CELL_H;
      x.save(); x.translate(ox, oy);
      const g = x.createLinearGradient(0, 0, 0, CELL_H); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#' + tileTopColor(i).getHexString());
      x.fillStyle = g; x.fillRect(0, 0, CELL_W, CELL_H);
      if (thumbs[i]) x.drawImage(thumbs[i], 0, -4, CELL_W, CELL_H - 26);
      // pita nama kecil di bawah
      x.fillStyle = hex; x.fillRect(0, CELL_H - 32, CELL_W, 32);
      x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      let size = 24; x.font = `bold ${size}px system-ui, sans-serif`;
      const label = data[0].toUpperCase();
      while (x.measureText(label).width > CELL_W - 20 && size > 12) { size -= 2; x.font = `bold ${size}px system-ui, sans-serif`; }
      x.fillText(label, CELL_W / 2, CELL_H - 15);
      x.strokeStyle = hex; x.lineWidth = 6; x.strokeRect(3, 3, CELL_W - 6, CELL_H - 6);
      x.restore();
    }
    x.fillStyle = '#ffffff'; x.fillRect(7 * CELL_W, 5 * CELL_H, CELL_W, CELL_H);   // sel 47 = putih netral
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return tex;
  }

  buildTiles() {
    const w = this.world, M = w.M, K = w.K;
    const { x: sx, y: sy, z: sz, tx, tz } = w.samples;
    // Arah normal kiri-jalur yang menuju bagian dalam (pusat dunia)
    const j0 = 0; let lSign = 1; { const lx = -tz[j0], lz = tx[j0]; lSign = lx * -sx[j0] + lz * -sz[j0] > 0 ? 1 : -1; }
    const pos = [], col = [], uv = [], idx = [];
    const tmp = new THREE.Color();
    const cellUV = (i, u, v) => {
      const c = i % COLS, r = Math.floor(i / COLS);
      return [(c + u) / COLS, 1 - (r + 1) / ROWS + v / ROWS];
    };
    const WHITE = cellUV(47, 0.5, 0.5);
    const vtx = (x, y, z, c, u = WHITE[0], v = WHITE[1]) => { pos.push(x, y, z); col.push(c.r, c.g, c.b); uv.push(u, v); return pos.length / 3 - 1; };
    const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
    const at = (j, q, y) => { const jj = ((j % M) + M) % M; return [sx[jj] + -tz[jj] * lSign * q, sy[jj] + y, sz[jj] + tx[jj] * lSign * q]; };

    // Alas "adukan" gelap menerus di bawah semua petak (menutup sela antar petak)
    for (let j = 0; j < M; j++) {
      const a = at(j, -HALF, TOP_Y - 0.14), b = at(j, HALF, TOP_Y - 0.14), a2 = at(j + 1, -HALF, TOP_Y - 0.14), b2 = at(j + 1, HALF, TOP_Y - 0.14);
      const i0 = vtx(...a, MORTAR), i1 = vtx(...b, MORTAR), i2 = vtx(...b2, MORTAR), i3 = vtx(...a2, MORTAR);
      quad(i0, i1, i2, i3);
    }

    for (let i = 0; i < 45; i++) {
      const base = new THREE.Color(tileColorHex(i)), top = tileTopColor(i);
      const corner = i % 9 === 0;
      this.baseHex[i] = base.getHex();
      const jc = i * K, h = corner ? Math.round(K * 0.3) : K / 2 - 1;
      const start = pos.length / 3;
      if (!corner) {
        const ja = jc - h, jb = jc + h;
        // 1. bingkai: dua sisi panjang + dua ujung (satu blok vertex bersebelahan untuk pewarnaan pemilik)
        for (const side of [-1, 1]) for (let j = ja; j < jb; j++) {
          const a = at(j, side * HALF, RIM_Y), b = at(j, side * (HALF - BORDER), RIM_Y), a2 = at(j + 1, side * HALF, RIM_Y), b2 = at(j + 1, side * (HALF - BORDER), RIM_Y);
          const k0 = vtx(...a, base), k1 = vtx(...b, base), k2 = vtx(...b2, base), k3 = vtx(...a2, base);
          quad(side > 0 ? k0 : k3, side > 0 ? k1 : k2, side > 0 ? k2 : k1, side > 0 ? k3 : k0);
        }
        for (const jEnd of [ja, jb - 1]) {
          const a = at(jEnd, -HALF, RIM_Y), b = at(jEnd, HALF, RIM_Y), a2 = at(jEnd + 1, -HALF, RIM_Y), b2 = at(jEnd + 1, HALF, RIM_Y);
          const k0 = vtx(...a, base), k1 = vtx(...b, base), k2 = vtx(...b2, base), k3 = vtx(...a2, base);
          quad(k0, k1, k2, k3);
        }
        const end = pos.length / 3;
        this.range[i] = [start, end];
        // 2. permukaan atas bertekstur (nomor + nama + harga)
        const inner = HALF - BORDER;
        for (let j = ja; j < jb; j++) {
          const alongA = (j - ja) / (jb - ja), alongB = (j + 1 - ja) / (jb - ja);
          const row = [];
          for (const [jj, al] of [[j, alongA], [j + 1, alongB]]) for (const q of [-inner, inner]) {
            const p = at(jj, q, TOP_Y), vv = (q + inner) / (2 * inner);
            const [u2, v2] = cellUV(i, 1 - al, vv);
            row.push(vtx(...p, tmp.set(0xffffff), u2, v2));
          }
          quad(row[0], row[1], row[3], row[2]);
        }
        // 3. dinding samping (skirt)
        for (const side of [-1, 1]) for (let j = ja; j < jb; j++) {
          const a = at(j, side * HALF, RIM_Y), b = at(j + 1, side * HALF, RIM_Y), a2 = at(j, side * HALF, RIM_Y - SKIRT), b2 = at(j + 1, side * HALF, RIM_Y - SKIRT);
          const k0 = vtx(...a, SKIRT_COLOR), k1 = vtx(...b, SKIRT_COLOR), k2 = vtx(...b2, SKIRT_COLOR), k3 = vtx(...a2, SKIRT_COLOR);
          if (side > 0) quad(k0, k3, k2, k1); else quad(k0, k1, k2, k3);
        }
      } else {
        // Petak sudut: lempeng segi delapan lebih besar
        const cx = sx[jc], cz = sz[jc], cy = sy[jc];
        const t = w.tiles[i], rx = -t.nz, rz = t.nx, ux = t.nx, uz = t.nz;     // kanan teks & atas teks (menghadap luar -> dalam)
        const N = 8, ang0 = Math.PI / 8;
        const ring = [];
        for (let k = 0; k < N; k++) { const a = ang0 + (k / N) * Math.PI * 2; ring.push([Math.cos(a), Math.sin(a)]); }
        const mk = (rad, y, c, withUV) => ring.map(([ca, sa]) => {
          const px = cx + ca * rad, pz = cz + sa * rad;
          let u = 0, v = 0;
          if (withUV) { const du = (px - cx) * rx + (pz - cz) * rz, dv = (px - cx) * ux + (pz - cz) * uz; [u, v] = cellUV(i, 0.5 + du / (CORNER_R * 1.9), Math.min(0.98, Math.max(0.02, 0.5 + dv / (CORNER_R * 1.9 * CELL_H / CELL_W)))); }
          return vtx(px, cy + y, pz, c, u, v);
        });
        const rim0 = mk(CORNER_R, RIM_Y + 0.02, base, false), rim1 = mk(CORNER_R - BORDER, RIM_Y + 0.02, base, false);
        const end = pos.length / 3; this.range[i] = [start, end];
        for (let k = 0; k < N; k++) { const n = (k + 1) % N; quad(rim0[k], rim0[n], rim1[n], rim1[k]); }
        const topC = vtx(cx, cy + TOP_Y + 0.02, cz, tmp.set(0xffffff), ...cellUV(i, 0.5, 0.5));
        const topR = mk(CORNER_R - BORDER, TOP_Y + 0.02, tmp.set(0xffffff), true);
        for (let k = 0; k < N; k++) idx.push(topC, topR[(k + 1) % N], topR[k]);
        const sk0 = mk(CORNER_R, RIM_Y + 0.02, SKIRT_COLOR, false), sk1 = mk(CORNER_R, RIM_Y + 0.02 - SKIRT, SKIRT_COLOR, false);
        for (let k = 0; k < N; k++) { const n = (k + 1) % N; quad(sk0[k], sk1[k], sk1[n], sk0[n]); }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    this.colorAttr = new THREE.Float32BufferAttribute(col, 3);
    geo.setAttribute('color', this.colorAttr);
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    // Vertex-color mengalikan tekstur atlas. Bagian berwarna polos (bingkai/skirt/adukan) memakai sel atlas ke-47 (putih netral).
    this.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: this.atlas(), roughness: 0.78, side: THREE.DoubleSide }));
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);
  }

  // Warna bingkai: pemilik > warna pulau; saat disorot dibuat lebih terang.
  paint(i) {
    const [s, e] = this.range[i];
    const c = new THREE.Color(this.ownerHex[i] ?? this.baseHex[i]);
    if (i === this.hover) c.lerp(new THREE.Color(0xffffff), 0.5);
    for (let v = s; v < e; v++) this.colorAttr.setXYZ(v, c.r, c.g, c.b);
    this.colorAttr.needsUpdate = true;
  }
  setOwner(i, hex) { const v = hex ? new THREE.Color(hex).getHex() : null; if (this.ownerHex[i] === v) return; this.ownerHex[i] = v; this.paint(i); }
  setHover(i) { if (i === this.hover) return; const old = this.hover; this.hover = i; if (old >= 0) this.paint(old); if (i >= 0) this.paint(i); }

  buildBridge() {
    const w = this.world, M = w.M;
    const { x: sx, y: sy, z: sz, tx, tz } = w.samples;
    const over = [];
    for (let j = 0; j < M; j++) { const ri = w.riverInfo(sx[j], sz[j]); if (ri.d < ri.hw + 2.2) over.push(j); }
    if (!over.length) return;
    const first = over[0], last = over[over.length - 1];
    const b = new MeshBuilder();
    const stone = 0xb9a98c, stoneDark = 0x8f8068, wood = 0x8a5a36;
    for (let j = first; j <= last; j++) {
      const nx = -tz[j], nz = tx[j], y = sy[j], yaw = Math.atan2(tx[j], tz[j]);
      b.box(6.4, 0.5, 0.46, stone, sx[j], y - 0.45, sz[j], { ry: yaw });
      if ((j - first) % 5 === 0) for (const s of [-1, 1]) {
        const px = sx[j] + nx * 2.95 * s, pz = sz[j] + nz * 2.95 * s;
        b.box(0.32, 1.0, 0.32, stoneDark, px, y + 0.15, pz, { ry: yaw }); b.box(0.5, 0.18, 0.5, stone, px, y + 1.15, pz, { ry: yaw });
      }
    }
    for (const s of [-1, 1]) for (let j = first; j <= last; j += 2) { const nx = -tz[j], nz = tx[j], yaw = Math.atan2(tx[j], tz[j]); b.box(0.16, 0.12, 0.75, wood, sx[j] + nx * 2.95 * s, sy[j] + 0.85, sz[j] + nz * 2.95 * s, { ry: yaw }); }
    for (const j of [first + 4, Math.round((first + last) / 2), last - 4]) for (const s of [-1, 1]) { const nx = -tz[j], nz = tx[j]; b.cyl(0.42, 0.55, 3.2, 8, stoneDark, sx[j] + nx * 1.7 * s, sy[j] - 3.6, sz[j] + nz * 1.7 * s); }
    const mesh = new THREE.Mesh(b.build(), vertexMaterial());
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.group.add(mesh);
    this.bridgeRange = [first, last];
  }
}
