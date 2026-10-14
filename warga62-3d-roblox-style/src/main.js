import * as THREE from 'three';
import { engine, world, getTile3DPosition, PLAYER_COLORS, formatRupiah } from './engine/GameBridge.js';
import { quality } from './quality.js';
import { Terrain3D } from './scene/Terrain3D.js';
import { Roads3D } from './scene/Roads3D.js';
import { Scenery3D } from './scene/Scenery3D.js';
import { Environment3D } from './scene/Environment3D.js';
import { Heroes3D } from './scene/Heroes3D.js';
import { TileMarkers3D } from './scene/TileMarkers3D.js';
import { Buildings3D } from './scene/Buildings3D.js';
import { Avatars3D } from './scene/Avatars3D.js';
import { Dice3D } from './scene/Dice3D.js';
import { Effects3D } from './scene/Effects3D.js';
import { Life3D } from './scene/Life3D.js';
import { CameraController } from './scene/CameraController.js';
import { HUD } from './ui/HUD.js';
import { sounds } from './audio/AudioEffects.js';
import './ui/style.css';

const speedParam = Number(new URLSearchParams(location.search).get('speed')) || 1;   // hanya untuk pengujian
const wait = (ms) => new Promise((r) => setTimeout(r, ms / speedParam));
// Acak kriptografi (sama seperti engine asli); Math.random hanya cadangan.
const secureRandom = () => {
  const c = globalThis.crypto;
  return c?.getRandomValues ? c.getRandomValues(new Uint32Array(1))[0] / 4294967296 : Math.random();
};

