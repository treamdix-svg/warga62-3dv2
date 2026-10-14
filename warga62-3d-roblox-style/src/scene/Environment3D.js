import * as THREE from 'three';
import { MeshBuilder } from '../world/MeshBuilder.js';

const HORIZON = 0xcdeeff;

// Langit gradasi, matahari, kabut atmosfer, dan awan yang melayang pelan.
export class Environment3D {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    scene.background = new THREE.Color(HORIZON);
    scene.fog = new THREE.Fog(HORIZON, 170, 620);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(900, 24, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: { top: { value: new THREE.Color(0x3f9ff0) }, mid: { value: new THREE.Color(0x8fd4f7) }, bottom: { value: new THREE.Color(HORIZON) } },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y,0.0,1.0); vec3 c = mix(bottom, mid, smoothstep(0.0,0.22,h)); c = mix(c, top, smoothstep(0.2,0.8,h)); gl_FragColor = vec4(c,1.0); }',
      }),
    );
    scene.add(sky);
    this.sky = sky;

    scene.add(new THREE.HemisphereLight(0xe6f6ff, 0x86b06a, 1.65));

    this.sun = new THREE.DirectionalLight(0xfff0d2, 2.7);
    this.sunOffset = new THREE.Vector3(-38, 70, 46);
    this.sun.position.copy(this.sunOffset);
    this.sun.castShadow = true;
    const size = quality.shadowMap;
    this.sun.shadow.mapSize.set(size, size);
    const e = quality.shadowExtent;
    Object.assign(this.sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 5, far: 220 });
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.35;
    scene.add(this.sun, this.sun.target);

    const fill = new THREE.DirectionalLight(0xbfe6ff, 0.45);
    fill.position.set(50, 25, -40);
    scene.add(fill);

    // Matahari yang terlihat di langit
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(26, 24), new THREE.MeshBasicMaterial({ color: 0xfffbe0, fog: false, transparent: true, opacity: 0.95, depthWrite: false }));
    sunDisc.position.copy(this.sunOffset).normalize().multiplyScalar(780);
    sunDisc.lookAt(0, 0, 0);
    scene.add(sunDisc);

    this.createClouds();
  }

  // Bayangan mengikuti titik fokus kamera sehingga resolusi tetap tajam di area bermain.
  followShadow(target) {
    const step = 4;
    const tx = Math.round(target.x / step) * step, tz = Math.round(target.z / step) * step;
    this.sun.target.position.set(tx, 0, tz);
    this.sun.position.set(tx + this.sunOffset.x, this.sunOffset.y, tz + this.sunOffset.z);
    this.sun.target.updateMatrixWorld();
  }

  createClouds() {
    // Setiap awan = satu mesh gabungan (beberapa gumpalan), supaya hemat draw call.
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, transparent: true, opacity: 0.93, emissive: 0xdff1ff, emissiveIntensity: 0.35 });
    this.clouds = new THREE.Group();
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let c = 0; c < this.quality.clouds; c++) {
      const b = new MeshBuilder();
      const puffs = 4 + Math.floor(rnd() * 4);
      for (let p = 0; p < puffs; p++) {
        const s = 4 + rnd() * 5;
        b.sphere(1, 0xffffff, (p - puffs / 2) * 5.2 + rnd() * 2, rnd() * 2, rnd() * 4 - 2, { sx: s * 1.3, sy: s * 0.7, sz: s });
      }
      const m = new THREE.Mesh(b.build(), mat);
      const a = rnd() * Math.PI * 2, r = 50 + rnd() * 170;
      m.position.set(Math.cos(a) * r, 52 + rnd() * 30, Math.sin(a) * r);
      m.userData.speed = 0.5 + rnd() * 0.9;
      this.clouds.add(m);
    }
    this.scene.add(this.clouds);
  }

  update(dt) {
    for (const c of this.clouds.children) {
      c.position.x += c.userData.speed * dt;
      if (c.position.x > 230) c.position.x = -230;
    }
  }
}
