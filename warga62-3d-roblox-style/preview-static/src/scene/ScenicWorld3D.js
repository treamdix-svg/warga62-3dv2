import * as THREE from 'three';
import { getTile3DPosition } from '../engine/GameBridge.js';

// Hanya VISUAL: seluruh keputusan giliran, uang, dan kartu tetap memakai engine asli.
const rand = (() => { let seed = 62026; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); })();
const mat = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
const materials = {
  grass: mat(0x75ca75), grassLight: mat(0x92db81), grassDark: mat(0x489d68),
  rock: mat(0x9d9f8a), soil: mat(0x80634f), sand: mat(0xebd3a1), water: new THREE.MeshStandardMaterial({ color: 0x43bed1, roughness: 0.27, metalness: 0.1 }),
  tree: mat(0x208f5e), treeLight: mat(0x3fbf78), treeDark: mat(0x167f66),
  trunk: mat(0x79563a), roof: mat(0xe67b61), pale: mat(0xfaf0d3)
};
const point = (r, a, y=0) => new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a));
const smooth = (v) => Math.sin(v * 0.19) * 1.8 + Math.cos(v * 0.37) * 1.05;

export class ScenicWorld3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.createIsland();
    this.createMountains();
    this.createForest();
    this.createVillage();
    this.createClouds();
  }
  add(geometry, material, x, y, z, parent=this.group) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x,y,z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  createIsland() {
    // PULAU ORGANIK, BUKAN ALAS PERSEGI / POLIGON PAPAN
    const count=96, top=[], cliff=[], indices=[], colors=[];
    const radii=[];
    for(let i=0;i<count;i++) {
      const a=i/count*Math.PI*2;
      radii.push(38.8 + 2.6*Math.sin(a*5+0.9) + 1.2*Math.sin(a*11-0.2) + 0.65*Math.cos(a*19));
    }
    const vertices = [0,0.03,0];
    for(let i=0;i<count;i++) {
      const a=i/count*Math.PI*2;
      vertices.push(Math.cos(a)*radii[i],0.04 + 0.22*Math.cos(a*8),Math.sin(a)*radii[i]);
    }
    for(let i=0;i<count;i++) indices.push(0,(i+1)%count+1,i+1);
    const grassGeo=new THREE.BufferGeometry();
    grassGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    grassGeo.setIndex(indices);
    grassGeo.computeVertexNormals();
    const ground = this.add(grassGeo,materials.grass,0,0,0);
    ground.castShadow=false;
    // Tepi tebing yang tidak seragam, tanah alami setinggi 5 unit.
    const sideVertices=[], sideIndices=[];
    for(let i=0;i<count;i++) {
      const a=i/count*Math.PI*2;const radius=radii[i];
      sideVertices.push(radius*Math.cos(a),0.02,radius*Math.sin(a),
        (radius-0.4)*Math.cos(a),-3.2-1.0*Math.sin(a*9), (radius-0.4)*Math.sin(a));
      const j=i*2,k=((i+1)%count)*2;
      sideIndices.push(j,k,j+1,k,k+1,j+1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(sideVertices,3));geo.setIndex(sideIndices);geo.computeVertexNormals();
    const cliffMesh=this.add(geo, materials.soil,0,0,0);cliffMesh.castShadow=false;
    // Air laut di bawah tebing: pemandangan terbuka, bukan meja papan.
    const ocean=this.add(new THREE.PlaneGeometry(450,450),materials.water,0,-4.25,0);
    ocean.rotation.x=-Math.PI/2;ocean.castShadow=false;ocean.receiveShadow=false;
    // Pulau-pulau kecil di sekitar daratan utama.
    for(let i=0;i<9;i++) {
      const a=i/9*Math.PI*2+0.12, r=49+rand()*17;
      const island=this.add(new THREE.IcosahedronGeometry(2.4+rand()*3,1),materials.grassDark,Math.cos(a)*r,-3.7,Math.sin(a)*r);
      island.scale.y=0.32;island.rotation.y=a;
    }
  }
  createMountains() {
    // Pegunungan di tepi luar agar tidak menutup 45 checkpoint.
    const peaks=[[-29,-17,7],[-31,10,11],[-20,28,8],[3,-35,7],[30,-21,9],[35,12,8],[15,33,9],[-6,34,8]];
    peaks.forEach(([x,z,h],i)=>{
      const radius=3.5+(i%3)*1.3;
      const mountain=this.add(new THREE.ConeGeometry(radius,h,5), i%3===0?materials.rock:materials.grassDark,x,h/2-0.12,z);
      mountain.rotation.y=i*0.81;
      const cap=this.add(new THREE.ConeGeometry(radius*.37,h*.22,5),mat(0xe8eff2),x,h*.88,z);
      cap.rotation.y=i*0.81;
      // Bukit hijau di bawah gunung
      const hill=this.add(new THREE.IcosahedronGeometry(radius*1.5,1), materials.grassLight,x,-0.2,z);
      hill.scale.y=.20;
    });
  }
  createForest() {
    const spots=[];
    for(let i=0;i<280;i++) {
      const a=rand()*Math.PI*2;
      const r=7+Math.sqrt(rand())*29;
      const x=Math.cos(a)*r,z=Math.sin(a)*r;
      if(r>18 && r<28.5)continue; // Tidak mengganggu jalan dan petak
      if(r<14 && Math.abs(x)<9 && Math.abs(z)<9)continue; // Kota
      if (this.nearCheckpoint(x,z,3.1))continue;
      spots.push({x,z,s:0.6+rand()*0.65,h:rand()});
    }
    const trunkGeo=new THREE.CylinderGeometry(.14,.23,1,5);
    const canopyGeo=new THREE.ConeGeometry(.82,2.2,6);
    const trunks=new THREE.InstancedMesh(trunkGeo,materials.trunk,spots.length);
    const leafA=new THREE.InstancedMesh(canopyGeo,materials.tree,spots.length);
    const leafB=new THREE.InstancedMesh(canopyGeo,materials.treeLight,spots.length);
    const obj=new THREE.Object3D();
    spots.forEach((p,i)=>{
      obj.position.set(p.x,.52*p.s,p.z);obj.scale.setScalar(p.s);obj.rotation.y=p.h*6.28;obj.updateMatrix();trunks.setMatrixAt(i,obj.matrix);
      obj.position.y=1.65*p.s;obj.updateMatrix();leafA.setMatrixAt(i,obj.matrix);
      obj.position.y=2.15*p.s;obj.scale.setScalar(p.s*.7);obj.updateMatrix();leafB.setMatrixAt(i,obj.matrix);
    });
    for(const m of [trunks,leafA,leafB]) {m.instanceMatrix.needsUpdate=true;m.castShadow=true;this.group.add(m);}
    // Batu-batu dan semak menghias area jauh dari petak.
    const stones=[];
    for(let i=0;i<110;i++){
      const a=rand()*6.28,r=10+rand()*25,x=Math.cos(a)*r,z=Math.sin(a)*r;
      if(r>18&&r<29) continue;
      stones.push({x,z,s:.3+rand()*.7});
    }
    const rockMesh=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.7,0),materials.rock,stones.length);
    stones.forEach((p,i)=>{obj.position.set(p.x,.12,p.z);obj.rotation.set(0,rand()*6.28,0);obj.scale.set(p.s,.38*p.s,p.s);obj.updateMatrix();rockMesh.setMatrixAt(i,obj.matrix);});
    rockMesh.instanceMatrix.needsUpdate=true;rockMesh.castShadow=true;this.group.add(rockMesh);
  }
  nearCheckpoint(x,z,dist) {
    for(let i=0;i<45;i++){const p=getTile3DPosition(i);if(Math.hypot(p.x-x,p.z-z)<dist)return true;}
    return false;
  }
  createVillage() {
    // Permukiman dengan jalan, toko, rumah, menara, taman; tidak memakai alas pentagon.
    const roads=materials.soil;
    for(let i=-2;i<=2;i++){
      const road1=this.add(new THREE.BoxGeometry(25,.08,.9),mat(0xe1c9a0),0,.08,i*4.3);
      const road2=this.add(new THREE.BoxGeometry(.9,.08,25),mat(0xe1c9a0),i*4.3,.09,0);
      road1.castShadow=false;road2.castShadow=false;
    }
    const sites=[[-9,-8],[-5.5,-8],[-1.5,-8],[2.6,-8],[7,-8],
      [-9,-4.7],[-5.5,-4.7],[6.9,-4.7],[9.7,-3],
      [-9,3.7],[-5.5,3.7],[6.9,3.7],[10.2,4.2],
      [-9,8],[-5.5,8],[-1.4,8],[2.6,8],[6.9,8]];
    sites.forEach(([x,z],i)=>this.makeHouse(x,z,i));
    this.makeLandmark(0,0);
    // Taman dan plaza kota
    for(let i=0;i<10;i++){
      const a=i/10*Math.PI*2,r=11.5;
      if(this.nearCheckpoint(r*Math.cos(a),r*Math.sin(a),3))continue;
      this.makeTree(r*Math.cos(a),r*Math.sin(a),.75);
    }
    this.createLake(12,-8);
  }
  makeHouse(x,z,i) {
    const walls=[0xfcd8a6,0xf7b1a1,0xa5d7f2,0xc8eab3,0xefc5df,0xffe1a8];
    const wall=mat(walls[i%walls.length]);
    const tall=i%7===0;
    const w=tall?2.15:1.85,h=tall?4.1:2.1;
    this.add(new THREE.BoxGeometry(w,h,1.9),wall,x,h/2+.12,z);
    if(tall){
      this.add(new THREE.BoxGeometry(w+.22,.18,2.1),mat(0x385d7a),x,h+.25,z);
    }else{
      const roof=this.add(new THREE.ConeGeometry(1.65,.97,4),mat([0xdb6954,0xc76a78,0x30836a][i%3]),x,h+.62,z);
      roof.rotation.y=Math.PI/4;
    }
    for(let floor=0;floor<(tall?3:1);floor++)for(let t=-1;t<=1;t+=2){
      this.add(new THREE.BoxGeometry(.35,.42,.07),mat(0x375e79,.3),x+t*.46,1.15+floor*1.02,z+1.0);
    }
    const door=this.add(new THREE.BoxGeometry(.45,.8,.10),mat(0x74523b),x,.52,z+1.01);
    door.castShadow=false;
    if(i%3===0)this.makeTree(x+1.5,z+1.2,.48);
  }
  makeLandmark(x,z) {
    // Balai kota yang lebih detail daripada kubus polos.
    const cream=mat(0xffecc4),terra=mat(0xde8153),glass=mat(0x48b7c8,.3);
    this.add(new THREE.CylinderGeometry(3.2,3.5,.5,8),mat(0xe0b878),x,.32,z);
    this.add(new THREE.BoxGeometry(4.1,2.5,3.8),cream,x,1.6,z);
    this.add(new THREE.BoxGeometry(3.4,2.9,3.1),terra,x,4.25,z);
    this.add(new THREE.BoxGeometry(2.8,1.3,2.7),cream,x,6.35,z);
    const top=this.add(new THREE.ConeGeometry(2.0,2.9,4),mat(0x22927e),x,8.4,z);
    top.rotation.y=Math.PI/4;
    for(let i=-1;i<=1;i+=2){
      for(let level=1;level<=3;level++){
        this.add(new THREE.BoxGeometry(.52,.7,.1),glass,x+i*1.0,level*1.6,z+1.98);
      }
    }
    // Bendera merah putih (identitas Nusantara)
    this.add(new THREE.CylinderGeometry(.045,.045,3.2,8),materials.pale,x+2.8,2.2,z);
    this.add(new THREE.BoxGeometry(1.2,.34,.07),mat(0xe84b50),x+3.42,3.6,z);
    this.add(new THREE.BoxGeometry(1.2,.34,.07),mat(0xffffff),x+3.42,3.26,z);
  }
  makeTree(x,z,s=1) {
    this.add(new THREE.CylinderGeometry(.14*s,.22*s,1.0*s,6),materials.trunk,x,.6*s,z);
    this.add(new THREE.ConeGeometry(.9*s,2*s,6),materials.treeLight,x,1.9*s,z);
  }
  createLake(x,z) {
    const lake=this.add(new THREE.CylinderGeometry(3.0,3.4,.12,20),materials.water,x,.08,z);
    lake.scale.z=.63;
    for(let i=0;i<5;i++){
      const a=i*1.2;
      this.add(new THREE.DodecahedronGeometry(.45,0),materials.rock,x+Math.cos(a)*2.9,.21,z+Math.sin(a)*1.6);
    }
  }
  createClouds(){
    const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.8});
    const locations=[[-25,24,18],[17,-29,16],[-30,-23,22],[31,21,19]];
    locations.forEach(([x,z,y],i)=>{
      const group=new THREE.Group();group.position.set(x,y,z);
      for(let p=0;p<4;p++) {
        const c=this.add(new THREE.IcosahedronGeometry(1.8+(p%2)*.8,1),cloudMat,(p-1.5)*2.0,Math.sin(p*2)*.4,0,group);
        c.scale.y=.55;c.castShadow=false;
      }
      this.group.add(group);
    });
  }
}
