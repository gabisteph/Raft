import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

/*
    CENA
*/
const scene = new THREE.Scene();

/*
    CÂMERA
*/
const camera = new THREE.PerspectiveCamera(105, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 18, -13);
camera.lookAt(0, -2, 0);

/*
    RENDER
*/
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/*
    CÉU
*/
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(100, 32, 32),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x4da3ff) },
      bottomColor: { value: new THREE.Color(0xeaf6ff) }
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
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(18, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
scene.add(sun);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
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
    sunColor: 0x222222,

    waterColor: new THREE.Color(0x020305),

    distortionScale: 1.2,
    fog: scene.fog !== undefined
  }
);

water.rotation.x = -Math.PI / 2;
scene.add(water);

/*
    BARCO
*/
const ship = new THREE.Group();
scene.add(ship);

const hullGeometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
  -6.8,  0.0,  3.8,
  -6.8,  0.0, -3.8,
  -5.2, -1.5,  3.0,
  -5.2, -1.5, -3.0,
   5.2, -1.5,  3.0,
   5.2, -1.5, -3.0,
   6.8,  0.0,  3.8,
   6.8,  0.0, -3.8
]);

const indices = [
  0, 2, 4, 0, 4, 6,
  1, 3, 5, 1, 5, 7,
  2, 3, 5, 2, 5, 4,
  0, 1, 7, 0, 7, 6,
  0, 1, 3, 0, 3, 2,
  6, 7, 5, 6, 5, 4
];

hullGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
hullGeometry.setIndex(indices);
hullGeometry.computeVertexNormals();

const hull = new THREE.Mesh(
  hullGeometry,
  new THREE.MeshPhongMaterial({ color: 0x061a3a, shininess: 35 })
);
hull.position.y = 0.5;
hull.castShadow = true;
hull.receiveShadow = true;
ship.add(hull);

// convés
const deck = new THREE.Mesh(
  new THREE.BoxGeometry(10.5, 0.25, 6.2),
  new THREE.MeshPhongMaterial({ color: 0x1a2a4a, shininess: 20 })
);
deck.position.set(0, 0.95, 0);
deck.castShadow = true;
deck.receiveShadow = true;
ship.add(deck);

/*
    CONTAINERS
*/
const TOTAL_CONTAINERS = 24;

const BLUE = 0x4d79ff;
const GREEN = 0x3ddc84;

const shipContainers = [];
const shipCols = 4;
const shipRows = 4;
const shipLevels = 2;

const containerWidth = 3;
const containerHeight = 1.21;
const containerDepth = 1.28;

const spacingX = 3.2;
const spacingZ = 1.5;
const spacingY = 1.3;

const offsetX = -((shipCols - 1) * spacingX) / 2 + 0.8;
const offsetZ = -((shipRows - 1) * spacingZ) / 2;
const baseY = 1.6;

const colors = [0xff4d4d, 0x3ddc84, 0x4d79ff, 0xffcc33, 0xff884d];

let created = 0;

const shipLayout = [
  [
    ["B", "B", "B", "B"],
    ["B", "B", "G", "G"],
    ["B", "B", "G", "G"],
    ["B", "B", "G", "G"]
  ],
  [
    ["B", "B", "G", "G"],
    ["B", "B", null, "G"],
    [null, null, null, null],
    [null, null, "G", null]
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
    PIER DE RECEBIMENTO 5x2
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
const pierRows = 6;
const pierLevels = 2;


// posição containers no pier pós animação
const pierSpacingX = 1.7;
const pierSpacingZ = 1.7;
const pierSpacingY = 1.05;

const pierOffsetX = -((pierCols - 1) * pierSpacingX) / 2;
const pierOffsetZ = -((pierRows - 1) * pierSpacingZ) / 2;

/*
    POSIÇÃO INICIAL
*/
ship.position.set(-14, 0.3, -11);

/*
    ESTADOS
*/
let state = "moving";
let currentIndex = 0;
const startX = -12;

/*
    ÁGUA
*/
// function updateWater(time) {
//   const pos = water.geometry.attributes.position;

//   for (let i = 0; i < pos.count; i++) {
//     const x = pos.getX(i);
//     const y = pos.getY(i);

//     const wave1 = Math.sin(x * 0.18 + time * 1.4) * 0.18;
//     const wave2 = Math.cos(y * 0.22 + time * 1.1) * 0.14;
//     const wave3 = Math.sin((x + y) * 0.12 + time * 1.8) * 0.08;
//     const wave4 = Math.cos((x - y) * 0.16 + time * 1.5) * 0.06;

//     pos.setZ(i, wave1 + wave2 + wave3 + wave4);
//   }

//   pos.needsUpdate = true;
//   water.geometry.computeVertexNormals();
// }

/*
    DESCARGA
*/
let activeMove = null;

function unloadContainers() {
  if (currentIndex >= shipContainers.length) return;

  const box = shipContainers[currentIndex];

  // cria o movimento uma única vez para o container atual
  if (!activeMove) {
    if (box.parent === ship) {
      const worldPos = new THREE.Vector3();
      box.getWorldPosition(worldPos);
  
      ship.remove(box);
      scene.add(box);
      box.position.copy(worldPos);
    }

    const splitPerLevel = 10; // 10 embaixo, 10 em cima
  
    const level = currentIndex < splitPerLevel ? 0 : 1;
    const localIndex = currentIndex < splitPerLevel ? currentIndex : currentIndex - splitPerLevel;
  
    const col = Math.floor(localIndex / pierCols);
    const row = localIndex % pierCols;
  
    const target = new THREE.Vector3(
      pierBase.position.x + pierOffsetX + col * pierSpacingX,
      pierBase.position.y + 1.35 + level * pierSpacingY,
      pierBase.position.z + pierOffsetZ + row * pierSpacingZ
    );

    activeMove = {
      box,
      target,
      phase: "up",
      liftHeight: 4.5 // altura a cima de outro container
    };
  }

  const { box: movingBox, target, phase, liftHeight } = activeMove;
  const speed = 0.08;

  if (phase === "up") {
    movingBox.position.y += (liftHeight - movingBox.position.y) * speed;

    if (Math.abs(movingBox.position.y - liftHeight) < 0.05) {
      movingBox.position.y = liftHeight;
      activeMove.phase = "horizontal";
    }
  }

  else if (phase === "horizontal") {
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

  else if (phase === "down") {
    movingBox.position.y += (target.y - movingBox.position.y) * speed;

    if (Math.abs(movingBox.position.y - target.y) < 0.05) {
      movingBox.position.y = target.y;
      currentIndex++;
      activeMove = null;
    }
  }
}

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
        box.position.copy(box.userData.originalPosition);
      });

      currentIndex = 0;
      state = "moving";
    }
  }
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

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