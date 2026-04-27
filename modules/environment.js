import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';


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

// luz secundária MUITO fraca
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
directionalLight.position.set(10, 20, 10);

// ambiente escuro
const ambientLight = new THREE.AmbientLight(0x9bbcff, 0.6);

const fillLight = new THREE.DirectionalLight(0x6f8cff, 0.8);
fillLight.position.set(-20, 15, -10);

export { sky, sun, directionalLight, ambientLight, fillLight };
