import * as THREE from 'three';
import { getTile3DPosition } from '../engine/GameBridge.js';

export class Buildings3D {
  constructor(scene) {
    this.scene = scene;
    this.buildingGroup = new THREE.Group();
    this.scene.add(this.buildingGroup);
    this.activeBuildings = {};
  }

  updateBuildings(state) {
    for (let i = 0; i < 45; i++) {
      const level = state.buildings?.[i] || 0;
      const owner = state.owners?.[i];
      const hasRoad = state.roads?.[i];

      if (!owner || hasRoad) {
        if (this.activeBuildings[i]) {
          this.buildingGroup.remove(this.activeBuildings[i]);
          delete this.activeBuildings[i];
        }
        continue;
      }

      const current = this.activeBuildings[i];
      if (!current || current.userData.level !== level || current.userData.owner !== owner) {
        if (current) this.buildingGroup.remove(current);
        const model = this.createBuildingModel(i, level, owner);
        model.userData = { level, owner };
        this.buildingGroup.add(model);
        this.activeBuildings[i] = model;
      }
    }
  }

  createBuildingModel(tileIndex, level, ownerId) {
    const group = new THREE.Group();
    const pos = getTile3DPosition(tileIndex, 0.95);
    // Plot milik pemain berada di sisi DALAM jalan; checkpoint tetap dapat diklik.
    const radius = Math.hypot(pos.x, pos.z) || 1;
    group.position.set(pos.x - pos.x / radius * 3.6, 0.18, pos.z - pos.z / radius * 3.6);
    group.rotation.y = pos.rotationY;

    const playerIdx = ownerId === 'state' ? -1 : Number(ownerId);
    const ownerColor = playerIdx >= 0 ? [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981, 0xa855f7, 0xf97316][playerIdx % 6] : 0x64748b;

    if (level === 0) {
      // Patok Tanah Terjual / Bendera Miniatur
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0.65, 0.45, 0.85);
      pole.castShadow = true;
      group.add(pole);

      const flagGeo = new THREE.BoxGeometry(0.45, 0.28, 0.04);
      const flagMat = new THREE.MeshStandardMaterial({
        color: ownerColor,
        roughness: 0.3
      });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(0.88, 0.72, 0.85);
      flag.castShadow = true;
      group.add(flag);
    } else if (level === 1) {
      // RUMAH SUBSIDI 1: Rumah miniatur mungil ceria khas board game (atap merah, dinding putih, cerobong)
      const baseGeo = new THREE.BoxGeometry(1.25, 0.75, 1.05);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(0, 0.38, 0.65);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Atap Pelana Genteng Merah
      const roofGeo = new THREE.ConeGeometry(1.0, 0.65, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, 1.05, 0.65);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);

      // Cerobong asap putih
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.4, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      chimney.position.set(0.35, 1.25, 0.75);
      chimney.castShadow = true;
      group.add(chimney);

      // Badge pemilik di atap
      const badge = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshStandardMaterial({ color: ownerColor, emissive: ownerColor, emissiveIntensity: 0.4 })
      );
      badge.position.set(0, 1.45, 0.65);
      group.add(badge);
    } else if (level === 2) {
      // RUMAH SUBSIDI 2: Rumah tingkat 2 dengan kanopi, balkon, dan atap oranye/biru
      const floor1 = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.75, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
      );
      floor1.position.set(0, 0.38, 0.65);
      floor1.castShadow = true;
      group.add(floor1);

      const floor2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.7, 1.05),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 }) // Kuning pastel
      );
      floor2.position.set(0, 1.08, 0.65);
      floor2.castShadow = true;
      group.add(floor2);

      // Atap miring modern
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.14, 1.15),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      roof.position.set(0, 1.48, 0.65);
      roof.rotation.x = -0.06;
      roof.castShadow = true;
      group.add(roof);

      // Garis lis lantai warna pemilik
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, 0.08, 1.22),
        new THREE.MeshStandardMaterial({ color: ownerColor })
      );
      trim.position.set(0, 0.76, 0.65);
      group.add(trim);
    } else if (level === 3) {
      // RUMAH OKB (Orang Kaya Baru): Villa mewah 3D dengan kaca panoramic, kolam renang, dan mahkota emas
      const main = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 1.45, 1.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
      );
      main.position.set(0, 0.73, 0.65);
      main.castShadow = true;
      group.add(main);

      // Kaca panoramic besar berkilau
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.85, 0.06),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.8,
          roughness: 0.1,
          transparent: true,
          opacity: 0.88
        })
      );
      glass.position.set(0, 0.85, 1.32);
      group.add(glass);

      // Atap cantilever emas mewah
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.18, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.2 })
      );
      roof.position.set(0, 1.52, 0.65);
      roof.castShadow = true;
      group.add(roof);

      // Kolam renang mini toska di samping
      const pool = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.1, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, metalness: 0.5 })
      );
      pool.position.set(-0.9, 0.08, 0.65);
      group.add(pool);

      // Mahkota OKB emas berputar di atas villa
      const crown = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.06, 8, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.6,
          metalness: 0.8
        })
      );
      crown.position.set(0, 1.82, 0.65);
      crown.rotation.x = Math.PI / 2;
      group.add(crown);
    }

    return group;
  }
}
