import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

/*
    CENA
*/
const scene = new THREE.Scene();

/*
    CÂMERA
*/
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 10, -15);
camera.lookAt(2, 4, 5);

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
const waterGeometry = new THREE.PlaneGeometry(180, 180, 220, 220);

const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1f6fb2,
  metalness: 0.05,
  roughness: 0.18,
  transmission: 0.0,
  transparent: true,
  opacity: 0.9,
  ior: 1.33,
  reflectivity: 0.9,
  clearcoat: 1.0,
  clearcoatRoughness: 0.12,
  sheen: 0.3,
  sheenColor: new THREE.Color(0x9fd6ff)
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.receiveShadow = true;
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
const TOTAL_CONTAINERS = 20;

const shipContainers = [];
const shipCols = 4;
const shipRows = 4;
const shipLevels = 2;

const containerWidth = 1.5;
const containerHeight = 1.0;
const containerDepth = 1;

const spacingX = 1.8;
const spacingZ = 1.5;
const spacingY = 1.1;

const offsetX = -((shipCols - 1) * spacingX) / 2 + 0.8;
const offsetZ = -((shipRows - 1) * spacingZ) / 2;
const baseY = 1.6;

const colors = [0xff4d4d, 0x3ddc84, 0x4d79ff, 0xffcc33, 0xff884d];

let created = 0;


// primeiro andar inteiro
for (let row = 0; row < shipRows; row++) {
  for (let col = 0; col < shipCols; col++) {
    if (created >= TOTAL_CONTAINERS) break;

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth),
      new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    );

    box.position.set(
      offsetX + col * spacingX,
      baseY,
      offsetZ + row * spacingZ
    );

    box.castShadow = true;
    box.receiveShadow = true;

    ship.add(box);
    shipContainers.push(box);
    box.userData.originalPosition = box.position.clone();

    created++;
  }
}

// segundo andar, só até completar 20
for (let row = 0; row < shipRows; row++) {
  for (let col = 0; col < shipCols; col++) {
    if (created >= TOTAL_CONTAINERS) break;

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth),
      new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    );

    box.position.set(
      offsetX + col * spacingX,
      baseY + spacingY,
      offsetZ + row * spacingZ
    );

    box.castShadow = true;
    box.receiveShadow = true;

    ship.add(box);
    shipContainers.push(box);
    box.userData.originalPosition = box.position.clone();

    created++;
  }
}

/*
    TEXTO
*/
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 256;

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.font = 'bold 100px Arial';
ctx.textAlign = 'center';
ctx.fillText('RAFT', 256, 150);

const texture = new THREE.CanvasTexture(canvas);

const text = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 2),
  new THREE.MeshBasicMaterial({ map: texture, transparent: true })
);

text.position.set(0, 0.6, 4.05);
text.rotation.x = -0.2;
ship.add(text);

/*
    PORTO / CAIS
*/
const port = new THREE.Group();
scene.add(port);

// plataforma principal do cais
const quay = new THREE.Mesh(
  new THREE.BoxGeometry(26, 1.2, 14),
  new THREE.MeshPhongMaterial({ color: 0x8d939c })
);
quay.position.set(11.5, 0.6, 0);
quay.receiveShadow = true;
quay.castShadow = true;
port.add(quay);

// borda do cais
const quayEdge = new THREE.Mesh(
  new THREE.BoxGeometry(26, 0.35, 1.2),
  new THREE.MeshPhongMaterial({ color: 0xc2c7ce })
);
quayEdge.position.set(11.5, 1.28, -6.4);
quayEdge.castShadow = true;
port.add(quayEdge);

// muro traseiro
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(26, 2.2, 0.5),
  new THREE.MeshPhongMaterial({ color: 0x717780 })
);
backWall.position.set(11.5, 1.7, 6.7);
backWall.castShadow = true;
port.add(backWall);

// faixa amarela de segurança
const safetyLine = new THREE.Mesh(
  new THREE.BoxGeometry(25, 0.03, 0.22),
  new THREE.MeshBasicMaterial({ color: 0xffd400 })
);
safetyLine.position.set(11.5, 1.22, -5.5);
port.add(safetyLine);

