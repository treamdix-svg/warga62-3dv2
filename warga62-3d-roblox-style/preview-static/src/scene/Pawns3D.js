import * as THREE from 'three';
import { getTile3DPosition, PLAYER_COLORS, formatRupiah } from '../engine/GameBridge.js';
import { sounds } from '../audio/AudioEffects.js';

export class Pawns3D {
  constructor(scene) {
    this.scene = scene;
    this.pawnsGroup = new THREE.Group();
    this.scene.add(this.pawnsGroup);

    this.pawnObjects = [];
    this.activeIndicator = null;
    this.createActiveIndicator();
  }

  createActiveIndicator() {
    // Cincin emas bercahaya di bawah pion aktif
    const ringGeo = new THREE.RingGeometry(0.75, 1.05, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    this.activeIndicator = new THREE.Mesh(ringGeo, ringMat);
    this.activeIndicator.rotation.x = -Math.PI / 2;
    this.activeIndicator.position.y = 0.62;
    this.activeIndicator.visible = false;
    this.scene.add(this.activeIndicator);
  }

  // Avatar berbentuk warga chibi/blocky, bukan pion metalik.
  initPawns(players) {
    while (this.pawnsGroup.children.length) this.pawnsGroup.remove(this.pawnsGroup.children[0]);
    this.pawnObjects = [];
    const skin = new THREE.MeshStandardMaterial({ color: 0xffc89d, roughness: .85 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0x283c56, roughness: .9 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x252f3b, roughness: .9 });
    players.forEach((player,idx)=>{
      const color=PLAYER_COLORS[idx%PLAYER_COLORS.length];
      const shirt=new THREE.MeshStandardMaterial({color:color.color,roughness:.82});
      const pawnGroup=new THREE.Group();
      const part=(geometry,material,x,y,z)=>{
        const mesh=new THREE.Mesh(geometry,material);
        mesh.position.set(x,y,z);mesh.castShadow=true;pawnGroup.add(mesh);return mesh;
      };
      // Sepatu, celana, tubuh, tangan, kepala: proporsi karakter game Roblox.
      part(new THREE.BoxGeometry(.32,.45,.42),shoe,-.22,.40,0);
      part(new THREE.BoxGeometry(.32,.45,.42),shoe,.22,.40,0);
      part(new THREE.BoxGeometry(.92,.88,.57),shirt,0,1.06,0);
      part(new THREE.BoxGeometry(.27,.82,.32),skin,-.62,1.12,0);
      part(new THREE.BoxGeometry(.27,.82,.32),skin,.62,1.12,0);
      part(new THREE.BoxGeometry(.73,.73,.67),skin,0,1.87,0);
      const eyes=new THREE.MeshStandardMaterial({color:0x172433,roughness:.8});
      for(const x of [-.15,.15])part(new THREE.BoxGeometry(.055,.065,.027),eyes,x,1.95,.346);
      if(idx%2===0){
        part(new THREE.BoxGeometry(.76,.18,.76),hatMat,0,2.31,0);
        part(new THREE.BoxGeometry(.64,.19,.64),hatMat,0,2.48,-.03);
      }else{
        const hair=new THREE.Mesh(new THREE.SphereGeometry(.44,8,5,0,6.28,0,Math.PI/2),hatMat);
        hair.position.set(0,2.23,0);pawnGroup.add(hair);
      }
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.65,.7,.09,16),
        new THREE.MeshStandardMaterial({color:color.color,roughness:.5}));
      base.position.y=.16;pawnGroup.add(base);
      const label=this.createPawnLabel(player.name,player.money,color.hex);
      label.position.y=3.15;
      pawnGroup.add(label);
      this.pawnsGroup.add(pawnGroup);
      this.pawnObjects.push({id:player.id,name:player.name,color:color.color,group:pawnGroup,
        labelSprite:label,tileIndex:player.pos||0,animating:false});
    });
    this.repositionAllPawns();
  }

  createPawnLabel(name, money, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Box rounded glassmorphism
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 6;
    this.roundRect(ctx, 6, 6, 372, 116, 24, true, true);

    // Nama Pemain
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(name, 192, 45);

    // Saldo Rupiah Hijau
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(formatRupiah(money), 192, 88);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.8, 1);
    return sprite;
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Hitung sebaran agar pion di petak yang sama tidak tumpeng-tindih
  repositionAllPawns() {
    const tileOccupancy = {};
    this.pawnObjects.forEach(pawn => {
      const idx = pawn.tileIndex;
      if (!tileOccupancy[idx]) tileOccupancy[idx] = [];
      tileOccupancy[idx].push(pawn);
    });

    Object.entries(tileOccupancy).forEach(([tIdx, occupants]) => {
      const pos = getTile3DPosition(Number(tIdx), 0.48);
      const count = occupants.length;

      occupants.forEach((pawn, i) => {
        if (pawn.animating) return;

        let ox = 0, oz = 0;
        if (count > 1) {
          const angle = (i / count) * Math.PI * 2;
          const radius = Math.min(0.85, 0.35 + count * 0.12);
          ox = Math.cos(angle) * radius;
          oz = Math.sin(angle) * radius;
        }

        pawn.group.position.set(pos.x + ox, pos.y, pos.z + oz);
      });
    });
  }

  // Animasi loncat busur parabolik dari petak ke petak
  animateMove(playerIndex, fromTile, toTile, onComplete) {
    const pawn = this.pawnObjects[playerIndex];
    if (!pawn) {
      if (onComplete) onComplete();
      return;
    }

    const steps = [];
    let cur = fromTile;
    while (cur !== toTile) {
      cur = (cur + 1) % 45;
      steps.push(cur);
    }

    pawn.animating = true;
    let stepIndex = 0;

    const hopToNext = () => {
      if (stepIndex >= steps.length) {
        pawn.tileIndex = toTile;
        pawn.animating = false;
        this.repositionAllPawns();
        if (onComplete) onComplete();
        return;
      }

      const targetTile = steps[stepIndex];
      const startPos = pawn.group.position.clone();
      const endPosData = getTile3DPosition(targetTile, 0.48);
      const endPos = new THREE.Vector3(endPosData.x, endPosData.y, endPosData.z);

      sounds.playPawnHop();

      const startTime = performance.now();
      const duration = 210; // 210ms per langkah loncat

      const updateHop = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        pawn.group.position.lerpVectors(startPos, endPos, progress);

        // Ketinggian loncatan busur
        const jumpHeight = 1.35;
        pawn.group.position.y = startPos.y + Math.sin(progress * Math.PI) * jumpHeight;

        if (progress < 1) {
          requestAnimationFrame(updateHop);
        } else {
          pawn.tileIndex = targetTile;
          stepIndex++;
          hopToNext();
        }
      };

      requestAnimationFrame(updateHop);
    };

    hopToNext();
  }

  update(state, activePlayerIndex) {
    state.players.forEach((p, idx) => {
      const pawn = this.pawnObjects[idx];
      if (pawn && !pawn.animating && pawn.tileIndex !== p.pos) {
        pawn.tileIndex = p.pos;
      }
    });

    this.repositionAllPawns();

    const activePawn = this.pawnObjects[activePlayerIndex];
    if (activePawn && activePawn.group) {
      this.activeIndicator.visible = true;
      this.activeIndicator.position.x = activePawn.group.position.x;
      this.activeIndicator.position.z = activePawn.group.position.z;
      this.activeIndicator.rotation.z += 0.03;
    } else {
      this.activeIndicator.visible = false;
    }
  }
}
