import * as THREE from 'three';

// Efek partikel (koin, debu, konfeti, asap) dan teks melayang untuk peristiwa permainan.
export class Effects3D {
  constructor(scene, quality) {
    this.scene = scene;
    const max = quality.particles * 5;
    this.max = max;
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshBasicMaterial({ vertexColors: false }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.setColorAt(0, new THREE.Color(1, 1, 1));
    scene.add(this.mesh);
    this.p = [];
    this.free = [];
    this.dummy = new THREE.Object3D();
    this.color = new THREE.Color();
    for (let i = 0; i < max; i++) { this.p.push({ alive: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, max: 1, size: 1, g: 0, spin: 0, rot: 0, shrink: true }); this.free.push(i); this.mesh.setMatrixAt(i, this.dummy.matrix.makeScale(0, 0, 0)); }
    this.texts = [];
  }

  emit(pos, { count = 10, colors = [0xffffff], speed = 4, up = 4, size = 1, gravity = 14, life = 0.9, spread = 1, shrink = true } = {}) {
    for (let n = 0; n < count && this.free.length; n++) {
      const i = this.free.pop(), p = this.p[i];
      p.alive = true; p.pos.copy(pos);
      const a = Math.random() * Math.PI * 2, s = Math.random() * speed * spread;
      p.vel.set(Math.cos(a) * s, up * (0.5 + Math.random() * 0.8), Math.sin(a) * s);
      p.life = p.max = life * (0.7 + Math.random() * 0.6); p.size = size * (0.6 + Math.random() * 0.8); p.g = gravity; p.shrink = shrink;
      p.rot = Math.random() * 6; p.spin = (Math.random() - 0.5) * 12;
      this.color.set(colors[Math.floor(Math.random() * colors.length)]);
      this.mesh.setColorAt(i, this.color);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  coins(pos, gain = true) {
    const gold = gain ? [0xffd23f, 0xffe066, 0xf5b301] : [0xef4444, 0xb91c1c, 0xfca5a5];
    this.emit(pos, { count: 16, colors: gold, speed: 3, up: 9, size: 1.1, gravity: 18, life: 1.0 });
  }
  dust(pos, n = 14) { this.emit(pos, { count: n, colors: [0xe9e0cf, 0xcfc5ae, 0xffffff], speed: 3.2, up: 1.6, size: 1.6, gravity: -1, life: 0.8 }); }
  confetti(pos, n = 50) { this.emit(pos, { count: n, colors: [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e, 0xa855f7, 0xf97316, 0xec4899], speed: 6, up: 14, size: 1, gravity: 9, life: 2.2, shrink: false }); }
  smoke(pos, n = 10) { this.emit(pos, { count: n, colors: [0x6b7280, 0x4b5563], speed: 1.5, up: 3, size: 2, gravity: -2, life: 1.2 }); }
  sparkle(pos, hex) { this.emit(pos, { count: 18, colors: [hex, 0xffffff], speed: 3.5, up: 5, size: 0.9, gravity: 6, life: 0.9 }); }

  floatText(pos, text, color = '#7dffb0') {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const x = c.getContext('2d');
    x.font = 'bold 64px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 12; x.strokeStyle = 'rgba(8,24,34,0.95)'; x.strokeText(text, 256, 64, 490);
    x.fillStyle = color; x.fillText(text, 256, 64, 490);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    s.scale.set(7, 1.75, 1); s.position.copy(pos); s.renderOrder = 30;
    this.scene.add(s);
    this.texts.push({ s, t: 0, life: 1.9, y0: pos.y });
  }

  update(dt) {
    for (let i = 0; i < this.max; i++) {
      const p = this.p[i]; if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; this.free.push(i); this.dummy.scale.setScalar(0); this.dummy.updateMatrix(); this.mesh.setMatrixAt(i, this.dummy.matrix); continue; }
      p.vel.y -= p.g * dt; p.pos.addScaledVector(p.vel, dt); p.rot += p.spin * dt;
      this.dummy.position.copy(p.pos);
      this.dummy.rotation.set(p.rot, p.rot * 0.7, 0);
      const k = p.life / p.max;
      this.dummy.scale.setScalar(p.size * (p.shrink ? Math.min(1, k * 2.2) : 1));
      this.dummy.updateMatrix(); this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    for (let n = this.texts.length - 1; n >= 0; n--) {
      const t = this.texts[n]; t.t += dt;
      const k = t.t / t.life;
      t.s.position.y = t.y0 + k * 4.5; t.s.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      if (k >= 1) { this.scene.remove(t.s); t.s.material.map.dispose(); t.s.material.dispose(); this.texts.splice(n, 1); }
    }
  }
}
