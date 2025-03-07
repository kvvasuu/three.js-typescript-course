import "./style.css";
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import arrangePalettes from "./utils";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const hideButton = document.getElementById("hide-ui");
let isUIVisible = true;

const toggleUI = () => {
  if (isUIVisible) {
    gui.hide();
    isUIVisible = false;
    hideButton?.classList.add("hide");
  } else {
    gui.show();
    isUIVisible = true;
    hideButton?.classList.remove("hide");
  }
};

hideButton?.addEventListener("click", toggleUI);

const scene = new THREE.Scene();

const hdr = "https://sbcode.net/img/spruit_sunrise_1k.hdr";

let environmentTexture: THREE.DataTexture;

new RGBELoader().load(hdr, (texture) => {
  environmentTexture = texture;
  environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = environmentTexture;
  scene.background = environmentTexture;
  scene.environmentRotation = new THREE.Euler(0, 160, 0);
  scene.backgroundRotation = new THREE.Euler(0, 160, 0);
  scene.backgroundBlurriness = 0.1;
  scene.environmentIntensity = 0.2; // added in Three r163
});

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  floorSize: { width: 2.5, length: 13.6 },
  palletNumber: 2,
  palletWidth: 0.8,
  palletLength: 1.2,
  palletHeight: 1.2,
  palettes: [
    { width: 0.8, length: 1.2 },
    { width: 0.8, length: 1.2 },
  ],
  changePalletQuantity: function () {
    this.palettes = Array.from({ length: this.palletNumber }, () => {
      return { width: this.palletWidth, length: this.palletLength };
    });
  },
  changePalletWidth: function (width: number) {
    this.palletWidth = width;
    this.changePalletQuantity();
  },
  changePalletLength: function (length: number) {
    this.palletLength = length;
    this.changePalletQuantity();
  },
  changePalletHeight: function (height: number) {
    this.palletHeight = height;
    this.changePalletQuantity();
  },
  isWireframe: false,
  toggleWireframe: function () {
    this.isWireframe = !this.isWireframe;
    createPalletObjects();
  },
  isVisible: true,
  toggleVisible: function () {
    this.isVisible = !this.isVisible;
    createPalletObjects();
  },
};

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(data.floorSize.width, data.floorSize.length),
  new THREE.MeshStandardMaterial({ color: "#e3975b", roughness: 0.5 })
);
floor.name = "floor";
floor.rotation.x = THREE.MathUtils.degToRad(-90);
floor.position.z = 6.8;
floor.position.x = data.floorSize.width / 2;
floor.receiveShadow = true;
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

const allPallets = new THREE.Group();

let palletModel: any = null;

const loader = new GLTFLoader();

loader.load(
  "/models/layler/paleta.glb",
  function (gltf) {
    const model = gltf.scene;
    palletModel = model.children[0];
    createPalletObjects();
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const createPalletObjects = () => {
  allPallets.remove(...allPallets.children);

  const positions = arrangePalettes(
    data.floorSize.width,
    data.floorSize.length,
    data.palettes
  );

  positions.forEach((pos, index) => {
    if (palletModel) {
      palletModel.width = data.palletWidth - 0.02;
      palletModel.length = data.palletLength - 0.02;

      palletModel.scale.x = data.palletWidth / 0.8 - 0.02;
      palletModel.scale.z = data.palletLength / 1.2 - 0.02;

      palletModel.position.set(pos.x, pos.y + 0.046, pos.z);
      palletModel.material = new THREE.MeshStandardMaterial({
        color: "#85560c",
      });
      palletModel.castShadow = true;
      palletModel.receiveShadow = true;

      const material = new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        roughness: 0.5,
        wireframe: data.isWireframe,
      });

      const geometry = new THREE.BoxGeometry(
        data.palletWidth - 0.02,
        data.palletHeight,
        data.palletLength - 0.02
      );

      const palletContent = new THREE.Mesh(geometry, material);
      palletContent.position.set(
        pos.x,
        pos.y + data.palletHeight / 2 + 0.1,
        pos.z
      );
      palletContent.name = `pallet_${index + 1}`;

      palletContent.castShadow = !data.isWireframe;
      palletContent.receiveShadow = !data.isWireframe;
      palletContent.visible = data.isVisible;

      const wholePallet = new THREE.Group();
      wholePallet.add(palletModel.clone());
      wholePallet.add(palletContent);
      allPallets.add(wholePallet);
      scene.add(allPallets);
    }
  });
};

