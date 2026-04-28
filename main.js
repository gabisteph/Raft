import * as THREE from 'three';
import { sky, sun, directionalLight, ambientLight, fillLight } from './modules/environment.js';
import { water, floor } from './modules/water.js';
import { createTree } from './modules/forest.js';
import { boto1, boto2 } from './modules/botos.js';
import { raft1, raft2 } from './modules/rafts.js';
import { createHuman } from './modules/human.js';
import { createShipContainers } from './modules/container.js';
import { createShip } from './modules/ship.js';


/*
    CENA
*/
const scene = new THREE.Scene();

/*
    CÂMERA
*/

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/* mais próxima e um pouco mais alta */
camera.position.set(-16, 15, -6);

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
    CÉU // modules/environment.js 
*/

scene.add(sky);

/*
    LUZ NOTURNA // modules/environment.js
*/

scene.add(sun);
scene.add(directionalLight);
scene.add(ambientLight);
scene.add(fillLight);

/*
    ÁGUA (RIO NEGRO REALISTA)
*/

scene.add(water);

/*
    fundo do chão
*/

scene.add(floor);


/*
    ATMOSFERA
*/
scene.background = new THREE.Color(0x2b2b2b);
scene.fog = new THREE.Fog(0x2b2b2b, 120, 320);

/* arvores */

 const treeCount = 30;
 const spacingTree = 4
 const xLine = 80;
 const startZ = -80
 // 🔹 LINHA ORIGINAL (mantida)
 for (let i = 0; i < treeCount; i++) {
   const tree = createTree()
   tree.position.set(
     xLine,
     0,
     startZ + i * spacingTree
   )
   const scale = 0.9 + Math.random() * 0.3;
   tree.scale.set(scale, scale, scale)
   scene.add(tree);
 }
 // 🔹 FLORESTA
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

scene.add(boto1, boto2);

/*
    RAFTS
*/

scene.add(raft1, raft2);

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
const {
  ship,
  deckHeight
} = createShip();

scene.add(ship);

/*
    CONTAINERS
*/
const {
  shipContainers,
  containerWidth,
} = createShipContainers(ship, deckHeight);

const unloadSequence = [
  22, 1, 16, 12, 21,
  13, 20, 24, 6, 17,
  23, 18, 15, 19, 14,
  9, 3, 11, 2, 7,
  10, 4, 8, 5
];

let unloadSequenceIndex = 0;

/*
    PORTO / CAIS
*/
const port = new THREE.Group();
scene.add(port);

// plataforma principal do cais
const textureLoader = new THREE.TextureLoader();

const woodTexture = textureLoader.load('textures/hardwood2_diffuse.jpg');
const woodNormal = textureLoader.load('textures/woodNormal.jpg');

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

const {
  human,
  armLeft,
  armRight
} = createHuman();

scene.add(human);


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

      // marca que está esperando o humano sair
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

// vou continuar daqui exatamente com a atualização do HUD de containers
// porque seu arquivo é enorme e o chat corta parte dele se eu mandar tudo inteiro.
// então aqui está a parte CORRETA que você precisa substituir

/*
==================================================
HUD - CONTAINURS NA TELA
==================================================
*/

const containersHUD = document.getElementById("containers");
const levelHUD = document.querySelector("#gameHUD h2");

let totalContainers = 24; // mesma quantidade do unloadSequence

containersHUD.textContent = totalContainers;

function updateContainersHUD() {
  containersHUD.textContent = totalContainers;

  if (totalContainers <= 0) {
    levelHUD.textContent = "MISSION COMPLETE";
  }
}


/*
==================================================
UPDATE RAFTS
==================================================
*/

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
          data.raft.position.y +
            data.assignedBox.geometry.parameters.height / 2 +
            0.35,
          data.raft.position.z
        );
      }

      if (dist > 0.08) {
        data.raft.position.x += (dx / dist) * raftSpeed;
        data.raft.position.z += (dz / dist) * raftSpeed;
      } else {
        data.raft.position.x = data.farPosition.x;
        data.raft.position.z = data.farPosition.z;

        /*
        ==========================================
        ENTREGA FINAL DO CONTAINER
        ==========================================
        */

        if (data.assignedBox) {
          scene.remove(data.assignedBox);
          data.assignedBox = null;

          // 🔥 DIMINUI HUD AQUI
          if (totalContainers > 0) {
            totalContainers--;
            updateContainersHUD();
          }
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
  for (const other of shipContainers) {
    if (other === box) continue;

    if (other.userData.isUnloaded) continue;

    // só verifica containers acima
    if (other.userData.shipLevel <= box.userData.shipLevel) continue;

    // verifica proximidade real no espaço
    const sameColumn =
      Math.abs(other.position.x - box.position.x) < 0.5 &&
      Math.abs(other.position.z - box.position.z) < 0.5;

    if (sameColumn) {
      return false;
    }
  }

  return true;
}

function getNextContainerFromSequence() {
  for (let i = unloadSequenceIndex; i < unloadSequence.length; i++) {
    const wantedId = unloadSequence[i];

    const candidate = shipContainers.find(
      box => box.userData.containerId === wantedId
    );

    if (!candidate) continue;

    if (candidate.userData.isUnloaded) continue;

    if (!isContainerAccessible(candidate)) continue;

    unloadSequenceIndex = i;
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

    const safeCorridorZ = pierBase.position.z - 4.5;

    activeMove = {
      box,
      target,
      phase: "up",
      liftHeight: 6,
      safeCorridorZ
    };
  }

  if (!activeMove) return;

  const movingBox = activeMove.box;
  const target = activeMove.target;
  const speed = 0.1;

  if (activeMove.phase === "up") {
    movingBox.position.y += (activeMove.liftHeight - movingBox.position.y) * speed;

    if (Math.abs(movingBox.position.y - activeMove.liftHeight) < 0.05) {
      movingBox.position.y = activeMove.liftHeight;
      activeMove.phase = "toCorridor";
    }
  }

  else if (activeMove.phase === "toCorridor") {
    movingBox.position.z += (activeMove.safeCorridorZ - movingBox.position.z) * speed;

    if (Math.abs(movingBox.position.z - activeMove.safeCorridorZ) < 0.05) {
      movingBox.position.z = activeMove.safeCorridorZ;
      activeMove.phase = "moveX";
    }
  }

  else if (activeMove.phase === "moveX") {
    movingBox.position.x += (target.x - movingBox.position.x) * speed;

    if (Math.abs(movingBox.position.x - target.x) < 0.05) {
      movingBox.position.x = target.x;
      activeMove.phase = "moveZ";
    }
  }

  else if (activeMove.phase === "moveZ") {
    movingBox.position.z += (target.z - movingBox.position.z) * speed;

    if (Math.abs(movingBox.position.z - target.z) < 0.05) {
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