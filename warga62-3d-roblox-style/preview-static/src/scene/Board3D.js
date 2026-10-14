import * as THREE from 'three';
import { engine, getTile3DPosition, ISLAND_CONFIG, CORNER_CONFIG, PLAYER_COLORS, formatRupiah } from '../engine/GameBridge.js';
import { ScenicWorld3D } from './ScenicWorld3D.js';

// Dunia bergaya Roblox / simulator low-poly. Setiap checkpoint tetap sesuai indeks 0..44
// pada mesin permainan asli, hanya bentuk visual petaknya yang diubah.
const mat = (color, metalness=0) => new THREE.MeshStandardMaterial({color,roughness:.68,metalness});
const random = (()=>{let s=31062; return ()=> ((s=s*1664525+1013904223>>>0)/4294967296)})();

export class Board3D {
  constructor(scene) {
    this.scene=scene;
    this.tileMeshes=[];
    this.tileGroup=new THREE.Group();scene.add(this.tileGroup);
    this.ownerIndicators={};this.roadMeshes={};this.animated=[];
    this.world=new ScenicWorld3D(scene);
    this.createNatureTrail();
    this.createTiles();
    this.createTrailDecor();
  }
  createNatureTrail(){
    const pts=[];
    for(let i=0;i<45;i++) {
      const p=getTile3DPosition(i);
      const dir=Math.atan2(p.z,p.x);
      const offset=i%9===0?0.15:0.15*Math.sin(i*2.3);
      pts.push(new THREE.Vector3(p.x+Math.cos(dir)*offset,.105,p.z+Math.sin(dir)*offset));
    }
    const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal',.08);
    // Jejak tanah alami yang berkelok mengikuti urutan 45 petak, tanpa kotak papan.
    const length=420,width=2.75,verts=[],indices=[],uvs=[];
    for(let i=0;i<=length;i++){
      const t=i/length,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();
      const n=new THREE.Vector3(-tan.z,0,tan.x);
      const variation=0.15*Math.sin(t*103)+0.09*Math.cos(t*181);
      for(const side of [-1,1]) {
        const q=p.clone().addScaledVector(n,side*(width*.5+variation));
        verts.push(q.x,.12,q.z);uvs.push(t*60,(side+1)/2);
      }
      if(i<length){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    const trail=new THREE.Mesh(geometry,mat(0xe7cda0));
    trail.receiveShadow=true;trail.material.side=THREE.DoubleSide;
    this.tileGroup.add(trail);
    // Batu-batu kecil di tepi jalan sebagai pemisah dengan alam.
    const rockMat=mat(0x9eae9f), stoneGeo=new THREE.IcosahedronGeometry(.26,0);
    const count=110;
    const rocks=new THREE.InstancedMesh(stoneGeo,rockMat,count);
    const helper=new THREE.Object3D();
    for(let j=0;j<count;j++){
      const t=j/count,p=curve.getPoint(t),tangent=curve.getTangent(t),normal=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
      const q=p.addScaledVector(normal,(j%2===0?1:-1)*1.75);
      helper.position.set(q.x,.24,q.z);helper.scale.set(.7+random()*.7,.6+random()*.3,.8+random()*.4);
      helper.rotation.y=random()*6.28;helper.updateMatrix();rocks.setMatrixAt(j,helper.matrix);
    }
    rocks.instanceMatrix.needsUpdate=true;rocks.castShadow=true;
    this.tileGroup.add(rocks);
  }
  createTiles(){
    const platformGeo=new THREE.CylinderGeometry(1.26,1.48,.28,10);
    const topGeo=new THREE.CylinderGeometry(1.05,1.05,.065,10);
    const ringGeo=new THREE.TorusGeometry(1.16,.055,7,32);
    const pedestalMat=mat(0x977a52);
    for(let i=0;i<45;i++){
      const data=engine.tiles[i],pos=getTile3DPosition(i,.32);
      const corner=i%9===0;
      const island=ISLAND_CONFIG.find(c=>c.name===data[4]);
      const hex=corner?(CORNER_CONFIG[i]?.color||0xf59e0b):(island?.color||0x3b82f6);
      const group=new THREE.Group();group.position.set(pos.x,0,pos.z);
      this.tileGroup.add(group);
      const base=new THREE.Mesh(platformGeo,pedestalMat);base.position.y=.26;base.castShadow=true;base.receiveShadow=true;group.add(base);
      const top=new THREE.Mesh(topGeo,mat(corner?0xfef3c7:0xe9fff3));top.position.y=.435;top.receiveShadow=true;group.add(top);
      const ring=new THREE.Mesh(ringGeo,mat(hex));ring.rotation.x=Math.PI/2;ring.position.y=.485;group.add(ring);
      const marker=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.07,16),mat(hex));
      marker.position.y=.52;group.add(marker);
      // Satu label kecil per lokasi; karena memakai sprite, teks tidak bergeser ketika kamera diputar.
      const label=this.makeLabel(data[0],i,hex,corner);
      label.position.y=corner?2.50:2.05;
      label.visible=corner || i%2===1; // menjaga kepadatan label, semua lokasi tetap bisa diklik
      group.add(label);
      if(corner){
        const post=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,1.1,8),mat(0x835632));
        post.position.set(0,1.05,0);group.add(post);
        const flag=new THREE.Mesh(new THREE.BoxGeometry(.8,.43,.06),mat(hex));
        flag.position.set(.43,1.57,0);group.add(flag);
      }
      base.userData={index:i,name:data[0],type:data[1],price:data[2],island:data[4],baseY:base.position.y,group};
      this.tileMeshes.push(base);
      this.ownerIndicators[i]=ring;
    }
  }
  makeLabel(name,index,hex,corner){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=164;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(18,42,55,0.94)';ctx.beginPath();ctx.roundRect(5,5,502,152,35);ctx.fill();
    ctx.strokeStyle='#'+hex.toString(16).padStart(6,'0');ctx.lineWidth=9;ctx.stroke();
    ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.textAlign='left';
    ctx.font='bold 36px system-ui';ctx.fillText(String(index).padStart(2,'0'),23,80);
    ctx.fillStyle='#e2f8f7';ctx.font=`bold ${name.length>16?29:36}px system-ui`;
    ctx.fillText(name,104,80,385);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true}));
    sprite.scale.set(corner?3.35:2.9,corner?1.08:.91,1);
    return sprite;
  }
  createTrailDecor(){
    // Landmark tematik pulau, cukup dekat dengan lintasan untuk membantu orientasi.
    const colors=[0xf87171,0xfacc15,0x34d399,0x38bdf8,0xc084fc];
    for(let k=0;k<5;k++){
      const tile=getTile3DPosition(k*9+5),len=Math.hypot(tile.x,tile.z)||1;
      const dirX=tile.x/len,dirZ=tile.z/len;
      const x=tile.x+dirX*5.1,z=tile.z+dirZ*5.1;
      const base=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.3,.6,8),mat(0xf2e2bc));
      base.position.set(x,.35,z);base.castShadow=true;this.tileGroup.add(base);
      const tower=new THREE.Mesh(new THREE.CylinderGeometry(.38,.54,3,6),mat(colors[k]));
      tower.position.set(x,2.05,z);tower.castShadow=true;this.tileGroup.add(tower);
      const hat=new THREE.Mesh(new THREE.ConeGeometry(.86,1.1,6),mat(0x28547a));
      hat.position.set(x,4.05,z);hat.castShadow=true;this.tileGroup.add(hat);
    }
  }
  updateAnimation(){ /* Jalan tetap statis agar game ringan dan tombol tetap responsif. */ }
  updateState(state){
    for(let i=0;i<45;i++) {
      const owner=state.owners?.[i], ring=this.ownerIndicators[i];
      if(ring){
        if(owner!==undefined && owner!==null && owner!=='state'){
          const idx=Number(owner);if(Number.isFinite(idx))ring.material.color.setHex(PLAYER_COLORS[idx%PLAYER_COLORS.length].color);
        } else if(owner==='state'){ring.material.color.setHex(0x64748b);}
        else {
          const island=ISLAND_CONFIG.find(c=>c.name===engine.tiles[i][4]);
          ring.material.color.setHex(i%9===0?(CORNER_CONFIG[i]?.color||0xf59e0b):(island?.color||0x3b82f6));
        }
      }
      if(state.roads?.[i]&&!this.roadMeshes[i])this.addRoadVisual(i);
    }
  }
  addRoadVisual(index){
    const mesh=this.tileMeshes[index];if(!mesh)return;
    const g=mesh.userData.group;
    const road=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.1,12),mat(0xfbbf24));road.position.set(.8,.58,0);
    g.add(road);this.roadMeshes[index]=road;
  }
  highlightTile(index,on=true){
    const mesh=this.tileMeshes[index];if(!mesh)return;
    mesh.userData.group.scale.setScalar(on?1.16:1);
    for(const child of mesh.userData.group.children){if(child.isSprite && index%9!==0)child.visible=on || index%2===1;}
  }
}
