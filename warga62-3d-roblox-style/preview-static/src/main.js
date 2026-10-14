import * as THREE from 'three';
import { engine, getTile3DPosition } from './engine/GameBridge.js';
import { Board3D } from './scene/Board3D.js';
import { Buildings3D } from './scene/Buildings3D.js';
import { Pawns3D } from './scene/Pawns3D.js';
import { Dice3D } from './scene/Dice3D.js';
import { Environment3D } from './scene/Environment3D.js';
import { CameraController } from './scene/CameraController.js';
import { HUD } from './ui/HUD.js';
import { sounds } from './audio/AudioEffects.js';


class Warga62App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.uiContainer = document.getElementById('ui-container');

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.board3D = null;
    this.buildings3D = null;
    this.pawns3D = null;
    this.dice3D = null;
    this.cameraController = null;
    this.hud = null;

    this.gameState = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredTile = null;

    this.initThree();
    this.initGame();
    this.initInteraction();
    this.animate();
  }

  initThree() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      51,
      window.innerWidth / window.innerHeight,
      0.1,
      450
    );

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 3. Modul 3D
    new Environment3D(this.scene);
    this.board3D = new Board3D(this.scene);
    this.buildings3D = new Buildings3D(this.scene);
    this.pawns3D = new Pawns3D(this.scene);
    this.dice3D = new Dice3D(this.scene);
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);

    // 4. Responsive Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.cameraController?.fitScreen();
    });
  }

  initGame() {
    // Inisialisasi game Warga +62 asli dengan 4 pemain lokal
    const initialPlayers = ['Warga 1 (Kamu)', 'Warga 2 (Budi)', 'Warga 3 (Siti)', 'Warga 4 (Joko)'];
    this.gameState = engine.fresh(initialPlayers, 'local');
    engine.randomStart(this.gameState);

    this.pawns3D.initPawns(this.gameState.players);
    this.board3D.updateState(this.gameState);
    this.buildings3D.updateBuildings(this.gameState);

    // 5. Inisialisasi HUD Interface
    this.hud = new HUD(this.uiContainer, {
      onAction: (action, target) => this.handleAction(action, target),
      onFocusPlayer: (playerIndex) => {
        const pawnObj = this.pawns3D.pawnObjects[playerIndex];
        if (pawnObj) this.cameraController.focusOn(pawnObj.group.position);
      },
      onFocusActive: () => {
        const activeIdx = this.gameState.turn;
        const pawnObj = this.pawns3D.pawnObjects[activeIdx];
        if (pawnObj) this.cameraController.focusOn(pawnObj.group.position);
      },
      onOverview: () => {
        this.cameraController.resetOverview();
      },
      onIsometric: () => {
        this.cameraController.setIsometric();
      },
      onTopDown: () => {
        this.cameraController.setTopDown();
      },
      onRestart: () => {
        this.initGame();
      }
    });

    this.hud.update(this.gameState, this.gameState.turn, engine);
    this.pawns3D.update(this.gameState, this.gameState.turn);

    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'top') {
      this.cameraController.setTopDown();
      this.cameraController.camera.position.set(0, 64, 0.2);
      this.cameraController.controls.target.set(0, 0, 0);
      this.cameraController.isTransitioning = false;
    } else if (params.get('view') === 'iso') {
      this.cameraController.setIsometric();
      this.cameraController.camera.position.set(24, 46, 34);
      this.cameraController.controls.target.set(0, 0, 0);
      this.cameraController.isTransitioning = false;
    }
  }

  handleAction(action, target = null) {
    if (!this.gameState) return;

    if (action === 'roll') {
      const activeIdx = this.gameState.turn;
      const oldPos = this.gameState.players[activeIdx].pos;

      // Jalankan logika roll di engine asli
      try {
        engine.act(this.gameState, 'roll');
      } catch (err) {
        console.warn('Action error:', err);
        return;
      }

      const newPos = this.gameState.players[activeIdx].pos;
      const [d1, d2] = this.gameState.dice;

      // Jalankan animasi lempar dadu 3D
      this.dice3D.roll(d1, d2, () => {
        // Setelah dadu berhenti, animasikan loncatan pion 3D
        if (oldPos !== newPos) {
          this.pawns3D.animateMove(activeIdx, oldPos, newPos, () => {
            this.syncState();
          });
        } else {
          this.syncState();
        }
      });
    } else {
      // Aksi lainnya (buy, build, skip, salarydone, courtroll, bail, dll)
      try {
        engine.act(this.gameState, action, Math.random, target);
        sounds.playCoin();
      } catch (err) {
        console.warn('Action error:', err);
      }
      this.syncState();
    }
  }

  syncState() {
    this.board3D.updateState(this.gameState);
    this.buildings3D.updateBuildings(this.gameState);
    this.pawns3D.update(this.gameState, this.gameState.turn);
    this.hud.update(this.gameState, this.gameState.turn, engine);
  }

  initInteraction() {
    // Raycasting untuk hover petak 3D
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.board3D.tileMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (this.hoveredTile !== hit) {
          if (this.hoveredTile) this.board3D.highlightTile(this.hoveredTile.userData.index, false);
          this.hoveredTile = hit;
          this.board3D.highlightTile(hit.userData.index, true);
          this.hud?.showTileInfo?.(hit.userData);
        }
      } else {
        if (this.hoveredTile) {
          this.board3D.highlightTile(this.hoveredTile.userData.index, false);
          this.hoveredTile = null;
          this.hud?.hideTileInfo?.();
        }
      }
    });

    // Klik petak untuk fokus kamera
    window.addEventListener('click', (e) => {
      // Abaikan jika klik terjadi di UI overlay
      if (e.target.closest('.interactive')) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.board3D.tileMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        this.cameraController.focusOn(hit.position, { x: 0, y: 16, z: 14 });
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.board3D) this.board3D.updateAnimation();
    this.cameraController.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
window.addEventListener('DOMContentLoaded', () => {
  new Warga62App();
});