// defensas do cais
for (let i = 0; i < 8; i++) {
  const fender = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 1.2, 16),
    new THREE.MeshPhongMaterial({ color: 0x1e1e1e })
  );
  fender.rotation.z = Math.PI / 2;
  fender.position.set(1.5 + i * 2.8, 0.45, -6.75);
  port.add(fender);
}

// postes de luz
for (let i = 0; i < 4; i++) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 5.5, 12),
    new THREE.MeshPhongMaterial({ color: 0x5f6670 })
  );
  pole.position.set(3 + i * 6, 3, 5.2);
  pole.castShadow = true;
  port.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.25, 1.2),
    new THREE.MeshPhongMaterial({ color: 0xd9dde2, emissive: 0x222222 })
  );
  lamp.position.set(3 + i * 6, 5.8, 5.2);
  lamp.castShadow = true;
  port.add(lamp);
}

// galpão simples decorativo
const warehouse = new THREE.Mesh(
  new THREE.BoxGeometry(6, 3.5, 3.2),
  new THREE.MeshPhongMaterial({ color: 0xa65f3c })
);
warehouse.position.set(20.5, 2.35, 4.6);
warehouse.castShadow = true;
warehouse.receiveShadow = true;
port.add(warehouse);

const warehouseRoof = new THREE.Mesh(
  new THREE.BoxGeometry(6.4, 0.25, 3.6),
  new THREE.MeshPhongMaterial({ color: 0x6d2f1f })
);
warehouseRoof.position.set(20.5, 4.2, 4.6);
warehouseRoof.castShadow = true;
port.add(warehouseRoof);

// containers decorativos no porto
const portColors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12];
for (let i = 0; i < 6; i++) {
  const deco = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1, 1),
    new THREE.MeshPhongMaterial({
      color: portColors[i % portColors.length]
    })
  );
  deco.position.set(16 + (i % 3) * 1.8, 1.7 + Math.floor(i / 3) * 1.05, 1.8);
  deco.castShadow = true;
  port.add(deco);
}

/*
    PIER DE RECEBIMENTO 5x2
*/
const pier = new THREE.Group();
scene.add(pier);

const pierBase = new THREE.Mesh(
  new THREE.BoxGeometry(10.5, 0.8, 10.5),
  new THREE.MeshPhongMaterial({ color: 0x9b7b55 })
);
pierBase.position.set(9, 0.4, 0);
pier.add(pierBase);
// marcações de posição 5x2
const pierCols = 5;
const pierRows = 5;
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
ship.position.set(-14, 0.3, -4.3);

/*
    ESTADOS
*/
let state = "moving";
let currentIndex = 0;
const startX = -12;

/*
    ÁGUA
*/
function updateWater(time) {
  const pos = water.geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const wave1 = Math.sin(x * 0.18 + time * 1.4) * 0.18;
    const wave2 = Math.cos(y * 0.22 + time * 1.1) * 0.14;
    const wave3 = Math.sin((x + y) * 0.12 + time * 1.8) * 0.08;
    const wave4 = Math.cos((x - y) * 0.16 + time * 1.5) * 0.06;

    pos.setZ(i, wave1 + wave2 + wave3 + wave4);
  }

  pos.needsUpdate = true;
  water.geometry.computeVertexNormals();
}

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
  
    const col = localIndex % pierCols;
    const row = Math.floor(localIndex / pierCols);
  
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
  updateWater(time);

  ship.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;

  const speed = 0.04;
  const shipHalf = 6.8;
  const quayHalf = 26 / 2;
  const quayEdgeX = quay.position.x - quayHalf;
  const pierHalf = 10.5 / 2;
  const pierFrontX = pierBase.position.x - pierHalf;
  const stopPoint = quayEdgeX - shipHalf - 0.2;

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

  water.material.color.setHSL(
    0.58,
    0.65,
    0.38 + Math.sin(time * 0.8) * 0.015
  );

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