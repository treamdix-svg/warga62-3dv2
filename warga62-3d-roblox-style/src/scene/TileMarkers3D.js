import * as THREE from 'three';
import { engine, world, ISLAND_CONFIG, CORNER_CONFIG, formatRupiah } from '../engine/GameBridge.js';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import * as P from '../world/Prefabs.js';
import { tileColorHex } from './tileStyle.js';

// Penanda 45 lokasi: area sentuh, label melayang (nomor/nama/harga/pemilik), dan struktur khas petak khusus.
// Permukaan petak itu sendiri digambar oleh Roads3D.
export class TileMarkers3D {
  constructor(scene, quality, roads) {
    this.scene = scene; this.quality = quality; this.roads = roads;
    this.group = new THREE.Group(); scene.add(this.group);
    this.pickables = []; this.positions = []; this.labels = [];
    this.ownerHex = new Array(45).fill(null);
    this.hovered = -1; this.anim = [];
    const hitGeo = new THREE.BoxGeometry(6.2, 0.6, 5.2);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    for (let i = 0; i < 45; i++) {
      const t = world.tiles[i], data = engine.tiles[i], hex = tileColorHex(i), corner = t.corner;
      this.positions.push(new THREE.Vector3(t.x, t.y, t.z));
      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.set(t.x, t.y + 0.4, t.z); hit.rotation.y = Math.atan2(t.tx, t.tz);
      hit.userData = { index: i, name: data[0], type: data[1], price: data[2], island: data[4] };
      this.group.add(hit); this.pickables.push(hit);
      const label = this.makeLabelSprite(i, data, hex);
      label.position.set(t.x, t.y + (corner ? 6.4 : 4.4), t.z);
      this.group.add(label); this.labels.push(label);
    }
    this.buildStructures();
    this.buildRegionBillboards();
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
    s.material.map.needsUpdate = true;
    s.material.map.colorSpace = THREE.SRGBColorSpace;
  }

  // Struktur khas petak khusus (gerbang Mulai, Lapas, kantor pajak, pengadilan, parkiran, tol, tilang, takdir, musibah).
  // Yang statis digabung jadi satu mesh; Takdir & Musibah digabung per jenis dan berdenyut halus.
  buildStructures() {
    const fns = { start: P.gateMulai, jail: P.penjara, tax: P.kantorPajak, court: P.pengadilan, pungli: P.parkiranPungli, fate: P.takdirGate, hazard: P.musibahCloud, toll: P.tollGate, fine: P.tilangPost };
    const groups = { still: new MeshBuilder(), fate: new MeshBuilder(), hazard: new MeshBuilder() };
    for (let i = 0; i < 45; i++) {
      const type = engine.tiles[i][1];
      if (type === 'asset') continue;
      const lot = world.lots[i];
      const b = groups[type === 'fate' || type === 'hazard' ? type : 'still'];
      b.begin(lot.x, lot.y, lot.z, lot.rotationY);
      fns[type](b);
      b.end();
    }
    for (const [key, b] of Object.entries(groups)) {
      const mesh = new THREE.Mesh(b.build(), vertexMaterial());
      mesh.castShadow = true; mesh.receiveShadow = true;
      this.group.add(mesh);
      if (key !== 'still') this.anim.push({ mesh, type: key, phase: key === 'fate' ? 0 : 1.7 });
    }
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
    if (this.ownerHex[i] === ownerHex) return;
    this.ownerHex[i] = ownerHex;
    this.roads.setOwner(i, ownerHex);
    this.labels[i].userData.owner = ownerHex;
    this.drawLabel(this.labels[i], ownerHex);
  }

  setHovered(i) { if (i === this.hovered) return; this.hovered = i; this.roads.setHover(i); }

  update(camera, time, activeTile) {
    const camPos = camera.position;
    const maxD = this.quality.labelDistance;
    for (let i = 0; i < 45; i++) {
      const s = this.labels[i];
      const d = camPos.distanceTo(this.positions[i]);
      const force = i === this.hovered || i === activeTile;
      // Dekat: tulisan di permukaan petak sudah cukup (label disembunyikan); sedang-jauh: label membantu membaca.
      const near = Math.min(1, Math.max(0, (d - 20) / 10));
      const a = 0;   // label melayang dimatikan: info petak tampil di panel HUD saat disentuh/di-hover
      s.material.opacity = a; s.visible = a > 0.02;
      if (!s.visible) continue;
      const k = Math.min(1.7, Math.max(0.42, d / 36)) * (i % 9 === 0 ? 1.2 : 1) * (innerWidth < 600 ? 0.72 : 1);
      s.scale.set(5.2 * k, 5.2 * k * 120 / 384, 1);
      s.position.y = this.positions[i].y + (i % 9 === 0 ? 6.2 : 4.3) * Math.max(0.7, Math.min(1.5, k));
    }
    for (const sign of this.regionSigns) {
      const d = camPos.distanceTo(sign.position);
      sign.material.opacity = Math.min(1, Math.max(0, (d - 55) / 40)); sign.visible = sign.material.opacity > 0.02;
    }
    for (const a of this.anim) a.mesh.scale.y = 1 + Math.sin(time * 1.8 + a.phase) * 0.012;
  }
}
