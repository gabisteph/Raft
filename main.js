import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

/*
    CENA
*/
const scene = new THREE.Scene();

/*
    CÂMERA
*/
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(32, 15, -12);
camera.lookAt(0, 0, 0);

/*
    RENDER
*/
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

/*
    CÉU
*/
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(100, 32, 32),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x1e5a99) },
      bottomColor: { value: new THREE.Color(0x7fb2d6) }
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
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(h,0.0)),1.0);
      }
    `
  })
);

scene.add(sky);

/*
    LUZ
*/
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(18, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
scene.add(sun);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

/*
    ÁGUA
*/
//const waterGeometry = new THREE.PlaneGeometry(180, 180, 220, 220);

// const waterMaterial = new THREE.MeshPhysicalMaterial({
//   color: 0x1a2323,
//   metalness: 0.05,
//   roughness: 0.18,
//   transmission: 0.0,
//   transparent: true,
//   opacity: 0.9,
//   ior: 1.33,
//   reflectivity: 0.9,
//   clearcoat: 1.0,
//   clearcoatRoughness: 0.12,
//   sheen: 0.3,
//   sheenColor: new THREE.Color(0x9fd6ff)
// });

// const water = new THREE.Mesh(waterGeometry, waterMaterial);
// water.rotation.x = -Math.PI / 2;
// water.receiveShadow = true;
// scene.add(water);
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
    sunColor: 0x111111,

    waterColor: new THREE.Color(0x1a0f06),

    distortionScale: 1.0,
    fog: scene.fog !== undefined
  }
);

water.rotation.x = -Math.PI / 2;
scene.add(water);

// BOTO

const boto = new THREE.Group();

// corpo
const body = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xff6fa5 })
);
body.scale.set(2, 1, 1);
boto.add(body);

// cabeça
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xff85b5 })
);
head.position.set(1.4, 0, 0);
boto.add(head);

// nadadeira
const fin = new THREE.Mesh(
  new THREE.ConeGeometry(0.2, 0.6, 8),
  new THREE.MeshStandardMaterial({ color: 0xff6fa5 })
);
fin.rotation.z = Math.PI;
fin.position.set(-0.5, 0.5, 0);
boto.add(fin);

boto.position.set(0, 0.3, 5);
scene.add(boto);

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

      box.castShadow = true;
      box.receiveShadow = true;

      ship.add(box);
      shipContainers.push(box);
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

const human = new THREE.Group();
scene.add(human);

// corpo
const humanBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 1.2, 0.35),
  new THREE.MeshStandardMaterial({ color: 0x2f4f4f })
);
humanBody.position.y = 0.9;
human.add(humanBody);

// cabeça
const humanHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xf1c27d })
);
humanHead.position.y = 1.75;
human.add(humanHead);

// pernas
const legGeo = new THREE.BoxGeometry(0.16, 0.8, 0.16);
const legMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });

const legLeft = new THREE.Mesh(legGeo, legMat);
legLeft.position.set(-0.12, 0.35, 0);
human.add(legLeft);

const legRight = new THREE.Mesh(legGeo, legMat);
legRight.position.set(0.12, 0.35, 0);
human.add(legRight);

// braços
const armGeo = new THREE.BoxGeometry(0.14, 0.75, 0.14);
const armMat = new THREE.MeshStandardMaterial({ color: 0xf1c27d });

const armLeft = new THREE.Mesh(armGeo, armMat);
armLeft.position.set(-0.38, 1.05, 0);
human.add(armLeft);

const armRight = new THREE.Mesh(armGeo, armMat);
armRight.position.set(0.38, 1.05, 0);
human.add(armRight);

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

// estados do humano
let humanState = "idle"; // idle, goingToPickup, carryingToDrop, returning
let humanTargetBox = null;
let humanPickupSlot = null;

const humanSpeed = 0.05;
const humanCarryHeight = 1.6;

// posição inicial do humano
human.position.set(pierBase.position.x + 5.5, pierBase.position.y + 0.4, pierBase.position.z - 3.5);

// posição containers no pier pós animação
const pierSpacingX = 3;
const pierSpacingZ = 1.7;
const pierSpacingY = 1.4;

const pierOffsetX = -((pierCols - 1) * pierSpacingX) / 2;
const pierOffsetZ = -((pierRows - 1) * pierSpacingZ) / 2;

const humanDropPoint = new THREE.Vector3(
  pierBase.position.x + 6.0,
  pierBase.position.y + 1.0,
  pierBase.position.z + 4.0
);


// animacao humano
function updateHuman() {
  if (humanState === "idle") {
    const next = findNextBoxForHuman();

    if (next) {
      humanTargetBox = next.box;
      humanPickupSlot = {
        level: next.level,
        row: next.row,
        col: next.col
      };
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
      human.position.x += (dx / dist) * humanSpeed;
      human.position.z += (dz / dist) * humanSpeed;
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
    if (!humanTargetBox) {
      humanState = "idle";
      return;
    }

    const dx = humanDropPoint.x - human.position.x;
    const dz = humanDropPoint.z - human.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // container acompanha o humano
    humanTargetBox.position.set(
      human.position.x,
      human.position.y + humanCarryHeight,
      human.position.z
    );

    if (dist > 0.08) {
      human.position.x += (dx / dist) * humanSpeed;
      human.position.z += (dz / dist) * humanSpeed;
    } else {
      // solta o container na área de entrega
      humanTargetBox.position.set(
        humanDropPoint.x,
        humanDropPoint.y + humanTargetBox.geometry.parameters.height / 2,
        humanDropPoint.z
      );

      humanTargetBox.userData.isCarriedByHuman = false;
      humanTargetBox.userData.isDelivered = true;

      humanTargetBox = null;
      humanPickupSlot = null;
      humanState = "returning";
    }
  }

  else if (humanState === "returning") {
    const homeX = pierBase.position.x + 5.5;
    const homeZ = pierBase.position.z - 3.5;

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

function unloadContainers() {
  if (currentIndex >= shipContainers.length) return;

  while (
    currentIndex < shipContainers.length &&
    shipContainers[currentIndex].userData.isUnloaded
  ) {
    currentIndex++;
  }

  if (currentIndex >= shipContainers.length) return;

  const box = shipContainers[currentIndex];

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

      currentIndex++;
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

/*
    ANIMAÇÃO
*/
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0005;
  

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

    if (currentIndex >= shipContainers.length) {
      state = "returning";
    }
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
      state = "moving";
    }
  }
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  boto.position.x = botoArea.centerX + Math.sin(time * 0.8) * botoArea.radiusX;
  boto.position.z = botoArea.centerZ + Math.cos(time * 0.5) * botoArea.radiusZ;

  boto.position.y = 0.3 + Math.sin(time * 2) * 0.1;

  updateHuman();

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