class Warga62App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.ui = document.getElementById('ui-container');
    this.state = null;
    this.busy = false;
    this.time = 0;
    this.params = new URLSearchParams(location.search);
    this.world = world;
    if (!this.initThree()) return;
    this.initWorld();
    this.initHud();
    this.initInteraction();
    this.last = performance.now();
    this.fps = { frames: 0, t: 0 };
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
    const auto = Number(this.params.get('autostart'));
    if (auto >= 2) this.startGame(Array.from({ length: auto }, (_, i) => `Warga ${i + 1}`));
    else this.hud.showStart();
  }

  initThree() {
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, powerPreference: 'high-performance' });
    } catch (e) {
      this.ui.innerHTML = '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#fff;background:#0c2733;font:16px system-ui">Browser ini tidak mendukung WebGL. Coba Chrome terbaru dan aktifkan akselerasi perangkat keras.</div>';
      return false;
    }
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.5, 1800);
    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.hud?.toast('Konteks grafis hilang, memuat ulang…', 'bad'); setTimeout(() => location.reload(), 1200); });
    return true;
  }

  initWorld() {
    const s = this.scene;
    this.env = new Environment3D(s, quality);
    this.terrain = new Terrain3D(s, world, quality);
    this.roads = new Roads3D(s, world, this.renderer);
    this.scenery = new Scenery3D(s, world, quality);
    this.heroes = new Heroes3D(s);
    this.markers = new TileMarkers3D(s, quality, this.roads);
    this.buildings = new Buildings3D(s);
    this.avatars = new Avatars3D(s, quality);
    this.dice = new Dice3D(s);
    this.effects = new Effects3D(s, quality);
    this.life = new Life3D(s, quality, this.scenery.cityObstacles || []);
    this.cameraCtl = new CameraController(this.camera, this.renderer.domElement);
    this.avatars.onStep = () => sounds.playStep();
    this.avatars.onTeleportLand = (idx, pos) => { this.effects.sparkle(pos.clone().add(new THREE.Vector3(0, 1.5, 0)), PLAYER_COLORS[idx % PLAYER_COLORS.length].color); sounds.playTeleport(); };
    this.buildings.onBuilt = (i, level, lot) => {
      const pos = new THREE.Vector3(lot.x, lot.y + 1, lot.z);
      this.effects.dust(pos, 18);
      if (level === 0) { sounds.playBuy(); this.effects.sparkle(pos, 0xffd23f); }
      else { sounds.playBuild(); this.effects.confetti(pos.clone().add(new THREE.Vector3(0, 2, 0)), 22); }
    };
    this.cameraCtl.onMode((m) => this.hud?.setCameraMode(m));
    const cam = this.params.get('cam');
    if (cam) {
      const v = cam.split(',').map(Number);
      this.camera.position.set(v[0], v[1], v[2]); this.cameraCtl.controls.target.set(v[3], v[4], v[5]);
      this.cameraCtl.fly = null; this.cameraCtl.mode = 'free';
    }
  }

  initHud() {
    this.hud = new HUD(this.ui, {
      onAction: (a, t) => this.handleAction(a, t),
      onStart: (names) => this.startGame(names),
      onCamera: (mode) => this.cameraCtl.setMode(mode),
      onFocusPlayer: (idx) => { const p = this.avatars.position(idx); if (p) { this.cameraCtl.focusOn(p.clone().add(new THREE.Vector3(0, 2, 0))); } },
      onCardShown: (card) => (card.kind === 'fate' ? sounds.playFate() : sounds.playHazard()),
    });
    this.hud.setCameraMode(this.cameraCtl.mode);
  }

  // ------------------------------------------------------------ permainan
  startGame(names) {
    this.state = engine.fresh(names, 'local');
    engine.randomStart(this.state);
    this.busy = false;
    this.dice.group.visible = false;
    this.avatars.init(this.state.players);
    this.buildings = this.buildings; this.buildings.update({ owners: {}, buildings: {}, roads: {} }, false);
    this.syncAll(false);
    this.cameraCtl.setMode('follow', false);
    const p = this.avatars.position(this.state.turn);
    this.cameraCtl.followPos.copy(p).y += 2;
    this.cameraCtl.followYaw = this.roadYaw(this.avatars.pawns[this.state.turn]);
    this.cameraCtl.flyTo(this.cameraCtl.presetOffset('follow', this.cameraCtl.followPos), 1.6);
    this.hud.hideDice();
    this.hud.toast(`Giliran pertama: ${this.state.players[this.state.turn].name}`);
  }

  // Arah jalan di petak pemain: kamera ikuti menempatkan diri di belakang pion menghadap arah jalan.
  roadYaw(pawn) {
    const t = world.tiles[pawn?.tile ?? 0];
    return Math.atan2(t.tx, t.tz);
  }

  snapshot() {
    const s = this.state;
    return {
      turn: s.turn, phase: s.phase, rollId: s.rollId || 0, effectRoll: s.effectRoll || 0,
      players: s.players.map((p) => ({ pos: p.pos, money: p.money, jail: p.jail, out: p.out, name: p.name })),
      owners: { ...s.owners }, buildings: { ...s.buildings }, roads: { ...s.roads },
    };
  }

  async handleAction(action, target = null) {
    if (!this.state || this.busy || this.state.phase === 'over') return;
    const before = this.snapshot();
    const activeIdx = this.state.turn;
    try {
      engine.act(this.state, action, secureRandom, target);
    } catch (err) {
      console.warn('Aksi ditolak engine:', err.message);
      this.hud.toast(err.message || 'Aksi tidak tersedia', 'bad'); sounds.playError();
      return;
    }
    this.busy = true; this.hud.setBusy(true);
    try { await this.playSequence(before, activeIdx, action); }
    catch (err) { console.error(err); }
    this.busy = false; this.hud.setBusy(false);
    this.syncAll(true);
    this.afterSync(before, activeIdx);
  }

  async playSequence(before, activeIdx, action) {
    const s = this.state;
    const pawnPos = (i) => this.avatars.position(i)?.clone() || new THREE.Vector3();
    // 1. Dadu 3D (nilai langsung dari engine)
    let values = null;
    if ((s.rollId || 0) !== before.rollId) values = [...s.dice];
    else if ((s.effectRoll || 0) !== before.effectRoll && s.effectDie) values = [s.effectDie];
    if (values) {
      const origin = pawnPos(activeIdx);
      const t = world.tiles[this.avatars.pawns[activeIdx].tile] || world.tiles[0];
      sounds.playDiceRoll();
      await new Promise((resolve) => this.dice.roll(values, origin, { fx: t.tx, fz: t.tz }, origin.y, () => resolve(), (n) => sounds.playDiceHit(n)));
      this.hud.showDice(values, values.length === 2 && values[0] === values[1]);
      const sum = values.reduce((a, b) => a + b, 0);
      this.effects.floatText(origin.clone().add(new THREE.Vector3(t.tx * 4.6, 4.2, t.tz * 4.6)), values.length === 2 ? `${values[0]} + ${values[1]} = ${sum}` : String(sum), '#ffffff');
      await wait(650);
    }
    // 2. Perpindahan pion
    const jobs = [];
    s.players.forEach((p, i) => {
      const b = before.players[i];
      if (p.pos === b.pos) return;
      const moved = s.move && s.move.player === i && s.move.from === b.pos && action === 'roll';
      if (moved && (b.pos + s.move.steps) % 45 === p.pos) {
        this.dice.hide();
        jobs.push(new Promise((res) => this.avatars.walk(i, b.pos, p.pos, res)));
      } else {
        jobs.push(new Promise((res) => this.avatars.teleport(i, p.pos, res)));
      }
    });
    if (jobs.length) { await Promise.all(jobs); await wait(150); }
    if (values) this.dice.hide();
    // 3. Dampak uang, bangunan, kepemilikan
    this.buildings.update(this.state, true);
    let moneyEvents = 0;
    s.players.forEach((p, i) => {
      const b = before.players[i], d = p.money - b.money;
      if (d !== 0) {
        moneyEvents++;
        const at = pawnPos(i).add(new THREE.Vector3(0, 5.2 + (moneyEvents % 3) * 0.6, 0));
        this.effects.floatText(at, `${d > 0 ? '+' : '−'}${formatRupiah(Math.abs(d))}`, d > 0 ? '#7dffb0' : '#ff9b9b');
        this.effects.coins(pawnPos(i).add(new THREE.Vector3(0, 3, 0)), d > 0);
        if (d >= 1000000 && s.phase === 'salary') sounds.playSalary(); else if (d > 0) sounds.playCoin(); else sounds.playPay();
        if (d > 0) this.avatars.cheer(i); else this.avatars.hit(i);
      }
      if (!b.jail && p.jail) { sounds.playJail(); this.hud.toast(`${p.name} masuk Lapas`, 'bad'); this.avatars.hit(i); }
      if (b.jail && !p.jail) { this.hud.toast(`${p.name} bebas dari Lapas`, 'good'); this.avatars.cheer(i); }
      if (!b.out && p.out) { this.hud.toast(`${p.name} bangkrut`, 'bad'); sounds.playHazard(); }
    });
    if (moneyEvents) await wait(700);
    if (s.phase === 'over') {
      sounds.playWin();
      const wi = s.players.findIndex((p) => p.id === s.winnerId);
      if (wi >= 0) { this.effects.confetti(pawnPos(wi).add(new THREE.Vector3(0, 3, 0)), 90); this.avatars.cheer(wi); }
    }
  }

  afterSync(before, activeIdx) {
    const s = this.state;
    if (s.turn !== before.turn && s.phase !== 'over') {
      this.hud.toast(`Giliran: ${s.players[s.turn].name}`);
      this.hud.hideDice();
      const pos = this.avatars.position(s.turn);
      if (pos) {
        const far = pos.distanceTo(this.cameraCtl.followPos);
        if (far > 18 && (this.cameraCtl.mode === 'follow' || this.cameraCtl.mode === 'iso')) {
          this.cameraCtl.followPos.copy(pos).y += 2;
          this.cameraCtl.followYaw = this.roadYaw(this.avatars.pawns[s.turn]);
          this.cameraCtl.flyTo(this.cameraCtl.presetOffset(this.cameraCtl.mode, this.cameraCtl.followPos), 1.2);
        }
      }
    }
  }

  syncAll(animate) {
    const s = this.state;
    this.avatars.sync(s, s.turn);
    this.buildings.update(s, animate);
    for (let i = 0; i < 45; i++) {
      const o = s.owners[i];
      const hex = o === undefined ? null : o === 'state' ? '#64748b' : PLAYER_COLORS[Number(o) % PLAYER_COLORS.length].hex;
      this.markers.setOwner(i, hex);
    }
    this.hud.update(s);
  }

  // ------------------------------------------------------------ interaksi 3D
  initInteraction() {
    const dom = this.renderer.domElement;
    this.raycaster = new THREE.Raycaster(); this.mouse = new THREE.Vector2();
    let down = null, infoTimer = null;
    const pick = (e) => {
      const r = dom.getBoundingClientRect();
      this.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hit = this.raycaster.intersectObjects(this.markers.pickables, false)[0];
      return hit ? hit.object.userData.index : -1;
    };
    dom.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || e.buttons) return;
      const i = pick(e);
      this.markers.setHovered(i);
      dom.style.cursor = i >= 0 ? 'pointer' : 'grab';
      if (i >= 0) this.hud.showTileInfo(i, this.state); else if (!infoTimer) this.hud.hideTileInfo();
    });
    dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; sounds.init(); });
    dom.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
      down = null;
      if (moved > 7 || dt > 450 || e.button > 0) return;
      const i = pick(e);
      if (i < 0) { this.hud.hideTileInfo(); return; }
      sounds.playClick();
      this.hud.showTileInfo(i, this.state);
      const t = world.tiles[i];
      this.cameraCtl.focusOn(new THREE.Vector3(t.x, t.y + 1, t.z), 24);
      clearTimeout(infoTimer); infoTimer = setTimeout(() => { infoTimer = null; this.hud.hideTileInfo(); }, 6000);
    });
    dom.addEventListener('pointerleave', () => { this.markers.setHovered(-1); });
    addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      const map = { '1': 'follow', '2': 'iso', '3': 'overview', '4': 'top', '5': 'free' };
      if (map[e.key]) this.cameraCtl.setMode(map[e.key]);
      if ((e.key === ' ' || e.key === 'Enter') && this.state && !this.busy && ['roll', 'jail'].includes(this.state.phase) && document.activeElement === document.body) { e.preventDefault(); this.handleAction('roll'); }
    });
  }

  // ------------------------------------------------------------ loop
  loop(now) {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05 * speedParam, (now - this.last) / 1000); this.last = now;
    this.time += dt;
    // Pantau FPS: turunkan resolusi otomatis bila perangkat kewalahan.
    this.fps.frames++; this.fps.t += dt;
    if (this.fps.t > 3) {
      const fps = this.fps.frames / this.fps.t; this.fps.frames = 0; this.fps.t = 0; this.currentFps = fps;
      if (fps < 28 && this.pixelRatio > 0.8) { this.pixelRatio = Math.max(0.8, this.pixelRatio - 0.25); this.renderer.setPixelRatio(this.pixelRatio); }
    }
    this.terrain.update(this.time);
    this.env.update(dt);
    this.life.update(dt, this.time);
    this.heroes.update(this.time);
    this.avatars.update(dt, this.time, this.camera);
    this.buildings.tick(dt);
    this.dice.update(dt);
    this.effects.update(dt);
    if (this.state) {
      const p = this.avatars.pawns[this.state.turn];
      if (p && p.root.visible) {
        this.cameraCtl.followPos.set(p.root.position.x, p.root.position.y + 2, p.root.position.z);
        this.cameraCtl.followYaw = p.walk ? p.yaw : null;
      }
    }
    this.cameraCtl.update(dt);
    this.markers.update(this.camera, this.time, this.state ? this.avatars.pawns[this.state.turn]?.tile : -1);
    this.env.followShadow(this.cameraCtl.controls.target);
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => { window.__warga62 = new Warga62App(); });
