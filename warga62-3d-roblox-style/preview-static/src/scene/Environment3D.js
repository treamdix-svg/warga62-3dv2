import * as THREE from 'three';

// Atmosfer cerah seperti simulator 3D, bukan studio / meja permainan.
export class Environment3D {
  constructor(scene) {
    this.scene = scene;
    scene.background = new THREE.Color(0x9edff2);
    scene.fog = new THREE.FogExp2(0xb2e4ee, 0.0027);
    scene.add(new THREE.HemisphereLight(0xf4fcff,0x66a182,2.35));
    const sun=new THREE.DirectionalLight(0xfff6d7,2.45);
    sun.position.set(-26,65,36);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    const edge=50;
    sun.shadow.camera.left=-edge;sun.shadow.camera.right=edge;
    sun.shadow.camera.top=edge;sun.shadow.camera.bottom=-edge;
    sun.shadow.camera.near=1;sun.shadow.camera.far=160;
    sun.shadow.bias=-0.0003;
    scene.add(sun);
    const fill=new THREE.DirectionalLight(0xd5f2ff,.5);
    fill.position.set(38,20,-28);scene.add(fill);
  }
}
