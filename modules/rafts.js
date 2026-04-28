import * as THREE from 'three';

function createRaft() {
  const raft = new THREE.Group();

  const logCount = 6;
  const logRadius = 0.25;
  const logLength = 4.5;
  const spacing = 0.45;

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.9,
    metalness: 0.05
  });

  // toras principais
  for (let i = 0; i < logCount; i++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(logRadius, logRadius, logLength, 12),
      woodMat
    );

    log.rotation.z = Math.PI / 2;

    log.position.set(
      0,
      0,
      (i - (logCount - 1) / 2) * spacing
    );

    log.castShadow = true;
    log.receiveShadow = true;

    raft.add(log);
  }

  // travessas (pra dar aquele estilo amarrado)
  const crossMat = new THREE.MeshStandardMaterial({
    color: 0x5c3b1e,
    roughness: 1
  });

  for (let i = -1; i <= 1; i += 2) {
    const cross = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, logCount * spacing + 0.5),
      crossMat
    );

    cross.position.set(i * 1.6, 0.1, 0);

    raft.add(cross);
  }

  return raft;
}

const raft1 = createRaft();
raft1.position.set(-6, 0, 2.2);
raft1.rotation.y = Math.PI;

const raft2 = createRaft();
raft2.position.set(-6, 0, 5.6);
raft2.rotation.y = Math.PI;

export { raft1, raft2 };