import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';


/*
  Arvores
*/
export function createTree() {
  const tree = new THREE.Group();

  // TRONCO
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3e2b })
  );
  trunk.position.y = 2;
  trunk.castShadow = true;
  tree.add(trunk);

  // COPA (folhas)
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x1f7a3a })
  );
  leaves.position.y = 5;
  leaves.castShadow = true;
  tree.add(leaves);

  return tree;
}

