import * as THREE from 'three';
import { engine, world, ISLAND_CONFIG, CORNER_CONFIG, PLAYER_COLORS, formatRupiah } from '../engine/GameBridge.js';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import * as P from '../world/Prefabs.js';
import { monument, hasMonument } from '../world/Monuments.js';

const SPECIAL_ICON = { start: '⚑', jail: '⚖', tax: '▤', court: '⚖', pungli: '▦', fate: '✦', hazard: '✉', toll: '⇄', fine: '⚠', asset: '⌂' };
const SPECIAL_COLOR = { fate: '#f5b301', hazard: '#dc2626', toll: '#2563eb', fine: '#1d4ed8' };

function tileColorHex(i) {
  const [, type, , , island] = engine.tiles[i];
  if (i % 9 === 0) return CORNER_CONFIG[i]?.hex || '#f59e0b';
  if (SPECIAL_COLOR[type]) return SPECIAL_COLOR[type];
  return ISLAND_CONFIG.find((c) => c.name === island)?.hex || '#3b82f6';
}

// 45 lokasi: bantalan jalan berwarna wilayah, cincin warna pemilik, label melayang, dan struktur khas tiap petak.
export class TileMarkers3D {
  constructor(scene, quality) {
    this.scene = scene; this.quality = quality;
    this.group = new THREE.Group(); scene.add(this.group);
    this.pickables = [];
    this.pads = []; this.rings = []; this.labels = []; this.structs = [];
    this.hovered = -1; this.active = -1;
    this.anim = [];
    const padGeo = new THREE.CylinderGeometry(1.95, 2.1, 0.16, 28);
    const ringGeo = new THREE.TorusGeometry(2.2, 0.17, 8, 36);
    const hitGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.5, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    for (let i = 0; i < 45; i++) {
      const t = world.tiles[i], data = engine.tiles[i], hex = tileColorHex(i), corner = t.corner;
      const g = new THREE.Group();
      g.position.set(t.x, t.y, t.z);
      g.rotation.y = Math.atan2(t.tx, t.tz);
      this.group.add(g);
      const scale = corner ? 1.28 : 1;
      const padMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.55, emissive: new THREE.Color(hex), emissiveIntensity: 0.18 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.17; pad.scale.set(scale, 1, scale); pad.receiveShadow = true; pad.castShadow = false;
      g.add(pad);
      // Lempengan berisi nomor lokasi & ikon (dibaca searah jalan)
      const decal = new THREE.Mesh(new THREE.CircleGeometry(1.55 * scale, 28), new THREE.MeshStandardMaterial({ map: this.makeDecal(i, data, hex), roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -3 }));
      decal.rotation.x = -Math.PI / 2; decal.position.y = 0.262; g.add(decal);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.35, emissive: new THREE.Color(hex), emissiveIntensity: 0.25 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; ring.scale.set(scale, scale, scale); g.add(ring);
      const hit = new THREE.Mesh(hitGeo, hitMat); hit.position.y = 0.3; hit.userData = { index: i, name: data[0], type: data[1], price: data[2], island: data[4] }; g.add(hit);
      this.pickables.push(hit);
      const label = this.makeLabelSprite(i, data, hex);
      label.position.set(0, corner ? 6.4 : 4.4, 0);
      g.add(label);
      this.pads.push({ g, pad, decal, hex }); this.rings.push(ring); this.labels.push(label);
    }
    this.buildStructures();
    this.buildMonuments();
    this.buildRegionBillboards();
  }

