/* import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "dat.gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
  .setPath("https://sbcode.net/img/")
  .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

const camera = new THREE.PerspectiveCamera(
  110,
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

new OrbitControls(camera, renderer.domElement);

const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.2, 256, 32),
  new THREE.MeshNormalMaterial()
);

const loader = new GLTFLoader();

let model: any = null;

loader.load(
  "/models/porsche/scene.gltf",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const light = new THREE.AmbientLight(0x404040, 50);
const directionalLight = new THREE.DirectionalLight(0xffffff, 30);
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(100, 1000, 100);

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);
scene.add(directionalLight);
scene.add(light);

const statsDiv = document.getElementById("stats");

const stats = new Stats();
statsDiv?.appendChild(stats.dom);

const gui = new GUI();

//scene.add(torus);

const animation = {
  toggleAnimation: (): void => {
    isZoomingAnimation = !isZoomingAnimation;
  },
  toggleRotation: (): void => {
    isRotating = !isRotating;
  },
};

let params = { rotationSpeed: 0.01 };

const sceneFolder = gui.addFolder("Scene");
sceneFolder.add(animation, "toggleAnimation").name("Toggle animation");
sceneFolder.open();

const rotationFolder = gui.addFolder("Rotation");
rotationFolder.add(animation, "toggleRotation").name("Toggle rotation");
rotationFolder
  .add(params, "rotationSpeed", 0, 0.1, 0.001)
  .name("Rotation Speed");
rotationFolder.open();

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

let isZooming = false;
let isZoomingAnimation = false;

let isRotating = false;

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  if (isZoomingAnimation) {
    if (isZooming) {
      if (camera.position.z <= 2) {
        isZooming = false;
      } else {
        camera.position.z -= 0.01;
        camera.fov += 0.3;
      }
    } else {
      if (camera.position.z >= 5) {
        isZooming = true;
      } else {
        camera.position.z += 0.01;
        camera.fov -= 0.3;
      }
    }
    camera.updateProjectionMatrix();
  }

  if (model && isRotating) {
    model.rotation.y += params.rotationSpeed;
  }

  gui.updateDisplay();
  stats.update();
}

animate();


 */

import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "dat.gui";
//import gsap from "gsap";

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
scene.add(new THREE.GridHelper());

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

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();

const cube = new THREE.Mesh(geometry, material);
cube.position.y = 0.5;
cube.position.x = 1;
scene.add(cube);

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2), material);
torus.position.y = 0.5;
torus.position.x = -1;
scene.add(torus);

camera.lookAt(cube.position);

const stats = new Stats();
statsDiv?.appendChild(stats.dom);

const gui = new GUI();

let targetQuaternion = new THREE.Quaternion();

const cameraActions = {
  cameraLook: true,
  toggleCamera: function () {
    let targetPosition = this.cameraLook
      ? torus.position.clone()
      : cube.position.clone();

    let lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(camera.position, targetPosition, camera.up);

    let targetRotation = new THREE.Quaternion();
    targetRotation.setFromRotationMatrix(lookAtMatrix);

    targetQuaternion.copy(targetRotation);

    this.cameraLook = !this.cameraLook;
  },
};

document.addEventListener("keydown", (ev) => {
  if (ev.key === " ") {
    cameraActions.toggleCamera();
  }
});

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
cameraFolder.add(cameraActions, "toggleCamera");
cameraFolder.open();

cameraActions.toggleCamera();
function animate() {
  requestAnimationFrame(animate);

  camera.quaternion.slerp(targetQuaternion, 0.05);
  renderer.render(scene, camera);

  stats.update();
}

animate();
