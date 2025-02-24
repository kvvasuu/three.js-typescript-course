import "./style.css";
import * as THREE from "three";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "dat.gui";

const sceneA = new THREE.Scene();
sceneA.background = new THREE.Color(0x123456);

const sceneB = new THREE.Scene();
sceneB.background = new THREE.TextureLoader().load(
  "https://sbcode.net/img/grid.png"
);

const sceneC = new THREE.Scene();
sceneC.background = new THREE.CubeTextureLoader()
  .setPath("https://sbcode.net/img/")
  .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

let activeScene = sceneA;
const setScene = {
  sceneA: () => {
    activeScene = sceneA;
  },
  sceneB: () => {
    activeScene = sceneB;
  },
  sceneC: () => {
    activeScene = sceneC;
  },
};

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* new OrbitControls(camera, renderer.domElement); */

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();

const cubeA = new THREE.Mesh(
  geometry,
  new THREE.MeshNormalMaterial({ wireframe: true })
);
const cubeB = new THREE.Mesh(geometry, material);
const cubeC = new THREE.Mesh(geometry, material);

const statsDiv = document.getElementById("stats");

const stats = new Stats();
statsDiv?.appendChild(stats.dom);

const gui = new GUI();
sceneA.add(cubeA);
sceneB.add(cubeB);
sceneC.add(cubeC);

gui.add(setScene, "sceneA").name("Scene A");
gui.add(setScene, "sceneB").name("Scene B");
gui.add(setScene, "sceneC").name("Scene C");

let isZooming = false;

function animate() {
  requestAnimationFrame(animate);

  renderer.render(activeScene, camera);

  cubeC.rotation.x += 0.01;
  cubeC.rotation.y += 0.01;

  if (isZooming) {
    camera.position.z <= 2 ? (isZooming = false) : (camera.position.z -= 0.01);
  } else {
    camera.position.z >= 5 ? (isZooming = true) : (camera.position.z += 0.01);
  }

  gui.updateDisplay();
  stats.update();
}

animate();

const hideButton = document.getElementById("hide-ui");
let isUIVisible = true;

const toggleUI = () => {
  if (isUIVisible) {
    gui.hide();
    statsDiv?.classList.add("hide");
    isUIVisible = false;
  } else {
    gui.show();
    statsDiv?.classList.remove("hide");
    isUIVisible = true;
  }
};

hideButton?.addEventListener("click", toggleUI);
