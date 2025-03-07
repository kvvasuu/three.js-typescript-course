import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import Stats from "three/addons/libs/stats.module.js";

const scene = new THREE.Scene();

new RGBELoader().load("img/venice_sunset_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
  scene.backgroundBlurriness = 1.0;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2, 1, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.y = 0.75;
controls.enableDamping = true;

const loader = new GLTFLoader();
loader.load("models/suv_body.glb", (gltf) => {
  scene.add(gltf.scene);
});
loader.load("models/suv_wheel.glb", (gltf) => {
  gltf.scene.position.set(-0.65, 0.2, -0.77);
  scene.add(gltf.scene);
});
loader.load("models/suv_wheel.glb", (gltf) => {
  gltf.scene.position.set(0.65, 0.2, -0.77);
  gltf.scene.rotateY(Math.PI);
  scene.add(gltf.scene);
});
loader.load("models/suv_wheel.glb", (gltf) => {
  gltf.scene.position.set(-0.65, 0.2, 0.57);
  scene.add(gltf.scene);
});
loader.load("models/suv_wheel.glb", (gltf) => {
  gltf.scene.position.set(0.65, 0.2, 0.57);
  gltf.scene.rotateY(Math.PI);
  scene.add(gltf.scene);
});

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);

  stats.update();
}

animate();
