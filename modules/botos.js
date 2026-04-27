import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';


function createBotoGLTF(url) {
  const group = new THREE.Group();
  const loader = new GLTFLoader();

  loader.load(url, (gltf) => {
    const model = gltf.scene;

    // escala (ajusta se ficar gigante ou minúsculo)
    model.scale.set(0.02, 0.02, 0.02);
    model.rotation.y = -Math.PI / 2;

    // deixa rosa 🩷
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set(0xff6fa5);
      }
    });

    group.add(model);
  });

  return group;
}

const boto1 = createBotoGLTF('../models/scene.gltf');
boto1.position.set(0, 0.3, 5);

const boto2 = createBotoGLTF('../models/scene.gltf');
boto2.position.set(-5, 0.3, 8);

export { boto1, boto2 };