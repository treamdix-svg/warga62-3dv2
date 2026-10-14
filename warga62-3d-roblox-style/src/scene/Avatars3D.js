import * as THREE from 'three';
import { world, PLAYER_COLORS, formatRupiah } from '../engine/GameBridge.js';

const SKINS = [0xffd1a3, 0xe8b089, 0xc68a5b, 0x9a6a43, 0xf2c9a0, 0xd9a273, 0xb57d52, 0xf6d3b3];
const PANTS = [0x2f3d5c, 0x3a3a46, 0x4b5d3a, 0x5b3a2e, 0x2b4a5e, 0x40355c];
const WALK_SPEED = 13;      // satuan dunia / detik
const box = new THREE.BoxGeometry(1, 1, 1);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const shortName = (n) => (n.length > 14 ? n.slice(0, 13) + '…' : n);

// Warga bergaya blok (Roblox-ish) dengan sendi bahu/pinggul yang bisa berayun saat berjalan.
export class Avatars3D {
  constructor(scene, quality) {
    this.scene = scene; this.quality = quality;
    this.group = new THREE.Group(); scene.add(this.group);
    this.pawns = [];
    this.onStep = null;
    this.tmp = {};
    const ringGeo = new THREE.RingGeometry(0.95, 1.35, 28);
    this.ringGeo = ringGeo;
    this.arrowGeo = new THREE.ConeGeometry(0.55, 1.1, 4);
    this.beamGeo = new THREE.CylinderGeometry(0.9, 0.9, 16, 14, 1, true);
  }

  clear() {
    while (this.group.children.length) this.group.remove(this.group.children[0]);
    this.pawns = [];
  }

