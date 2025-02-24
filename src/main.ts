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

let activeScene = sceneC;
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

/* new OrbitControls(camera, renderer.domElement); */

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();

const cubeA = new THREE.Mesh(
  geometry,
  new THREE.MeshNormalMaterial({ wireframe: true })
);
const cubeB = new THREE.Mesh(geometry, material);
const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.2, 256, 32),
  new THREE.MeshNormalMaterial()
);

const statsDiv = document.getElementById("stats");

const stats = new Stats();
statsDiv?.appendChild(stats.dom);

const gui = new GUI();
sceneA.add(cubeA);
sceneB.add(cubeB);
sceneC.add(torus);

const animation = {
  toggleAnimation: (): void => {
    isZoomingAnimation = !isZoomingAnimation;
  },
};

const sceneFolder = gui.addFolder("Scene");
sceneFolder.add(animation, "toggleAnimation").name("Toggle animation");
sceneFolder.add(setScene, "sceneA").name("Cube A");
sceneFolder.add(setScene, "sceneB").name("Cube B");
sceneFolder.add(setScene, "sceneC").name("Torus");
sceneFolder.open();

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
let isZoomingAnimation = true;

function animate() {
  requestAnimationFrame(animate);

  renderer.render(activeScene, camera);

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

  gui.updateDisplay();
  stats.update();
}

animate();

const hideButton = document.getElementById("hide-ui");
let isUIVisible = true;

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
