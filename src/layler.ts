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
const grid = new THREE.GridHelper(30, 30);
grid.position.z = 6.8;
grid.position.y = -0.01;
scene.add(grid);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("mousedown", () => {
  canvas.classList.add("grabbing");
});

window.addEventListener("mouseup", () => {
  canvas.classList.remove("grabbing");
});

const data = {
  floorSize: { width: 2.6, length: 13.6 },
  palletSize: { width: 0.8, length: 1.2 },
};

const palettes = [
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
  { width: 0.8, length: 1.2 },
];

const positions = arrangePalettes(
  data.floorSize.width,
  data.floorSize.length,
  palettes
);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(data.floorSize.width, data.floorSize.length),
  new THREE.MeshPhysicalMaterial({ color: "#e3975b", roughness: 0.5 })
);
floor.rotation.x = THREE.MathUtils.degToRad(-90);
floor.position.z = 6.8;
floor.position.x = 1.3;
scene.add(floor);

camera.position.set(-5, 5, 6.8);
camera.lookAt(floor.position);

const colors = [
  "#fa5f5f",
  "#fac15f",
  "#edfa5f",
  "#88fa5f",
  "#5ffacc",
  "#5fd1fa",
  "#5f81fa",
  "#b75ffa",
  "#fa5feb",
  "#fa5f8d",
];

positions.forEach((pos, index) => {
  const geometry = new THREE.BoxGeometry(
    data.palletSize.width - 0.02,
    0.6,
    data.palletSize.length - 0.02
  );

  const material = new THREE.MeshPhysicalMaterial({
    color: colors[index % colors.length],
    roughness: 0.5,
  });

  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(
      data.palletSize.width - 0.02,
      0.1,
      data.palletSize.length - 0.02
    ),
    new THREE.MeshPhysicalMaterial({ color: "#85560c" })
  );
  pallet.position.set(pos.x, pos.y + 0.05, pos.z);

  const palletContent = new THREE.Mesh(geometry, material);
  palletContent.position.set(pos.x, pos.y + 0.4, pos.z);

  const wholePallet = new THREE.Group();
  wholePallet.add(pallet);
  wholePallet.add(palletContent);
  scene.add(wholePallet);
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
controls.target.copy(floor.position);
controls.update();

const light = new THREE.AmbientLight(0x404040, 50);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();

  stats.update();
}

animate();
