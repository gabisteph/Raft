import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';

import { Water } from 'three/addons/objects/Water.js';
/*
    CENA
*/
const scene = new THREE.Scene();

/*
    CÂMERA
*/
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-25, 15, -10);
camera.lookAt(0, 0, 0);


/*
    RENDER
*/
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

/*
    CÉU
*/
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(100, 64, 64),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x0b1026) },   // topo escuro (quase noite)
      midColor: { value: new THREE.Color(0x1f3f75) },   // azul médio
      horizonColor: { value: new THREE.Color(0xf2d9a0) }, // brilho do horizonte
      time: { value: 0.0 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vWorldPosition = (modelMatrix * vec4(position,1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 horizonColor;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = dir.y;

    // gradiente suave estilo "blue hour"
    vec3 skyColor = mix(midColor, topColor, smoothstep(0.2, 0.9, h));
    skyColor = mix(horizonColor, skyColor, smoothstep(-0.2, 0.3, h));

    gl_FragColor = vec4(skyColor, 1.0);
  }
`
  })
);

scene.add(sky);

/*
    LUZ NOTURNA
*/

// luz principal bem suave (tipo lua)
const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(18, 30, 12);

// leve tom azulado pra ficar noturno bonito
sun.color.set(0xbfdcff);
sun.position.set(18, 30, 12);
sun.castShadow = true;
scene.add(sun);

// luz secundária MUITO fraca
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// ambiente escuro
const ambientLight = new THREE.AmbientLight(0x9bbcff, 0.6);
scene.add(ambientLight);

const fillLight = new THREE.DirectionalLight(0x6f8cff, 0.8);
fillLight.position.set(-20, 15, -10);
scene.add(fillLight);
/*
    ÁGUA (RIO NEGRO REALISTA)
*/
let water;

const waterGeometry = new THREE.PlaneGeometry( 1000, 1000 );

water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/waternormals.jpg',
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
scene.add(water);

/*
    FUNDO (mantido)
*/
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({
    color: 0x0a0a0a
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);



/*
    ATMOSFERA (IMPORTANTE)
*/
scene.background = new THREE.Color(0x2b2b2b);
scene.fog = new THREE.Fog(0x2b2b2b, 120, 320);

function createTree() {
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

const treeCount = 30;
const spacingTree = 4;

const xLine = 80;
const startZ = -80;

// 🔹 LINHA ORIGINAL (mantida)
for (let i = 0; i < treeCount; i++) {
  const tree = createTree();

  tree.position.set(
    xLine,
    0,
    startZ + i * spacingTree
  );

  const scale = 0.9 + Math.random() * 0.3;
  tree.scale.set(scale, scale, scale);

  scene.add(tree);
}

// 🔹 FLORESTA (camadas extras)
const forestDepth = 3; // quantas camadas pra trás

for (let layer = 1; layer <= forestDepth; layer++) {
  for (let i = 0; i < treeCount; i++) {
    const tree = createTree();

    tree.position.set(
      xLine + layer * 3 + Math.random() * 2, // profundidade
      0,
      startZ + i * spacingTree + (Math.random() - 0.5) * 2 // bagunça natural
    );

    const scale = 0.7 + Math.random() * 0.5;
    tree.scale.set(scale, scale, scale);

    scene.add(tree);
  }
}

// BOTO

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

const boto1 = createBotoGLTF('models/scene.gltf');
boto1.position.set(0, 0.3, 5);
scene.add(boto1);

const boto2 = createBotoGLTF('models/scene.gltf');
boto2.position.set(-5, 0.3, 8);
scene.add(boto2);

/*
    RAFTS
*/

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
scene.add(raft1);

const raft2 = createRaft();
raft2.position.set(-6, 0, 5.6);
raft2.rotation.y = Math.PI;
scene.add(raft2);

function placeBotoInFrontOfRaft(boto, raft, sideOffset = 0) {
  // pega a direção real da jangada (respeitando rotação)
  const direction = new THREE.Vector3(1, 0, 0)
    .applyQuaternion(raft.quaternion)
    .normalize();

  const frontDistance = 5;

  const side = new THREE.Vector3(-direction.z, 0, direction.x);

  const startPos = raft.position.clone()
    .add(direction.clone().multiplyScalar(frontDistance))
    .add(side.multiplyScalar(sideOffset));

  boto.position.copy(startPos);
}

placeBotoInFrontOfRaft(boto1, raft1, -1.6);
placeBotoInFrontOfRaft(boto2, raft2, 0.8);

const raftDropSlots = [
  { x: 0, z: 0 }
];

const raftData = [
  {
    raft: raft1,
    homePosition: new THREE.Vector3(-6, 0, 2.2),
    farPosition: new THREE.Vector3(-28, 0, 2.2),
    state: "idle", // idle, goingFar, returning
    assignedBox: null
  },
  {
    raft: raft2,
    homePosition: new THREE.Vector3(-6, 0, 5.6),
    farPosition: new THREE.Vector3(-28, 0, 5.6),
    state: "idle",
    assignedBox: null
  }
];

function getAvailableRaftData() {
  for (const data of raftData) {
    if (data.state === "idle" && data.assignedBox === null) {
      return data;
    }
  }
  return null;
}

function getRaftDropPoint(raftObj) {
  const slot = raftDropSlots[0];

  return new THREE.Vector3(
    raftObj.position.x + slot.x,
    raftObj.position.y + 0.9,
    raftObj.position.z + slot.z
  );
}


/*
    tamanho container
*/

const spacingX = 3.6;
const spacingZ = 1.18;
const spacingY = 1.3;
/*
    BARCO - MODELO NOVO BASEADO NA IMAGEM
*/
const ship = new THREE.Group();
scene.add(ship);

const boatLength = 16.6;
const boatWidth = 5.2;
const hullHeight = 3.3;
const wallThickness = 0.1;
const rimHeight = 0.5;
const rimThickness = 0.18;
const floorThickness = 0.18;

const hullColor = 0xdddddd;
const hullDark = 0xbfc4ca;
const lineColor = 0x2c2c2c;

const innerLength = boatLength - 2 * wallThickness;
const innerWidth = boatWidth - 2 * wallThickness;

const deckHeight = hullHeight + floorThickness - 0.28;

function createBarge() {
  const boat = new THREE.Group();
// por 3

  const hullMaterial = new THREE.MeshStandardMaterial({
    color: hullColor,
    roughness: 0.72,
    metalness: 0.08
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: hullDark,
    roughness: 0.75,
    metalness: 0.05
  });

  const lineMaterial = new THREE.MeshStandardMaterial({
    color: lineColor,
    roughness: 0.9,
    metalness: 0.0
  });

  // fundo externo
  const bottom = new THREE.Mesh(
    new THREE.BoxGeometry(boatLength, floorThickness, boatWidth),
    darkMaterial
  );
  bottom.position.y = floorThickness / 2;
  bottom.castShadow = true;
  bottom.receiveShadow = true;
  boat.add(bottom);

  // paredes laterais retas
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(boatLength, hullHeight, wallThickness),
    hullMaterial
  );
  leftWall.position.set(0, hullHeight / 2 + floorThickness, boatWidth / 2 - wallThickness / 2);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  boat.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(boatLength, hullHeight, wallThickness),
    hullMaterial
  );
  rightWall.position.set(0, hullHeight / 2 + floorThickness, -boatWidth / 2 + wallThickness / 2);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  boat.add(rightWall);

  // frente e trás retos
  const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, hullHeight, boatWidth - 2 * wallThickness),
    hullMaterial
  );
  frontWall.position.set(boatLength / 2 - wallThickness / 2, hullHeight / 2 + floorThickness, 0);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  boat.add(frontWall);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, hullHeight, boatWidth - 2 * wallThickness),
    hullMaterial
  );
  backWall.position.set(-boatLength / 2 + wallThickness / 2, hullHeight / 2 + floorThickness, 0);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  boat.add(backWall);

  // piso interno
  

  const innerFloor = new THREE.Mesh(
    new THREE.BoxGeometry(innerLength, 0.08, innerWidth),
    new THREE.MeshStandardMaterial({
      color: 0xf4f4f4,
      roughness: 0.85,
      metalness: 0.02
    })
  );
  innerFloor.position.y = deckHeight;
  innerFloor.castShadow = true;
  innerFloor.receiveShadow = true;
  boat.add(innerFloor);

  // borda superior
  const rimLongGeo = new THREE.BoxGeometry(boatLength, rimHeight, rimThickness);
  const rimShortGeo = new THREE.BoxGeometry(rimThickness, rimHeight, boatWidth);

  const rimLeft = new THREE.Mesh(rimLongGeo, lineMaterial);
  rimLeft.position.set(0, hullHeight + floorThickness + rimHeight / 2, boatWidth / 2);
  boat.add(rimLeft);

  const rimRight = new THREE.Mesh(rimLongGeo, lineMaterial);
  rimRight.position.set(0, hullHeight + floorThickness + rimHeight / 2, -boatWidth / 2);
  boat.add(rimRight);

  const rimFront = new THREE.Mesh(rimShortGeo, lineMaterial);
  rimFront.position.set(boatLength / 2, hullHeight + floorThickness + rimHeight / 2, 0);
  boat.add(rimFront);

  const rimBack = new THREE.Mesh(rimShortGeo, lineMaterial);
  rimBack.position.set(-boatLength / 2, hullHeight + floorThickness + rimHeight / 2, 0);
  boat.add(rimBack);

  // divisórias internas 4x4 mais juntas e retas
    // piso superior com 4 linhas de containers e espacamento entre elas
  const rows = 4;                 // 4 linhas
  const colsPerRow = 4;           // 4 containers por linha

  const containerLen = 1.1;       // comprimento do container
  const containerWid = 0.8;       // largura do container

  const gapBetweenRows = 0.28;    // ESPACAMENTO X entre as linhas
  const sideMarginZ = 0.22;       // margem lateral
  const frontBackMarginX = 0.35;  // margem nas pontas

  const usableLength = colsPerRow * containerLen + frontBackMarginX * 2;
  const usableWidth = rows * containerWid + (rows - 1) * gapBetweenRows + sideMarginZ * 2;

  const dividerHeight = 0.22;
  const dividerThickness = 0.12;
  const dividerY = deckHeight + 0.11;

  // moldura interna
  const frameLong1 = new THREE.Mesh(
    new THREE.BoxGeometry(usableLength, dividerHeight, 0.08),
    hullMaterial
  );
  frameLong1.position.set(0, dividerY, usableWidth / 2);
  boat.add(frameLong1);

  const frameLong2 = frameLong1.clone();
  frameLong2.position.z = -usableWidth / 2;
  boat.add(frameLong2);

  const frameShort1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, dividerHeight, usableWidth),
    hullMaterial
  );
  frameShort1.position.set(usableLength / 2, dividerY, 0);
  boat.add(frameShort1);

  const frameShort2 = frameShort1.clone();
  frameShort2.position.x = -usableLength / 2;
  boat.add(frameShort2);

  // linhas separadoras ENTRE as 4 fileiras
  for (let i = 1; i < rows; i++) {
    const z = -usableWidth / 2 + sideMarginZ + i * containerWid + (i - 0.5) * gapBetweenRows;

    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(usableLength, dividerHeight, dividerThickness),
      hullMaterial
    );
    divider.position.set(0, dividerY, z);
    divider.castShadow = true;
    divider.receiveShadow = true;
    boat.add(divider);
  }

    // separações no comprimento para repetir 4 vezes
  for (let i = 1; i < colsPerRow; i++) {
    const x = -usableLength / 2 + frontBackMarginX + i * containerLen;

    const dividerX = new THREE.Mesh(
      new THREE.BoxGeometry(dividerThickness, dividerHeight, usableWidth),
      hullMaterial
    );
    dividerX.position.set(x, dividerY, 0);
    dividerX.castShadow = true;
    dividerX.receiveShadow = true;
    boat.add(dividerX);
  }

  // contorno interno
  const innerRimLong = new THREE.Mesh(
    new THREE.BoxGeometry(usableLength, 0.07, 0.08),
    darkMaterial
  );
  innerRimLong.position.set(0, dividerY + 0.08, usableWidth / 2);
  boat.add(innerRimLong);

  const innerRimLong2 = innerRimLong.clone();
  innerRimLong2.position.z = -usableWidth / 2;
  boat.add(innerRimLong2);

  const innerRimShort = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.07, usableWidth),
    darkMaterial
  );
  innerRimShort.position.set(usableLength / 2, dividerY + 0.08, 0);
  boat.add(innerRimShort);

  const innerRimShort2 = innerRimShort.clone();
  innerRimShort2.position.x = -usableLength / 2;
  boat.add(innerRimShort2);

  return boat;
}

const bargeModel = createBarge();
bargeModel.position.y = 0.35;
ship.add(bargeModel);

/*
    CONTAINERS
*/
const TOTAL_CONTAINERS = 24;

const BLUE = 0x4d79ff;
const GREEN = 0x3ddc84;

const shipContainers = [];
const shipCols = 4;
const shipRows = 4;
const shipLevels = 3;

const containerWidth = 2.6;
const containerHeight = 1.13;
const containerDepth = 1.06;


const offsetX = -((shipCols - 1) * spacingX) / 2;
const offsetZ = -((shipRows - 1) * spacingZ) / 2;
const baseY =  deckHeight + 1;

const colors = [0xff4d4d, 0x3ddc84, 0x4d79ff, 0xffcc33, 0xff884d];

let created = 0;

const shipLayout = [
  [
    ["B", null, "B", null],
    ["B", "B", "B", "G"],
    ["B", "B", "G", "B"],
    [null, null, null, "B"]
  ],
  [
    [null, null, "G", null],
    ["B", "B", "G", "G"],
    ["G", "G", "G", "G"],
    [null, null, null, "G"]
  ],
  [
    [null, null, null, null],
    [null, "B", "G", null],
    [null, null, "G", null],
    [null, null, null, null]
  ]
];


function getContainerColor(code) {
  if (code === "B") return BLUE;
  if (code === "G") return GREEN;
  return null;
}

let blueCount = 0;
let greenCount = 0;

for (let level = 0; level < shipLevels; level++) {
  for (let row = 0; row < shipRows; row++) {
    for (let col = 0; col < shipCols; col++) {
      const code = shipLayout[level][row][col];
      if (!code) continue;

      const color = getContainerColor(code);
      if (!color) continue;

      if (code === "B") blueCount++;
      if (code === "G") greenCount++;

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth),
        new THREE.MeshPhongMaterial({ color })
      );

      box.position.set(
        offsetX + col * spacingX,
        baseY + level * spacingY,
        offsetZ + row * spacingZ
      );

      box.userData.isUnloaded = false;
      box.userData.pierSlot = null;
      box.userData.isOnPier = false;
      box.userData.isCarriedByHuman = false;
      box.userData.isDelivered = false;
      box.userData.isOnRaft = false;

      box.castShadow = true;
      box.receiveShadow = true;

      ship.add(box);
      shipContainers.push(box);
      box.userData.containerId = shipContainers.length;
      box.userData.originalPosition = box.position.clone();
      box.userData.shipLevel = level;
      box.userData.shipRow = row;
      box.userData.shipCol = col;
      box.userData.colorCode = code;
    }
  }
}

if (shipContainers.length !== TOTAL_CONTAINERS) {
  console.warn(`A matriz do barco tem ${shipContainers.length} containers, mas o TOTAL_CONTAINERS está em ${TOTAL_CONTAINERS}.`);
}

const unloadSequence = [
  22, 1, 16, 12, 21,
  13, 20, 24, 6, 17,
  23, 18, 15, 19, 14,
  9, 3, 11, 2, 7, 10, 4, 8, 5
];

let unloadSequenceIndex = 0;

if (blueCount !== 12 || greenCount !== 12) {
  console.warn(`Quantidade de cores inválida: azul=${blueCount}, verde=${greenCount}. O esperado é 12 de cada.`);
}

/*
    PORTO / CAIS
*/
const port = new THREE.Group();
scene.add(port);

// plataforma principal do cais
const textureLoader = new THREE.TextureLoader();

const woodTexture = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
const woodNormal = textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg');

woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;

woodNormal.wrapS = THREE.RepeatWrapping;
woodNormal.wrapT = THREE.RepeatWrapping;

const baseWoodMaterial = new THREE.MeshStandardMaterial({
  map: woodTexture,
  normalMap: woodNormal,
  color: "#fae315",
  roughness: 0.75,
  metalness: 0.05
});

const quay = new THREE.Group();
port.add(quay);

// dimensões do cais
const width = 26;
const depth = 14;

// configuração das tábuas
const plankWidth = 1.2;
const gap = 0.15;
const plankHeight = 0.25;

const totalPlanks = Math.floor(width / (plankWidth + gap));

for (let i = 0; i < totalPlanks; i++) {
  const material = baseWoodMaterial.clone();

  // variação de cor (essencial pra não ficar artificial)
  material.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);

  const plank = new THREE.Mesh(
    new THREE.BoxGeometry(plankWidth, plankHeight, depth),
    material
  );

  plank.position.set(
    -width / 2 + i * (plankWidth + gap) + plankWidth / 2 + 11.5,
    0.6,
    0
  );

  // leve desalinhamento estilo madeira real
  plank.rotation.y = (Math.random() - 0.5) * 0.03;

  plank.castShadow = true;
  plank.receiveShadow = true;

  quay.add(plank);
}
// postes + cordas estilo RAFT
const ropeMaterial = new THREE.MeshBasicMaterial({ color: 0xf5deb3 });
const postMaterial = baseWoodMaterial.clone();

const postCount = 7;
const spacing = 4;

// posição base (ajusta se quiser)
const initX = -0.5;
const zPos = 6.5;

let lastPost = null;

for (let i = 0; i < postCount; i++) {
  // POSTE
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8),
    postMaterial
  );

  post.position.set(initX + i * spacing, 1.2, zPos);
  post.castShadow = true;
  port.add(post);

  // CORDA (liga com o anterior)
  if (lastPost) {
    const start = lastPost.position;
    const end = post.position;

    const distance = start.distanceTo(end);

    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, distance, 6),
      ropeMaterial
    );

    // posição no meio
    rope.position.set(
      (start.x + end.x) / 2,
      2.0, // altura da corda
      (start.z + end.z) / 2
    );

    // rotação correta
    rope.rotation.z = Math.PI / 2;

    port.add(rope);
  }

  lastPost = post;
}



/*
    PIER DE RECEBIMENTO 2x2
*/
const pier = new THREE.Group();
scene.add(pier);

const pierBase = new THREE.Mesh(
  new THREE.BoxGeometry(10.5, 0.8, 10.5),
  new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.0 })
);
pierBase.position.set(9, 0.4, 0);
pier.add(pierBase);
// marcações de posição 5x2
const pierCols = 2;
const pierRows = 2;
const pierLevels = 2;

const pierSlots = [
  [
    [null, null],
    [null, null]
  ],
  [
    [null, null],
    [null, null]
  ]
];

// humano

// humano estilizado estilo "boto humano"
const human = new THREE.Group();
scene.add(human);

// material principal (roupa branca)
const whiteMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.6
});

// detalhes rosa
const pinkMat = new THREE.MeshStandardMaterial({
  color: 0xff6fa5,
  roughness: 0.6
});

// pele
const skinMat = new THREE.MeshStandardMaterial({
  color: 0xf1c27d
});

/*
  CORPO (terno branco)
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
  PERNAS (brancas)
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
  CHAPÉU (ESSENCIAL 🔥)
*/
// aba
const hatBrim = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.35, 0.05, 20),
  whiteMat
);
hatBrim.position.y = 2.05;
human.add(hatBrim);

// topo
const hatTop = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.25, 0.3, 20),
  whiteMat
);
hatTop.position.y = 2.2;
human.add(hatTop);

// faixa rosa do chapéu
const hatBand = new THREE.Mesh(
  new THREE.CylinderGeometry(0.255, 0.255, 0.08, 20),
  pinkMat
);
hatBand.position.y = 2.15;
human.add(hatBand);

/*
  DETALHE ROSA (lenço no peito)
*/
const chestDetail = new THREE.Mesh(
  new THREE.BoxGeometry(0.15, 0.15, 0.02),
  pinkMat
);
chestDetail.position.set(0.15, 1.1, 0.18);
human.add(chestDetail);

function isCollidingWithBoxes(nextX, nextZ) {
  if (humanState === "goingToPickup" || humanState === "carryingToDrop") {
    return false;
  }

  const humanRadius = 0.35;

  for (const box of shipContainers) {
    if (!box.userData.isOnPier) continue;
    if (box.userData.isCarriedByHuman) continue;

    const dx = nextX - box.position.x;
    const dz = nextZ - box.position.z;

    const dist = Math.sqrt(dx * dx + dz * dz);

    const minDist = humanRadius + 0.6;

    if (dist < minDist) {
      return true;
    }
  }

  return false;
}

// logica de retirada para o humano
function findNextBoxForHuman() {
  // primeiro tenta pegar os de cima
  for (let row = 0; row < pierRows; row++) {
    for (let col = 0; col < pierCols; col++) {
      const topBox = pierSlots[1][row][col];
      if (topBox) {
        return { box: topBox, level: 1, row, col };
      }
    }
  }

  // depois pega os de baixo sem nada em cima
  for (let row = 0; row < pierRows; row++) {
    for (let col = 0; col < pierCols; col++) {
      const bottomBox = pierSlots[0][row][col];
      const topBox = pierSlots[1][row][col];

      if (bottomBox && !topBox) {
        return { box: bottomBox, level: 0, row, col };
      }
    }
  }

  return null;
}
human.scale.set(1.8, 1.8, 1.8);

// estados do humano
let humanState = "idle"; // idle, goingToPickup, carryingToDrop, returning
let humanTargetBox = null;
let humanPickupSlot = null;
let humanTargetRaftData = null;

const humanSpeed = 0.05;
const humanCarryHeight = 2.2;

// posição inicial do humano
human.position.set(pierBase.position.x + 5.5, pierBase.position.y + 0.4, pierBase.position.z - 3.5);

// posição containers no pier pós animação
const pierSpacingX = 3;
const pierSpacingZ = 1.7;
const pierSpacingY = 1.4;

const pierOffsetX = -((pierCols - 1) * pierSpacingX) / 2;
const pierOffsetZ = -((pierRows - 1) * pierSpacingZ) / 2;

// animacao humano
function updateHuman() {
  if (humanState === "idle") {
    const next = findNextBoxForHuman();
    const availableRaftData = getAvailableRaftData();

    if (next && availableRaftData) {
      humanTargetBox = next.box;
      humanPickupSlot = {
        level: next.level,
        row: next.row,
        col: next.col
      };
      humanTargetRaftData = availableRaftData;
      humanState = "goingToPickup";
    }
  }

  else if (humanState === "goingToPickup") {
    if (!humanTargetBox) {
      humanState = "idle";
      return;
    }

    const targetPos = humanTargetBox.position.clone();
    const dx = targetPos.x - human.position.x;
    const dz = targetPos.z - human.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.08) {
      const nextX = human.position.x + (dx / dist) * humanSpeed;
      const nextZ = human.position.z + (dz / dist) * humanSpeed;

      // move separado → evita travar
      if (!isCollidingWithBoxes(nextX, human.position.z)) {
        human.position.x = nextX;
      }

      if (!isCollidingWithBoxes(human.position.x, nextZ)) {
        human.position.z = nextZ;
      }
    } else {
      // libera a vaga no instante em que o humano pega
      if (humanPickupSlot) {
        pierSlots[humanPickupSlot.level][humanPickupSlot.row][humanPickupSlot.col] = null;
      }

      humanTargetBox.userData.pierSlot = null;
      humanTargetBox.userData.isOnPier = false;
      humanTargetBox.userData.isCarriedByHuman = true;

      humanState = "carryingToDrop";
    }
  }

  else if (humanState === "carryingToDrop") {
    if (!humanTargetBox || !humanTargetRaftData) {
      humanState = "idle";
      return;
    }

    const raftDropPoint = getRaftDropPoint(humanTargetRaftData.raft);

    const dx = raftDropPoint.x - human.position.x;
    const dz = raftDropPoint.z - human.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // container acompanha o humano
    const carryOffset = containerWidth / 2 + 0.5; // distância à frente do corpo

    const dir = new THREE.Vector3(
      raftDropPoint.x - human.position.x,
      0,
      raftDropPoint.z - human.position.z
    ).normalize();
    

    humanTargetBox.position.set(
      human.position.x + dir.x * carryOffset,
      human.position.y + humanCarryHeight,
      human.position.z + dir.z * carryOffset
    );

    if (dist > 0.08) {
      human.position.x += (dx / dist) * humanSpeed;
      human.position.z += (dz / dist) * humanSpeed;
    } else {
      // solta o container em cima da jangada escolhida
      humanTargetBox.position.set(
        raftDropPoint.x,
        raftDropPoint.y + humanTargetBox.geometry.parameters.height / 2,
        raftDropPoint.z
      );

      humanTargetBox.userData.isCarriedByHuman = false;
      humanTargetBox.userData.isDelivered = true;
      humanTargetBox.userData.isOnRaft = true;

      humanTargetRaftData.assignedBox = humanTargetBox;

      // 🔒 marca que está esperando o humano sair
      humanTargetRaftData.waitingForHuman = true;

      humanTargetBox = null;
      humanPickupSlot = null;
      humanTargetRaftData = null;
      humanState = "returning";
    }
  }
  else if (humanState === "returning") {
    const homeX = pierBase.position.x - 8;
    const homeZ = pierBase.position.z - 2;

    const dx = homeX - human.position.x;
    const dz = homeZ - human.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.08) {
      human.position.x += (dx / dist) * humanSpeed;
      human.position.z += (dz / dist) * humanSpeed;
    } else {
      human.position.x = homeX;
      human.position.z = homeZ;
      humanState = "idle";

      // 🔥 libera as jangadas que estavam esperando
      for (const data of raftData) {
        if (data.waitingForHuman && data.assignedBox) {
          data.state = "goingFar";
          data.waitingForHuman = false;
        }
      }
    }
  }
}

function updateRafts() {
  const raftSpeed = 0.1;

  for (const data of raftData) {
    if (data.state === "goingFar") {
      const dx = data.farPosition.x - data.raft.position.x;
      const dz = data.farPosition.z - data.raft.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (data.assignedBox) {
        data.assignedBox.position.set(
          data.raft.position.x,
          data.raft.position.y + data.assignedBox.geometry.parameters.height / 2 + 0.35,
          data.raft.position.z
        );
      }

      if (dist > 0.08) {
        data.raft.position.x += (dx / dist) * raftSpeed;
        data.raft.position.z += (dz / dist) * raftSpeed;
      } else {
        data.raft.position.x = data.farPosition.x;
        data.raft.position.z = data.farPosition.z;

        // "deixa o container" no destino distante
        if (data.assignedBox) {
          scene.remove(data.assignedBox);
          data.assignedBox = null;
        }

        data.state = "returning";
      }
    }

    else if (data.state === "returning") {
      const dx = data.homePosition.x - data.raft.position.x;
      const dz = data.homePosition.z - data.raft.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.08) {
        data.raft.position.x += (dx / dist) * raftSpeed;
        data.raft.position.z += (dz / dist) * raftSpeed;
      } else {
        data.raft.position.x = data.homePosition.x;
        data.raft.position.z = data.homePosition.z;
        data.state = "idle";
      }
    }
  }
}

/*
    POSIÇÃO INICIAL
*/
ship.position.set(-14, -1, -11);

/*
    ESTADOS
*/
let state = "moving";
let currentIndex = 0;
const startX = -12;

/*
    DESCARGA
*/

function findNextPierSlot() {
  // 1) sempre tenta completar o primeiro andar
  for (let row = 0; row < pierRows; row++) {
    for (let col = 0; col < pierCols; col++) {
      if (pierSlots[0][row][col] === null) {
        return { level: 0, row, col };
      }
    }
  }

  // 2) só usa o segundo andar se houver base embaixo
  for (let row = 0; row < pierRows; row++) {
    for (let col = 0; col < pierCols; col++) {
      if (pierSlots[0][row][col] !== null && pierSlots[1][row][col] === null) {
        return { level: 1, row, col };
      }
    }
  }

  // 3) sem vaga
  return null;
}

function getPierTargetPosition(level, row, col) {
  return new THREE.Vector3(
    pierBase.position.x + pierOffsetX + col * pierSpacingX,
    pierBase.position.y + 1.35 + level * pierSpacingY,
    pierBase.position.z + pierOffsetZ + row * pierSpacingZ
  );
}


let activeMove = null;

function isContainerAccessible(box) {
  // se houver algum container acima, na mesma linha/coluna, ainda não descarregado,
  // este container não pode sair
  return !shipContainers.some(other =>
    !other.userData.isUnloaded &&
    other.userData.shipRow === box.userData.shipRow &&
    other.userData.shipCol === box.userData.shipCol &&
    other.userData.shipLevel > box.userData.shipLevel
  );
}

function getNextContainerFromSequence() {
  while (unloadSequenceIndex < unloadSequence.length) {
    const wantedId = unloadSequence[unloadSequenceIndex];

    const candidate = shipContainers.find(
      box => box.userData.containerId === wantedId
    );

    // se não encontrou, pula
    if (!candidate) {
      unloadSequenceIndex++;
      continue;
    }

    // se já saiu, pula
    if (candidate.userData.isUnloaded) {
      unloadSequenceIndex++;
      continue;
    }

    // se não está acessível, espera
    if (!isContainerAccessible(candidate)) {
      return null;
    }

    return candidate;
  }

  return null;
}

function isUnloadSequenceFinished() {
  return unloadSequenceIndex >= unloadSequence.length;
}

function unloadContainers() {
  const box = getNextContainerFromSequence();

  if (!box) return;

  if (!activeMove) {
    const slot = findNextPierSlot();

    // se não houver vaga no pier, para o descarregamento
    if (!slot) {
      return;
    }

    // tira o container do barco e coloca na cena mantendo posição global
    if (box.parent === ship) {
      const worldPos = new THREE.Vector3();
      box.getWorldPosition(worldPos);

      ship.remove(box);
      scene.add(box);
      box.position.copy(worldPos);
    }

    const { level, row, col } = slot;
    const target = getPierTargetPosition(level, row, col);

    // reserva a vaga no pier
    pierSlots[level][row][col] = box;
    box.userData.pierSlot = { level, row, col };

    activeMove = {
      box,
      target,
      phase: "up",
      liftHeight: 4.5
    };
  }

  if (!activeMove) return;

  const movingBox = activeMove.box;
  const target = activeMove.target;
  const speed = 0.08;

  if (activeMove.phase === "up") {
    movingBox.position.y += (activeMove.liftHeight - movingBox.position.y) * speed;

    if (Math.abs(movingBox.position.y - activeMove.liftHeight) < 0.05) {
      movingBox.position.y = activeMove.liftHeight;
      activeMove.phase = "horizontal";
    }
  }

  else if (activeMove.phase === "horizontal") {
    movingBox.position.x += (target.x - movingBox.position.x) * speed;
    movingBox.position.z += (target.z - movingBox.position.z) * speed;

    if (
      Math.abs(movingBox.position.x - target.x) < 0.05 &&
      Math.abs(movingBox.position.z - target.z) < 0.05
    ) {
      movingBox.position.x = target.x;
      movingBox.position.z = target.z;
      activeMove.phase = "down";
    }
  }

  else if (activeMove.phase === "down") {
    movingBox.position.y += (target.y - movingBox.position.y) * speed;

    if (Math.abs(movingBox.position.y - target.y) < 0.05) {
      movingBox.position.y = target.y;

      movingBox.userData.isUnloaded = true;
      movingBox.userData.isOnPier = true;

      unloadSequenceIndex++;
      activeMove = null;
    }
  }
}

const botoArea = {
  centerX: -10,
  centerZ: 5,
  radiusX: 6,
  radiusZ: 4
};

raft1.userData.prevPosition = raft1.position.clone();
raft2.userData.prevPosition = raft2.position.clone();



/*
    ANIMAÇÃO
*/
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0005;
  if (humanState === "carryingToDrop") {
    armLeft.rotation.x = -1.2;
    armRight.rotation.x = -1.2;
  }
  

  // updateWater(time)

  ship.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;

  const speed = 0.07;

  const stopPoint = 10;

  if (state === "moving") {
    if (ship.position.x < stopPoint) {
      ship.position.x += speed;
    } else {
      ship.position.x = stopPoint;
      state = "unloading";
    }
  }

  else if (state === "unloading") {
  unloadContainers();

    if (isUnloadSequenceFinished()) {
      state = "stopped";
    }
  }

  if (state === "stopped") {
    ship.rotation.z = Math.sin(Date.now() * 0.001) * 0.01;
  }

  else if (state === "returning") {
    if (ship.position.x > startX) {
      ship.position.x -= speed;

      shipContainers.forEach(box => {
        if (box.userData.isUnloaded) return;

        if (box.parent !== ship) {
          const worldPos = new THREE.Vector3();
          box.getWorldPosition(worldPos);

          scene.remove(box);
          ship.add(box);

          box.position.copy(ship.worldToLocal(worldPos));
        }

        box.position.lerp(box.userData.originalPosition, 0.08);
      });

    } else {
      ship.position.x = startX;

      shipContainers.forEach(box => {
        if (box.userData.isUnloaded) return; // ← NÃO mexe nos que já saíram do barco

        box.position.copy(box.userData.originalPosition);
        box.userData.pierSlot = null;
      });

      currentIndex = 0;
      unloadSequenceIndex = 0;
      state = "moving";
    }
  }
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  const botoRaftPairs = [
  { boto: boto1, raft: raft1, sideOffset: -0.8 },
  { boto: boto2, raft: raft2, sideOffset: 0.8 }
];

for (const pair of botoRaftPairs) {
  const { boto, raft, sideOffset } = pair;

  const direction = new THREE.Vector3()
    .subVectors(raft.position, raft.userData.prevPosition);

  if (direction.length() < 0.001) continue;

  direction.normalize();

  const side = new THREE.Vector3(-direction.z, 0, direction.x);

  const frontDistance = 4.5;

  const target = raft.position.clone()
    .add(direction.clone().multiplyScalar(frontDistance))
    .add(side.multiplyScalar(sideOffset));

  // movimento suave
  boto.position.lerp(target, 0.08);

  // =========================
  // 🔥 DETECÇÃO DE "COLISÃO"
  // =========================
  const distanceToRaft = boto.position.distanceTo(raft.position);

  const isUnderRaft = distanceToRaft < 3.5; // ajusta esse valor

  if (isUnderRaft) {
    // mergulha
    boto.position.y = THREE.MathUtils.lerp(boto.position.y, -0.8, 0.1);
  } else {
    // volta pra superfície com ondinha
    const floatY = 0.3 + Math.sin(Date.now() * 0.003) * 0.08;
    boto.position.y = THREE.MathUtils.lerp(boto.position.y, floatY, 0.1);
  }

  // rotação
  boto.rotation.y = Math.atan2(-direction.z, direction.x);
}

  raft1.userData.prevPosition.copy(raft1.position);
  raft2.userData.prevPosition.copy(raft2.position);

    updateHuman();
    updateRafts();

    renderer.render(scene, camera);
  }

animate();


/*
    RESIZE
*/
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});