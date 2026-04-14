import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
/*
    CENA
*/
const scene = new THREE.Scene();

/*
    CÂMERA
*/
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 14);

/*
    RENDER
*/
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/*
    CÉU
*/
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(100, 32, 32),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) }
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
scene.add(new THREE.DirectionalLight(0xffffff, 1).position.set(10,20,10));
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

/*
    ÁGUA
*/
const waterGeometry = new THREE.PlaneGeometry(120, 120, 120, 120);

const waterMaterial = new THREE.MeshPhongMaterial({
  color: 0x0b3d91,
  transparent: true,
  opacity: 0.9,
  shininess: 80
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
scene.add(water);

/*
    BARCO
*/
const ship = new THREE.Group();
scene.add(ship);

// casco formato \___/
const hullGeometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
  -7,0,1.2,  -7,0,-1.2,
  -5,-1.3,0.7,  -5,-1.3,-0.7,
   5,-1.3,0.7,   5,-1.3,-0.7,
   7,0,1.2,   7,0,-1.2
]);

const indices = [
  0,2,4,0,4,6,
  1,3,5,1,5,7,
  2,3,5,2,5,4,
  0,1,7,0,7,6,
  0,1,3,0,3,2,
  6,7,5,6,5,4
];

hullGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
hullGeometry.setIndex(indices);
hullGeometry.computeVertexNormals();

const hull = new THREE.Mesh(
  hullGeometry,
  new THREE.MeshPhongMaterial({ color: 0x061a3a, shininess: 30 })
);

hull.position.y = 0.5;
ship.add(hull);

/*
    CONTAINERS
*/
const colors = [0xff0000,0x00ff00,0x0000ff,0xffff00,0xff8800];

let count = 0;
const containers = [];

for (let x = -5; x <= 5; x += 1.6) {
  for (let y = 1.2; y <= 2.6; y += 1.2) {
    if (count >= 20) break;

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1,1,1),
      new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random()*colors.length)]
      })
    );

    box.position.set(x, y, 0);
    ship.add(box);
    containers.push(box);

    // salva posição original
    box.userData.originalPosition = box.position.clone();

    count++;
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
  new THREE.PlaneGeometry(4,2),
  new THREE.MeshBasicMaterial({ map: texture, transparent: true })
);

text.position.set(0,0.5,1.01);
ship.add(text);

/*
    PORTO
*/
const dockWidth = 14;

const dock = new THREE.Mesh(
  new THREE.BoxGeometry(dockWidth, 1, 4),
  new THREE.MeshPhongMaterial({ color: 0x8B4513 })
);

dock.position.set(6, 0.5, 1.5);
scene.add(dock);

/*
    POSIÇÃO INICIAL
*/
ship.position.set(-12, 0.3, 1.5);

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

    pos.setZ(i,
      Math.sin(x * 0.2 + time) * 0.1 +
      Math.cos(y * 0.2 + time) * 0.1
    );
  }

  pos.needsUpdate = true;
}

/*
    DESCARGA
*/
function unloadContainers() {
  if (currentIndex >= containers.length) return;

  const box = containers[currentIndex];

  if (box.parent === ship) {
    const worldPos = new THREE.Vector3();
    box.getWorldPosition(worldPos);

    ship.remove(box);
    scene.add(box);

    box.position.copy(worldPos);
  }

  const cols = 5;
  const spacing = 1.05;

  const col = currentIndex % cols;
  const row = Math.floor(currentIndex / cols);

  const centerOffset = -(cols - 1) * spacing / 2;

  const target = new THREE.Vector3(
    dock.position.x + centerOffset + col * spacing,
    dock.position.y + 1.05,
    dock.position.z + row * spacing - 1
  );

  box.position.lerp(target, 0.08);

  if (box.position.distanceTo(target) < 0.1) {
    currentIndex++;
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
  const shipHalf = 7;
  const dockHalf = dockWidth / 2;

  const dockStart = dock.position.x - dockHalf;
  const stopPoint = dockStart - shipHalf;

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

    if (currentIndex >= containers.length) {
      state = "returning";
    }
  }

  else if (state === "returning") {
    if (ship.position.x > startX) {
      ship.position.x -= speed;

      containers.forEach(box => {
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

      containers.forEach(box => {
        box.position.copy(box.userData.originalPosition);
      });

      currentIndex = 0;
      state = "moving";
    }
  }

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