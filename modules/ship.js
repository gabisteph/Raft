import * as THREE from 'three';

export function createShip() {
  const ship = new THREE.Group();

  const boatLength = 16.6;
  const boatWidth = 5.2;
  const hullHeight = 3.3;
  const wallThickness = 0.1;
  const rimHeight = 0.5;
  const rimThickness = 0.18;
  const floorThickness = 0.18;

  /*
    CORES BASEADAS NA FOTO:
    - casco externo branco
    - borda superior roxo/azulado
    - fundo interno preto
  */
  const hullColor = 0xffffff;     // branco externo
  const rimColor = 0x6a0dad;
  const innerColor = 0x111111;    // preto interno
  const lineColor = 0x2a2a2a;     // detalhes escuros

  const innerLength = boatLength - 2 * wallThickness;
  const innerWidth = boatWidth - 2 * wallThickness;

  const deckHeight = hullHeight + floorThickness - 0.28;

  /*
    MATERIAIS
  */
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: hullColor,
    roughness: 0.7,
    metalness: 0.03
  });

  const innerMaterial = new THREE.MeshStandardMaterial({
    color: innerColor,
    roughness: 0.9,
    metalness: 0.02
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: rimColor,
    roughness: 0.65,
    metalness: 0.04
  });

  const lineMaterial = new THREE.MeshStandardMaterial({
    color: lineColor,
    roughness: 0.9,
    metalness: 0.0
  });

  const boat = new THREE.Group();

  /*
    FUNDO (PRETO INTERNO)
  */
  const bottom = new THREE.Mesh(
    new THREE.BoxGeometry(boatLength, floorThickness, boatWidth),
    innerMaterial
  );

  bottom.position.y = floorThickness / 2;
  bottom.castShadow = true;
  bottom.receiveShadow = true;
  boat.add(bottom);

  /*
    LATERAIS (BRANCO)
  */
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(boatLength, hullHeight, wallThickness),
    hullMaterial
  );

  leftWall.position.set(
    0,
    hullHeight / 2 + floorThickness,
    boatWidth / 2 - wallThickness / 2
  );

  boat.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(boatLength, hullHeight, wallThickness),
    hullMaterial
  );

  rightWall.position.set(
    0,
    hullHeight / 2 + floorThickness,
    -boatWidth / 2 + wallThickness / 2
  );

  boat.add(rightWall);

  /*
    FRENTE E TRÁS (BRANCO)
  */
  const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      wallThickness,
      hullHeight,
      boatWidth - 2 * wallThickness
    ),
    hullMaterial
  );

  frontWall.position.set(
    boatLength / 2 - wallThickness / 2,
    hullHeight / 2 + floorThickness,
    0
  );

  boat.add(frontWall);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      wallThickness,
      hullHeight,
      boatWidth - 2 * wallThickness
    ),
    hullMaterial
  );

  backWall.position.set(
    -boatLength / 2 + wallThickness / 2,
    hullHeight / 2 + floorThickness,
    0
  );

  boat.add(backWall);

  /*
    PISO INTERNO (PRETO)
  */
  const innerFloor = new THREE.Mesh(
    new THREE.BoxGeometry(innerLength, 0.08, innerWidth),
    innerMaterial
  );

  innerFloor.position.y = deckHeight;
  boat.add(innerFloor);

  /*
    BORDA SUPERIOR (ROXO)
  */
  const rimLongGeo = new THREE.BoxGeometry(
    boatLength,
    rimHeight,
    rimThickness
  );

  const rimShortGeo = new THREE.BoxGeometry(
    rimThickness,
    rimHeight,
    boatWidth
  );

  const rimLeft = new THREE.Mesh(rimLongGeo, rimMaterial);
  rimLeft.position.set(
    0,
    hullHeight + floorThickness + rimHeight / 2,
    boatWidth / 2
  );
  boat.add(rimLeft);

  const rimRight = new THREE.Mesh(rimLongGeo, rimMaterial);
  rimRight.position.set(
    0,
    hullHeight + floorThickness + rimHeight / 2,
    -boatWidth / 2
  );
  boat.add(rimRight);

  const rimFront = new THREE.Mesh(rimShortGeo, rimMaterial);
  rimFront.position.set(
    boatLength / 2,
    hullHeight + floorThickness + rimHeight / 2,
    0
  );
  boat.add(rimFront);

  const rimBack = new THREE.Mesh(rimShortGeo, rimMaterial);
  rimBack.position.set(
    -boatLength / 2,
    hullHeight + floorThickness + rimHeight / 2,
    0
  );
  boat.add(rimBack);

  boat.position.y = 0.35;
  ship.add(boat);

  return {
    ship,
    deckHeight
  };
}
