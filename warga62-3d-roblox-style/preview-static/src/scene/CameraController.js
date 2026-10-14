import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
  constructor(camera, domElement){
    this.camera=camera;
    this.controls=new OrbitControls(camera,domElement);
    this.controls.enableDamping=true;
    this.controls.dampingFactor=.07;
    this.controls.minDistance=9;
    this.controls.maxDistance=195;
    this.controls.maxPolarAngle=Math.PI*.49;
    this.controls.enablePan=true;
    this.controls.screenSpacePanning=true;
    this.defaultPos=new THREE.Vector3(44,68,86);
    this.defaultTarget=new THREE.Vector3(0,0,0);
    this.targetPos=this.defaultPos.clone();
    this.targetLookAt=this.defaultTarget.clone();
    this.camera.position.copy(this.defaultPos);
    this.controls.target.copy(this.defaultTarget);
    this.isTransitioning=false;
    this.fitScreen();
  }
  fitScreen(){
    const aspect=window.innerWidth/window.innerHeight;
    const factor=aspect<.85?1.78:aspect<1.25?1.32:1;
    this.defaultPos.set(44*factor,68*factor,86*factor);
    if(!this.isTransitioning){
      this.camera.position.copy(this.defaultPos);
      this.controls.target.copy(this.defaultTarget);
    }
  }
  setIsometric(){this.targetPos.copy(this.defaultPos);this.targetLookAt.set(0,0,0);this.isTransitioning=true;}
  setTopDown(){this.targetPos.set(0,Math.max(95,this.defaultPos.length()*.95),.1);this.targetLookAt.set(0,0,0);this.isTransitioning=true;}
  focusOn(position,offset={x:0,y:19,z:20}){
    this.targetLookAt.set(position.x,position.y+.6,position.z);
    this.targetPos.set(position.x+offset.x,position.y+offset.y,position.z+offset.z);
    this.isTransitioning=true;
  }
  resetOverview(){this.targetPos.copy(this.defaultPos);this.targetLookAt.copy(this.defaultTarget);this.isTransitioning=true;}
  update(){
    if(this.isTransitioning){
      this.camera.position.lerp(this.targetPos,.09);
      this.controls.target.lerp(this.targetLookAt,.09);
      if(this.camera.position.distanceTo(this.targetPos)<.12&&this.controls.target.distanceTo(this.targetLookAt)<.12){
        this.camera.position.copy(this.targetPos);this.controls.target.copy(this.targetLookAt);this.isTransitioning=false;
      }
    }
    this.controls.update();
  }
}
