import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import arrangePalettes from "./utils";

const hideButton = document.getElementById("hide-ui");
let isUIVisible = true;

const statsDiv = document.getElementById("stats");

const toggleUI = () => {
  if (isUIVisible) {
    gui.hide();
    isUIVisible = false;
    statsDiv?.classList.add("hide");
    hideButton?.classList.add("hide");
  } else {
    gui.show();
    isUIVisible = true;
    statsDiv?.classList.remove("hide");
    hideButton?.classList.remove("hide");
  }
};

hideButton?.addEventListener("click", toggleUI);

const scene = new THREE.Scene();
scene.add(new THREE.GridHelper(30, 30));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 3);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const data = {
  floorSize: { x: 13.6, y: 2.6 },
  palletSize: { x: 1.2, y: 0.8 },
};

const palettes = [
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
];

const positions = arrangePalettes(data.floorSize.x, data.floorSize.y, palettes);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(data.floorSize.x, data.floorSize.y),
  new THREE.MeshPhysicalMaterial({ color: "#a86632", roughness: 0.5 })
);
floor.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(floor);

const material = new THREE.MeshNormalMaterial();

positions.forEach((pos) => {
  const geometry = new THREE.BoxGeometry(
    data.palletSize.x,
    0.6,
    data.palletSize.y
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
});

const stats = new Stats();
statsDiv?.appendChild(stats.dom);

const gui = new GUI();

const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "x", -10, 10);
cameraFolder.add(camera.position, "y", -10, 10);
cameraFolder.add(camera.position, "z", -10, 10);
cameraFolder.add(camera, "fov", 0, 180, 0.01).onChange(() => {
  camera.updateProjectionMatrix();
});
cameraFolder.add(camera, "aspect", 0.00001, 10).onChange(() => {
  camera.updateProjectionMatrix();
});
cameraFolder.add(camera, "near", 0.01, 10).onChange(() => {
  camera.updateProjectionMatrix();
});
cameraFolder.add(camera, "far", 0.01, 10).onChange(() => {
  camera.updateProjectionMatrix();
});

cameraFolder.open();

const controls = new OrbitControls(camera, renderer.domElement);

const light = new THREE.AmbientLight(0x404040, 50);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();

  stats.update();
}

animate();