  makeDecal(i, data, hex) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#fffdf4'; x.beginPath(); x.arc(64, 64, 62, 0, Math.PI * 2); x.fill();
    x.lineWidth = 8; x.strokeStyle = hex; x.beginPath(); x.arc(64, 64, 56, 0, Math.PI * 2); x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#0f2a38'; x.font = 'bold 44px system-ui, sans-serif';
    x.fillText(String(i), 64, 54);
    x.fillStyle = hex; x.font = '28px system-ui, sans-serif';
    x.fillText(SPECIAL_ICON[data[1]] || data[3] || '⌂', 64, 92);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }

  makeLabelSprite(i, data, hex) {
    const c = document.createElement('canvas'); c.width = 384; c.height = 120;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    s.userData = { canvas: c, i, data, hex };
    s.scale.set(5.2, 5.2 * 120 / 384, 1);
    s.renderOrder = 5;
    this.drawLabel(s, null);
    return s;
  }

  drawLabel(s, ownerHex) {
    const { canvas: c, i, data, hex } = s.userData;
    const x = c.getContext('2d');
    x.clearRect(0, 0, 384, 120);
    x.fillStyle = 'rgba(12,38,52,0.9)'; x.beginPath(); x.roundRect(4, 6, 376, 100, 28); x.fill();
    x.lineWidth = 8; x.strokeStyle = ownerHex || hex; x.stroke();
    x.fillStyle = hex; x.beginPath(); x.arc(52, 56, 34, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 34px system-ui, sans-serif';
    x.fillText(String(i), 52, 58);
    x.textAlign = 'left'; x.fillStyle = '#ffffff';
    const name = data[0];
    x.font = `bold ${name.length > 13 ? 31 : 38}px system-ui, sans-serif`;
    x.fillText(name, 98, data[1] === 'asset' ? 42 : 58, 270);
    if (data[1] === 'asset') { x.fillStyle = '#7dffb0'; x.font = 'bold 27px system-ui, sans-serif'; x.fillText(formatRupiah(data[2]), 98, 80, 270); }
    if (ownerHex) { x.fillStyle = ownerHex; x.beginPath(); x.arc(352, 22, 12, 0, Math.PI * 2); x.fill(); }
    if (s.material.map) s.material.map.needsUpdate = true;
    s.material.map.colorSpace = THREE.SRGBColorSpace;
  }

  // Struktur khas di sisi jalan: gerbang Mulai, Lapas, kantor pajak, pengadilan, parkiran, tol, tilang, takdir, musibah.
  buildStructures() {
    const mat = vertexMaterial();
    for (let i = 0; i < 45; i++) {
      const type = engine.tiles[i][1];
      if (type === 'asset') continue;
      const lot = world.lots[i];
      const b = new MeshBuilder();
      const fn = { start: P.gateMulai, jail: P.penjara, tax: P.kantorPajak, court: P.pengadilan, pungli: P.parkiranPungli, fate: P.takdirGate, hazard: P.musibahCloud, toll: P.tollGate, fine: P.tilangPost }[type];
      fn(b);
      const mesh = new THREE.Mesh(b.build(), mat);
      mesh.position.set(lot.x, lot.y, lot.z);
      mesh.rotation.y = lot.rotationY;
      mesh.castShadow = true; mesh.receiveShadow = true;
      this.group.add(mesh);
      this.structs[i] = mesh;
      if (type === 'fate' || type === 'hazard') this.anim.push({ mesh, base: lot.y, phase: i, type });
    }
  }

  // Monumen khas kota di tepi luar jalan (berseberangan dengan lot) agar setiap petak mudah dikenali.
  buildMonuments() {
    const b = new MeshBuilder();
    for (let i = 0; i < 45; i++) {
      const name = engine.tiles[i][0];
      if (engine.tiles[i][1] !== 'asset' || !hasMonument(name)) continue;
      const t = world.tiles[i], lot = world.lots[i];
      const side = lot.side === 1 ? -1 : 1;           // sisi yang tidak dipakai lot
      let x = t.x + t.nx * side * 6.4, z = t.z + t.nz * side * 6.4;
      if (world.isWater(x, z)) { x = t.x - t.nx * side * 6.4; z = t.z - t.nz * side * 6.4; }
      const y = world.heightAt(x, z);
      b.begin(x, y - 0.05, z, Math.atan2(-t.nx * side, -t.nz * side), 1.15);
      b.cyl(2.6, 2.9, 0.9, 14, 0xa9b8a0, 0, -0.8, 0);   // fondasi menutupi lereng
      monument(b, name);
      b.end();
    }
    const mesh = new THREE.Mesh(b.build(), vertexMaterial());
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  buildRegionBillboards() {
    this.regionSigns = [];
    ISLAND_CONFIG.forEach((cfg, k) => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 160;
      const x = c.getContext('2d');
      x.fillStyle = 'rgba(8,30,44,0.82)'; x.beginPath(); x.roundRect(6, 10, 500, 140, 40); x.fill();
      x.lineWidth = 12; x.strokeStyle = cfg.hex; x.stroke();
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 74px system-ui, sans-serif';
      x.fillText(cfg.name.toUpperCase(), 256, 84);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      const hero = world.heroes[k];
      spr.position.set(hero.x, hero.y + (hero.labelY || 20), hero.z);
      spr.scale.set(15, 4.7, 1);
      spr.renderOrder = 6;
      this.scene.add(spr);
      this.regionSigns.push(spr);
    });
  }

  setOwner(i, ownerHex) {
    const ring = this.rings[i];
    const hex = ownerHex || this.pads[i].hex;
    ring.material.color.set(hex); ring.material.emissive.set(hex);
    if (this.labels[i].userData.owner !== ownerHex) { this.labels[i].userData.owner = ownerHex; this.drawLabel(this.labels[i], ownerHex); }
  }

  highlight(i, on) {
    if (i < 0) return;
    const p = this.pads[i];
    p.g.scale.setScalar(on ? 1.12 : 1);
    this.rings[i].material.emissiveIntensity = on ? 0.9 : 0.25;
  }
  setHovered(i) { if (i === this.hovered) return; this.highlight(this.hovered, false); this.hovered = i; this.highlight(i, true); }

  update(camera, time, activeTile) {
    const camPos = camera.position;
    const maxD = this.quality.labelDistance;
    for (let i = 0; i < 45; i++) {
      const s = this.labels[i];
      const d = camPos.distanceTo(this.pads[i].g.position);
      const force = i === this.hovered || i === activeTile;
      const a = force ? 1 : 1 - Math.min(1, Math.max(0, (d - maxD) / 24));
      s.material.opacity = a; s.visible = a > 0.02;
      // Ukuran label mengikuti jarak supaya tetap terbaca dekat maupun jauh.
      const k = Math.min(1.7, Math.max(0.42, d / 36)) * (i % 9 === 0 ? 1.2 : 1);
      s.scale.set(5.2 * k, 5.2 * k * 120 / 384, 1);
      s.position.y = (i % 9 === 0 ? 6.2 : 4.3) * Math.max(0.7, Math.min(1.5, k));
    }
    for (const sign of this.regionSigns) {
      const d = camPos.distanceTo(sign.position);
      sign.material.opacity = Math.min(1, Math.max(0, (d - 55) / 40)); sign.visible = sign.material.opacity > 0.02;
    }
    for (const a of this.anim) {
      a.mesh.position.y = a.base + Math.sin(time * 1.6 + a.phase) * 0.12;
      if (a.type === 'fate') a.mesh.rotation.y += 0.004;
    }
  }
}
