import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { sun } from './environment.js';


const scene = new THREE.Scene();

const waterGeometry = new THREE.PlaneGeometry( 1000, 1000 );

let water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      'textures/waternormals.jpg',
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),

    sunDirection: sun.position.clone().normalize(),
    sunColor: "#848b14",

    waterColor: new THREE.Color('#3a1111'),

    distortionScale: 1.0,
    fog: scene.fog !== undefined
  }
);

water.rotation.x = -Math.PI / 2;

// funda da água
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({
    color: 0x0a0a0a
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;

export { water, floor };