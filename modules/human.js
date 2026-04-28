import * as THREE from 'three';

export function createHuman() {
  const human = new THREE.Group();

  // materiais
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });

  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xff6fa5,
    roughness: 0.6
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf1c27d
  });

  /*
    CORPO
  */
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.2, 0.35),
    whiteMat
  );
  body.position.y = 0.9;
  human.add(body);

  /*
    CABEÇA
  */
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    skinMat
  );
  head.position.y = 1.8;
  human.add(head);

  /*
    PERNAS
  */
  const legGeo = new THREE.BoxGeometry(0.18, 0.9, 0.18);

  const legLeft = new THREE.Mesh(legGeo, whiteMat);
  legLeft.position.set(-0.14, 0.4, 0);
  human.add(legLeft);

  const legRight = new THREE.Mesh(legGeo, whiteMat);
  legRight.position.set(0.14, 0.4, 0);
  human.add(legRight);

  /*
    BRAÇOS
  */
  const armGeo = new THREE.BoxGeometry(0.16, 0.8, 0.16);

  const armLeft = new THREE.Mesh(armGeo, whiteMat);
  armLeft.position.set(-0.45, 1.05, 0);
  human.add(armLeft);

  const armRight = new THREE.Mesh(armGeo, whiteMat);
  armRight.position.set(0.45, 1.05, 0);
  human.add(armRight);

  /*
    CHAPÉU
  */
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.05, 20),
    whiteMat
  );
  hatBrim.position.y = 2.05;
  human.add(hatBrim);

  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.25, 0.3, 20),
    whiteMat
  );
  hatTop.position.y = 2.2;
  human.add(hatTop);

  const hatBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.255, 0.255, 0.08, 20),
    pinkMat
  );
  hatBand.position.y = 2.15;
  human.add(hatBand);

  /*
    DETALHE PEITO
  */
  const chestDetail = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.02),
    pinkMat
  );
  chestDetail.position.set(0.15, 1.1, 0.18);
  human.add(chestDetail);

  human.scale.set(1.8, 1.8, 1.8);

  return {
    human,
    armLeft,
    armRight
  };
}