  faceTexture(skin) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#' + new THREE.Color(skin).getHexString(); x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#1b1f2a';
    x.beginPath(); x.ellipse(44, 56, 8, 12, 0, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(84, 56, 8, 12, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(47, 51, 3, 0, 7); x.fill(); x.beginPath(); x.arc(87, 51, 3, 0, 7); x.fill();
    x.strokeStyle = '#7a2e2e'; x.lineWidth = 6; x.lineCap = 'round';
    x.beginPath(); x.arc(64, 78, 22, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke();
    x.fillStyle = 'rgba(255,110,110,0.28)'; x.beginPath(); x.arc(28, 80, 9, 0, 7); x.fill(); x.beginPath(); x.arc(100, 80, 9, 0, 7); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }

  makeTag(name) {
    const c = document.createElement('canvas'); c.width = 320; c.height = 100;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false, depthWrite: false }));
    s.scale.set(4.4, 1.375, 1); s.renderOrder = 20;
    s.userData = { canvas: c, name, money: null, out: null, hex: '#fff' };
    return s;
  }

  drawTag(s, money, out) {
    const d = s.userData;
    if (d.money === money && d.out === out) return;
    d.money = money; d.out = out;
    const x = d.canvas.getContext('2d');
    x.clearRect(0, 0, 320, 100);
    x.fillStyle = 'rgba(10,28,40,0.88)'; x.beginPath(); x.roundRect(4, 6, 312, 88, 24); x.fill();
    x.lineWidth = 7; x.strokeStyle = d.hex; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#fff'; x.font = 'bold 32px system-ui, sans-serif'; x.fillText(shortName(d.name), 160, 36, 288);
    x.fillStyle = out ? '#fca5a5' : '#7dffb0'; x.font = 'bold 28px system-ui, sans-serif';
    x.fillText(out ? 'BANGKRUT' : formatRupiah(money), 160, 68, 288);
    s.material.map.needsUpdate = true;
    s.material.map.colorSpace = THREE.SRGBColorSpace;
  }

  init(players) {
    this.clear();
    players.forEach((player, idx) => this.pawns.push(this.createPawn(player, idx)));
  }

  createPawn(player, idx) {
    const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
    const skin = SKINS[idx % SKINS.length], pants = PANTS[idx % PANTS.length];
    const root = new THREE.Group();     // posisi dunia
    const body = new THREE.Group();     // dapat meloncat / membungkuk
    root.add(body);
    const mShirt = new THREE.MeshStandardMaterial({ color: color.color, roughness: 0.7 });
    const mSkin = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.75 });
    const mPants = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.8 });
    const mShoe = new THREE.MeshStandardMaterial({ color: 0x20252e, roughness: 0.9 });
    const part = (parent, mat, w, h, d, x, y, z) => {
      const m = new THREE.Mesh(box, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
    };
    // Kaki (pivot di pinggul)
    const legL = new THREE.Group(), legR = new THREE.Group();
    legL.position.set(-0.36, 1.05, 0); legR.position.set(0.36, 1.05, 0);
    for (const leg of [legL, legR]) { part(leg, mPants, 0.62, 0.8, 0.66, 0, -0.4, 0); part(leg, mShoe, 0.66, 0.26, 0.78, 0, -0.93, 0.06); body.add(leg); }
    // Badan
    const torso = part(body, mShirt, 1.45, 1.25, 0.75, 0, 1.68, 0);
    part(body, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), 1.47, 0.14, 0.77, 0, 1.2, 0);      // sabuk
    part(body, new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.5 }), 0.3, 0.3, 0.05, 0, 1.78, 0.39);    // lencana
    // Lengan (pivot di bahu)
    const armL = new THREE.Group(), armR = new THREE.Group();
    armL.position.set(-1.0, 2.2, 0); armR.position.set(1.0, 2.2, 0);
    for (const arm of [armL, armR]) { part(arm, mShirt, 0.5, 0.5, 0.58, 0, -0.25, 0); part(arm, mSkin, 0.46, 0.78, 0.54, 0, -0.9, 0); body.add(arm); }
    // Kepala dengan wajah ceria
    const faceMat = new THREE.MeshStandardMaterial({ map: this.faceTexture(skin), roughness: 0.7 });
    const headGeo = new THREE.BoxGeometry(1.05, 1.0, 1.0);
    const head = new THREE.Mesh(headGeo, [mSkin, mSkin, mSkin, mSkin, faceMat, mSkin]);
    head.position.set(0, 2.85, 0); head.castShadow = true; body.add(head);
    this.addAccessory(body, idx, color, head);
    // Cincin pembeda warna di tanah + penunjuk giliran
    const ring = new THREE.Mesh(this.ringGeo, new THREE.MeshBasicMaterial({ color: color.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; root.add(ring);
    const arrow = new THREE.Mesh(this.arrowGeo, new THREE.MeshStandardMaterial({ color: color.color, emissive: color.color, emissiveIntensity: 0.55, roughness: 0.4 }));
    arrow.rotation.x = Math.PI; arrow.position.y = 5.4; arrow.visible = false; root.add(arrow);
    const beam = new THREE.Mesh(this.beamGeo, new THREE.MeshBasicMaterial({ color: color.color, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.position.y = 8; beam.visible = false; root.add(beam);
    const tag = this.makeTag(player.name); tag.userData.hex = color.hex; tag.position.y = 4.55; root.add(tag);
    this.drawTag(tag, player.money, player.out);
    this.group.add(root);
    const start = world.tiles[player.pos || 0];
    root.position.set(start.x, start.y, start.z);
    return {
      id: player.id, idx, root, body, legL, legR, armL, armR, head, ring, arrow, beam, tag,
      tile: player.pos || 0, walking: false, phase: Math.random() * 6, yaw: Math.atan2(start.tx, start.tz),
      walk: null, jumpT: -1, cheerT: -1, scaleT: -1, scaleFrom: 1, pending: null, hop: 0, slot: new THREE.Vector3(start.x, start.y, start.z),
    };
  }

  addAccessory(body, idx, color, head) {
    const m = (c, rough = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: rough });
    const add = (geo, mat, x, y, z) => { const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.castShadow = true; body.add(mesh); return mesh; };
    const kind = idx % 8;
    if (kind === 0) {           // peci hitam
      add(new THREE.CylinderGeometry(0.5, 0.55, 0.45, 14), m(0x1b1b1f), 0, 3.5, 0);
      add(new THREE.BoxGeometry(1.08, 0.2, 1.04), m(0x1b1b1f), 0, 3.4, 0);
    } else if (kind === 1) {    // topi baseball
      add(new THREE.CylinderGeometry(0.55, 0.58, 0.4, 14, 1, false, 0, Math.PI * 2), m(color.color), 0, 3.5, 0);
      add(new THREE.BoxGeometry(0.9, 0.08, 0.7), m(color.color), 0, 3.35, 0.7);
    } else if (kind === 2) {    // caping petani
      add(new THREE.ConeGeometry(1.35, 0.7, 14), m(0xe6c27a, 0.95), 0, 3.6, 0);
    } else if (kind === 3) {    // ikat kepala + rambut
      add(new THREE.BoxGeometry(1.1, 0.35, 1.06), m(0x2b1b14), 0, 3.5, -0.02);
      add(new THREE.BoxGeometry(1.1, 0.16, 1.08), m(0xdc2626), 0, 3.3, 0);
    } else if (kind === 4) {    // helm proyek
      add(new THREE.SphereGeometry(0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), m(0xffc107, 0.4), 0, 3.35, 0);
      add(new THREE.BoxGeometry(0.9, 0.08, 0.5), m(0xffc107, 0.4), 0, 3.35, 0.62);
    } else if (kind === 5) {    // kuncir
      add(new THREE.BoxGeometry(1.1, 0.35, 1.08), m(0x3a2418), 0, 3.5, -0.02);
      add(new THREE.SphereGeometry(0.28, 10, 8), m(0x3a2418), 0, 3.35, -0.62);
      add(new THREE.BoxGeometry(0.12, 0.55, 0.12), m(0x3a2418), 0, 3.0, -0.66);
    } else if (kind === 6) {    // kupluk
      add(new THREE.SphereGeometry(0.58, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.7), m(color.color, 0.95), 0, 3.38, 0);
      add(new THREE.SphereGeometry(0.17, 8, 6), m(0xffffff), 0, 3.95, 0);
    } else {                    // mahkota kecil
      add(new THREE.CylinderGeometry(0.5, 0.45, 0.3, 8), m(0xffc933, 0.3), 0, 3.45, 0);
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(new THREE.ConeGeometry(0.1, 0.3, 4), m(0xffe066, 0.3), Math.cos(a) * 0.42, 3.7, Math.sin(a) * 0.42); }
    }
  }

  // Lokasi berdiri tiap pemain pada sebuah petak (dibagi rata agar tidak bertumpuk).
  slotFor(idx, tile) {
    const t = world.tiles[tile];
    const occupants = this.pawns.filter((p) => !p.hidden && (p.walk ? p.walk.destTile : p.tile) === tile).map((p) => p.idx).sort((a, b) => a - b);
    const n = occupants.length, k = Math.max(0, occupants.indexOf(idx));
    let lat = 0, lon = 0;
    if (n > 1) {
      const radius = Math.min(1.6, 0.6 + n * 0.17), a = (k / n) * Math.PI * 2 + 0.6;
      lat = Math.cos(a) * radius; lon = Math.sin(a) * radius;
    }
    return new THREE.Vector3(t.x + (-t.tz) * lat + t.tx * lon, t.y + 0.1, t.z + t.tx * lat + t.tz * lon);
  }

  walk(idx, fromTile, toTile, onDone) {
    const p = this.pawns[idx];
    if (!p) { onDone?.(); return; }
    const L = world.roadLength;
    const s0 = world.tileS(fromTile);
    let arc = (world.tileS(toTile) - s0 + L) % L;
    if (arc < 1) arc = L;
    p.walk = { s0, arc, dist: 0, destTile: toTile, onDone, lastTile: fromTile, speed: 0 };
    p.tile = fromTile;
    p.walking = true;
  }

  // Berpindah instan (kartu, tol, lapas, tukar posisi) dengan efek menghilang-muncul.
  teleport(idx, toTile, onDone) {
    const p = this.pawns[idx];
    if (!p) { onDone?.(); return; }
    p.pending = { tile: toTile, onDone, stage: 0, t: 0 };
  }

  cheer(idx) { const p = this.pawns[idx]; if (p) p.cheerT = 0; }
  hit(idx) { const p = this.pawns[idx]; if (p) p.jumpT = 0; }

  position(idx) { return this.pawns[idx]?.root.position; }

  sync(state, activeIdx) {
    state.players.forEach((pl, idx) => {
      const p = this.pawns[idx]; if (!p) return;
      this.drawTag(p.tag, pl.money, pl.out);
      p.hidden = !!pl.out; p.root.visible = !pl.out;
      if (!p.walk && !p.pending) p.tile = pl.pos;
      p.arrow.visible = idx === activeIdx && !pl.out;
      p.beam.visible = idx === activeIdx && !pl.out;
      p.ring.material.opacity = idx === activeIdx ? 1 : 0.65;
    });
    this.activeIdx = activeIdx;
  }

  update(dt, time, camera) {
    for (const p of this.pawns) {
      const root = p.root;
      let moving = false;
      if (p.walk) {
        const w = p.walk;
        const remaining = w.arc - w.dist;
        // Kecepatan: mulai pelan, penuh di tengah, melambat di akhir.
        const target = clamp(Math.min(remaining * 1.6 + 2.5, WALK_SPEED), 2.5, WALK_SPEED);
        w.speed += (target - w.speed) * Math.min(1, dt * 8);
        w.dist = Math.min(w.arc, w.dist + w.speed * dt);
        const pt = world.pointAtS(w.s0 + w.dist, this.tmp);
        // Kehadiran lateral kecil supaya tiap pemain tidak berjalan di garis yang sama persis.
        const lane = ((p.idx % 5) - 2) * 0.36;
        root.position.set(pt.x - pt.tz * lane, pt.y + 0.1, pt.z + pt.tx * lane);
        const yawT = Math.atan2(pt.tx, pt.tz);
        p.yaw += Math.atan2(Math.sin(yawT - p.yaw), Math.cos(yawT - p.yaw)) * Math.min(1, dt * 12);
        moving = true;
        // Langkah kaki setiap melewati petak
        if (w.lastTile !== w.destTile) {
          const nextTile = (w.lastTile + 1) % 45;
          let a = (world.tileS(nextTile) - w.s0 + world.roadLength) % world.roadLength;
          if (a < 0.5) a += world.roadLength;
          if (w.dist >= a - 0.05) { w.lastTile = nextTile; p.tile = nextTile; this.onStep?.(p.idx, nextTile); }
        }
        if (w.dist >= w.arc) {
          const done = w.onDone; p.tile = w.destTile; p.walk = null; p.walking = false;
          done?.();
        }
      } else if (p.pending) {
        const q = p.pending; q.t += dt;
        if (q.stage === 0) {
          const k = clamp(q.t / 0.28, 0, 1);
          p.body.scale.setScalar(1 - k * 0.97); p.body.rotation.y += dt * 14;
          if (k >= 1) { q.stage = 1; q.t = 0; p.tile = q.tile; const s = this.slotFor(p.idx, q.tile); root.position.copy(s); p.fxPos = s.clone(); q.fx = true; this.onTeleportLand?.(p.idx, s); }
        } else {
          const k = clamp(q.t / 0.4, 0, 1);
          const sc = 1 + Math.sin(k * Math.PI) * 0.25;
          p.body.scale.setScalar(Math.max(0.03, k < 1 ? k * sc : 1));
          p.body.rotation.y = 0;
          if (k >= 1) { const done = q.onDone; p.pending = null; p.body.scale.setScalar(1); done?.(); }
        }
      } else if (!p.hidden) {
        const slot = this.slotFor(p.idx, p.tile);
        root.position.lerp(slot, 1 - Math.exp(-dt * 9));
      }
      // Animasi sendi
      p.phase += dt * (moving ? 13 : 2);
      const swing = moving ? Math.sin(p.phase) * 0.85 : 0;
      p.legL.rotation.x = swing; p.legR.rotation.x = -swing;
      p.armL.rotation.x = -swing * 0.9; p.armR.rotation.x = swing * 0.9;
      let by = moving ? Math.abs(Math.sin(p.phase)) * 0.16 : Math.sin(p.phase * 0.5) * 0.04;
      if (p.cheerT >= 0) {
        p.cheerT += dt;
        by += Math.abs(Math.sin(p.cheerT * 9)) * 0.9;
        p.armL.rotation.x = p.armR.rotation.x = -2.8 + Math.sin(p.cheerT * 18) * 0.25;
        if (p.cheerT > 1.3) p.cheerT = -1;
      }
      if (p.jumpT >= 0) { p.jumpT += dt; by += Math.sin(Math.min(1, p.jumpT / 0.4) * Math.PI) * 0.8; if (p.jumpT > 0.4) p.jumpT = -1; }
      p.body.position.y = by;
      if (!moving && !p.pending) {
        const yaw = p.idx === this.activeIdx && this.faceCamera ? this.faceYaw ?? p.yaw : p.yaw;
        p.yaw += Math.atan2(Math.sin(yaw - p.yaw), Math.cos(yaw - p.yaw)) * Math.min(1, dt * 6);
      }
      if (!p.pending || p.pending.stage !== 0) p.body.rotation.y = p.yaw;
      p.root.rotation.y = 0;
      if (camera) {
        const d = camera.position.distanceTo(p.root.position);
        const k = Math.min(2.4, Math.max(0.5, d / 30));
        p.tag.scale.set(4.4 * k, 1.375 * k, 1);
        p.tag.position.y = 4.4 + Math.min(2.5, k * 0.9);
      }
      // Penunjuk giliran
      if (p.arrow.visible) {
        p.arrow.position.y = 5.5 + Math.sin(time * 4) * 0.35; p.arrow.rotation.y += dt * 2;
        p.ring.scale.setScalar(1 + Math.sin(time * 5) * 0.08);
      } else p.ring.scale.setScalar(1);
    }
  }
}
