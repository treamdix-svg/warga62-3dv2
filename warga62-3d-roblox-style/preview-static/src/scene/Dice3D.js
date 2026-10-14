import * as THREE from 'three';
import { sounds } from '../audio/AudioEffects.js';

export class Dice3D {
  constructor(scene) {
    this.scene = scene;
    this.diceGroup = new THREE.Group();
    this.scene.add(this.diceGroup);

    this.die1 = this.createDieMesh();
    this.die2 = this.createDieMesh();

    // Posisi duduk di papan permainan (seperti di foto sampel)
    this.die1.position.set(-1.8, 1.35, 1.2);
    this.die2.position.set(1.8, 1.35, 1.2);

    this.diceGroup.add(this.die1);
    this.diceGroup.add(this.die2);

    this.isRolling = false;
  }

  createDieMesh() {
    const size = 1.35;
    const geometry = new THREE.BoxGeometry(size, size, size);

    // D6 pip numbers: +X: 1, -X: 6, +Y: 2, -Y: 5, +Z: 3, -Z: 4
    const pips = [1, 6, 2, 5, 3, 4];
    const materials = pips.map(num => {
      const tex = this.generateDieFaceTexture(num);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.15, // Akrilik mengkilap
        metalness: 0.05
      });
    });

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  generateDieFaceTexture(num) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background putih akrilik gading
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Bevel tepi halus
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Titik 1 merah cerah khas dadu board game, titik lain hitam pekat
    ctx.fillStyle = num === 1 ? '#dc2626' : '#0f172a';

    const dot = (x, y, r = 24) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const c = 128, l = 68, r = 188, t = 68, b = 188;

    if (num === 1) dot(c, c, 34); // Titik merah besar di tengah
    else if (num === 2) { dot(l, t); dot(r, b); }
    else if (num === 3) { dot(l, t); dot(c, c); dot(r, b); }
    else if (num === 4) { dot(l, t); dot(r, t); dot(l, b); dot(r, b); }
    else if (num === 5) { dot(l, t); dot(r, t); dot(c, c); dot(l, b); dot(r, b); }
    else if (num === 6) { dot(l, t); dot(r, t); dot(l, c); dot(r, c); dot(l, b); dot(r, b); }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }

  getRotationForValue(val) {
    const rot = new THREE.Euler(0, 0, 0);
    switch (val) {
      case 2:
        rot.set(0, 0, 0);
        break;
      case 5:
        rot.set(0, 0, Math.PI);
        break;
      case 1:
        rot.set(0, 0, -Math.PI / 2);
        break;
      case 6:
        rot.set(0, 0, Math.PI / 2);
        break;
      case 3:
        rot.set(Math.PI / 2, 0, 0);
        break;
      case 4:
        rot.set(-Math.PI / 2, 0, 0);
        break;
    }
    return rot;
  }

  roll(val1, val2, onComplete) {
    if (this.isRolling) return;
    this.isRolling = true;

    sounds.playDiceRoll();

    const duration = 1500;
    const startTime = performance.now();

    const targetRot1 = this.getRotationForValue(val1);
    const targetRot2 = this.getRotationForValue(val2);

    const extraRotX1 = Math.PI * 4;
    const extraRotY1 = Math.PI * 6;
    const extraRotX2 = Math.PI * 6;
    const extraRotY2 = Math.PI * 4;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const bounceHeight = Math.sin(progress * Math.PI) * 4.2 * (1 - progress * 0.6);
      this.die1.position.y = 1.35 + bounceHeight;
      this.die2.position.y = 1.35 + bounceHeight;

      this.die1.position.x = -1.8 + Math.sin(progress * Math.PI * 2) * 0.7;
      this.die2.position.x = 1.8 - Math.sin(progress * Math.PI * 2) * 0.7;

      this.die1.rotation.x = targetRot1.x + extraRotX1 * (1 - easeOut);
      this.die1.rotation.y = targetRot1.y + extraRotY1 * (1 - easeOut);
      this.die1.rotation.z = targetRot1.z;

      this.die2.rotation.x = targetRot2.x + extraRotX2 * (1 - easeOut);
      this.die2.rotation.y = targetRot2.y + extraRotY2 * (1 - easeOut);
      this.die2.rotation.z = targetRot2.z;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.die1.rotation.copy(targetRot1);
        this.die2.rotation.copy(targetRot2);
        this.die1.position.set(-1.8, 1.35, 1.2);
        this.die2.position.set(1.8, 1.35, 1.2);

        this.isRolling = false;
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }
}