const gui = new GUI();

const palletFolder = gui.addFolder("Pallets");

palletFolder
  .add(data, "palletNumber", 1, 100, 1)
  .name("Pallets number")
  .onChange(() => {
    data.changePalletQuantity();
    createPalletObjects();
  });
palletFolder
  .add(data, "palletWidth", 0.4, 2.5, 0.1)
  .name("Pallets width")
  .onChange((number) => {
    data.changePalletWidth(number);

    createPalletObjects();
  });
palletFolder
  .add(data, "palletLength", 0.4, 2.5, 0.1)
  .name("Pallets length")
  .onChange((number) => {
    data.changePalletLength(number);
    createPalletObjects();
  });
palletFolder
  .add(data, "palletHeight", 0.2, 2, 0.1)
  .name("Pallets height")
  .onChange((number) => {
    data.changePalletHeight(number);
    createPalletObjects();
  });
palletFolder.add(data, "toggleWireframe").name("Toggle wireframe");
palletFolder.add(data, "toggleVisible").name("Toggle visibility");

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.copy(floor.position);
controls.update();

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.z = -2;
directionalLight.position.x = -2;

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();
}

animate();

const raycaster = new THREE.Raycaster();

document.addEventListener("mousedown", (event: MouseEvent) => {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);

  const intersections = raycaster.intersectObjects(allPallets.children, true);
  if (intersections.length > 0) {
    const selectedObject = intersections[0].object;

    if (selectedObject instanceof THREE.Mesh) {
      let randomColor = new THREE.Color(
        Math.random(),
        Math.random(),
        Math.random()
      );

      if (selectedObject.name.includes("pallet") && selectedObject.visible) {
        const existingDialog = document.getElementById("custom-dialog");
        if (existingDialog) {
          existingDialog.remove();
        }

        const boundingBox = new THREE.Box3().setFromObject(selectedObject);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        const dialog = document.createElement("div");
        dialog.id = "custom-dialog";
        dialog.innerHTML = `
            <p class="pallet-name"><strong>${selectedObject.name
              .replace("_", " ")
              .toUpperCase()}</strong></p>
            <p><strong>Width: </strong>${Math.round(size.x * 10) / 10}</p>
            <p><strong>Length: </strong>${Math.round(size.y * 10) / 10}</p>
            
        `;
        dialog.classList.add("pallet-dialog");
        dialog.style.backgroundColor = `#${selectedObject.material.color.getHexString()}`;
        dialog.style.position = "absolute";
        dialog.style.left = `${event.clientX}px`;
        dialog.style.top = `${event.clientY}px`;

        const button = document.createElement("button");
        button.id = "change-pallet-color";
        button.textContent = "Change color";
        button.style.backgroundColor = `#${randomColor.getHexString()}`;
        button.addEventListener("click", () => {
          selectedObject.material.color = randomColor;
          randomColor = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
          );
          button.style.backgroundColor = `#${randomColor.getHexString()}`;
          dialog.style.backgroundColor = `#${selectedObject.material.color.getHexString()}`;
        });
        dialog.appendChild(button);
        document.body.appendChild(dialog);

        const closeDialog = (e: MouseEvent) => {
          if (!dialog.contains(e.target as Node)) {
            dialog.remove();
            document.removeEventListener("click", closeDialog);
          }
        };

        setTimeout(() => {
          document.addEventListener("click", closeDialog);
        }, 100);
      }
    }
  }
});
