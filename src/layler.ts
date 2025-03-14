import "./style.css";
import {
  Scene,
  DataTexture,
  EquirectangularReflectionMapping,
  Euler,
  GridHelper,
  PerspectiveCamera,
  WebGLRenderer,
  PCFSoftShadowMap,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  MathUtils,
  Color,
  BoxGeometry,
  Group,
  Raycaster,
  Vector2,
  DirectionalLight,
  Clock,
} from "three";
import { Pallet, arrangePallets, loadModels } from "./utils";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import hdr from "/img/zwartkops_pit_1k.hdr";

const scene = new Scene();

let environmentTexture: DataTexture;

new RGBELoader().load(hdr, (texture) => {
  environmentTexture = texture;
  environmentTexture.mapping = EquirectangularReflectionMapping;
  scene.environment = environmentTexture;
  scene.background = environmentTexture;
  scene.environmentRotation = new Euler(0, 160, 0);
  scene.backgroundRotation = new Euler(0, 160, 0);
  scene.backgroundBlurriness = 0.06;
  scene.environmentIntensity = 0.2;
});

const grid = new GridHelper(30, 30);
grid.position.z = 6.8;
grid.position.y = -0.01;
scene.add(grid);

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

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
  trailerWidth: 2.5,
  trailerLength: 13.6,
  palletNumber: 1,
  palletWidth: 0.8,
  palletLength: 1.2,
  palletHeight: 0.6,
  pallets: [new Pallet()],
  updatePalletQuantity: function () {
    let palletsToArrange: Pallet[] = [];

    if (this.palletNumber === this.pallets.length) {
      palletsToArrange = [...this.pallets];
    } else if (this.palletNumber < this.pallets.length) {
      palletsToArrange = [...this.pallets].splice(0, this.palletNumber);
    } else {
      const palletsToAdd = Array.from(
        { length: this.palletNumber - this.pallets.length },
        () => {
          return new Pallet(
            this.palletWidth,
            this.palletLength,
            this.palletHeight
          );
        }
      );

      palletsToArrange = [...[...this.pallets], ...palletsToAdd];
    }
    this.pallets = arrangePallets(
      this.trailerWidth,
      this.trailerLength,
      palletsToArrange
    );
  },
  changePalletWidth: function (width: number) {
    this.palletWidth = width;
    this.pallets.forEach((pallet) => (pallet.width = width));
  },
  changePalletLength: function (length: number) {
    this.palletLength = length;
    this.pallets.forEach((pallet) => (pallet.length = length));
  },
  changePalletHeight: function (height: number) {
    this.palletHeight = height;
    this.pallets.forEach((pallet) => (pallet.height = height));
  },
  toggleWireframe: function () {
    this.pallets.forEach((pallet) => pallet.toggleWireframe());
  },
  toggleVisible: function () {
    this.pallets.forEach((pallet) => pallet.toggleVisible());
  },
};

data.updatePalletQuantity();

const floor = new Mesh(
  new PlaneGeometry(data.trailerWidth, data.trailerLength),
  new MeshStandardMaterial({ color: "#e3975b", roughness: 0.5 })
);
floor.name = "floor";
floor.rotation.x = MathUtils.degToRad(-90);
floor.position.z = 6.8;
floor.position.x = data.trailerWidth / 2;
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

const allPallets = new Group();

const palletModel = await loadModels();

const createPalletObjects = () => {
  allPallets.remove(...allPallets.children);

  data.updatePalletQuantity();

  data.pallets.forEach((pallet, index) => {
    if (palletModel) {
      palletModel.scale.x = pallet.width / 0.8 - 0.02;
      palletModel.scale.z = pallet.length / 1.2 - 0.02;

      palletModel.position.set(
        pallet.position.x,
        pallet.position.y + 0.046,
        pallet.position.z
      );
      palletModel.material = new MeshStandardMaterial({
        color: "#85560c",
      });
      palletModel.castShadow = true;
      palletModel.receiveShadow = true;

      const isColorWhite =
        (pallet.material as MeshStandardMaterial).color.b ===
          new Color(1, 1, 1).b &&
        (pallet.material as MeshStandardMaterial).color.g ===
          new Color(1, 1, 1).g &&
        (pallet.material as MeshStandardMaterial).color.r ===
          new Color(1, 1, 1).r;

      const material = new MeshStandardMaterial({
        color: !isColorWhite
          ? (pallet.material as MeshStandardMaterial).color
          : colors[index % colors.length],
        roughness: 0.5,
      });

      const geometry = new BoxGeometry(
        pallet.width - 0.02,
        pallet.height,
        pallet.length - 0.02
      );

      pallet.color = new Color(colors[index % colors.length]);
      pallet.material = material;
      pallet.geometry = geometry;
      pallet.position.set(
        pallet.position.x,
        pallet.position.y + data.palletHeight / 2 + 0.1,
        pallet.position.z
      );
      pallet.name = `pallet_${index + 1}`;

      pallet.castShadow = !(pallet.material as MeshStandardMaterial).wireframe;
      pallet.receiveShadow = !(pallet.material as MeshStandardMaterial)
        .wireframe;

      const wholePallet = new Group();
      wholePallet.add(palletModel.clone());
      wholePallet.add(pallet);
      allPallets.add(wholePallet);
      scene.add(allPallets);
    }
  });
};

const gui = new GUI();

gui
  .add(data, "palletNumber", 1, 100, 1)
  .name("Pallets number")
  .onChange(() => {
    data.updatePalletQuantity();
    createPalletObjects();
  });
gui
  .add(data, "palletWidth", 0.4, 2.5, 0.1)
  .name("Pallets width")
  .onChange((number) => {
    data.changePalletWidth(number);
    createPalletObjects();
  });
gui
  .add(data, "palletLength", 0.4, 2.5, 0.1)
  .name("Pallets length")
  .onChange((number) => {
    data.changePalletLength(number);
    createPalletObjects();
  });
gui
  .add(data, "palletHeight", 0.2, 2, 0.1)
  .name("Pallets height")
  .onChange((number) => {
    data.changePalletHeight(number);
    createPalletObjects();
  });
gui.add(data, "toggleWireframe").name("Toggle wireframe");
gui.add(data, "toggleVisible").name("Toggle visibility");

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.copy(floor.position);
controls.update();

const directionalLight = new DirectionalLight(0xffffff, 4);
directionalLight.position.z = -2;
directionalLight.position.x = -2;

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

createPalletObjects();

const raycaster = new Raycaster();

document.addEventListener("mousedown", (event: MouseEvent) => {
  const coords = new Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);

  const intersections = raycaster.intersectObjects(data.pallets, true);
  if (intersections.length > 0) {
    const selectedObject = intersections[0].object as Pallet;

    data.pallets.forEach((p) => (p.clicked = false));

    if (selectedObject instanceof Mesh) {
      if (selectedObject.name.includes("pallet") && selectedObject.visible) {
        const existingDialog = document.getElementById("custom-dialog");
        if (existingDialog) {
          existingDialog.remove();
        }

        selectedObject.clicked = true;

        const dialog = document.createElement("div");
        dialog.id = "custom-dialog";
        dialog.innerHTML = `
            <p class="pallet-name"><strong>${selectedObject.name
              .replace("_", " ")
              .toUpperCase()}</strong></p>
            <p><strong>Width: </strong>${
              Math.round(selectedObject.width * 10) / 10
            }</p>
            <p><strong>Length: </strong>${
              Math.round(selectedObject.length * 10) / 10
            }</p>
            
        `;
        dialog.classList.add("pallet-dialog");
        dialog.style.position = "absolute";
        dialog.style.left = `${event.clientX}px`;
        dialog.style.top = `${event.clientY}px`;

        const widthSlider = document.createElement("input");
        widthSlider.type = "range";
        widthSlider.max = String(data.trailerWidth);
        widthSlider.min = "0.4";
        widthSlider.step = "0.1";
        widthSlider.value = String((selectedObject as Pallet).width);
        widthSlider.addEventListener("input", () => {
          (selectedObject as Pallet).width = Number(widthSlider.value);
          createPalletObjects();
        });
        dialog.appendChild(widthSlider);

        const lengthSlider = document.createElement("input");
        lengthSlider.type = "range";
        lengthSlider.max = String(data.trailerWidth);
        lengthSlider.min = "0.4";
        lengthSlider.step = "0.1";
        lengthSlider.value = String((selectedObject as Pallet).length);
        lengthSlider.addEventListener("input", () => {
          (selectedObject as Pallet).length = Number(lengthSlider.value);
          createPalletObjects();
        });
        dialog.appendChild(lengthSlider);

        const colorInput = document.createElement("input");
        const color = "#" + selectedObject.color.getHexString();
        colorInput.type = "color";
        colorInput.value = color;

        colorInput.addEventListener("input", () => {
          (selectedObject.material as MeshStandardMaterial).color = new Color(
            colorInput.value
          );
          selectedObject.color = new Color(colorInput.value);
        });
        dialog.appendChild(colorInput);
        document.body.appendChild(dialog);

        const closeDialog = (e: MouseEvent) => {
          if (!dialog.contains(e.target as Node)) {
            dialog.remove();
            selectedObject.clicked = false;
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
document.addEventListener("mousemove", (event: MouseEvent) => {
  const coords = new Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);

  const intersections = raycaster.intersectObjects(data.pallets, true);

  data.pallets.forEach((p) => (p.hovered = false));

  intersections.length && ((intersections[0].object as Pallet).hovered = true);
});

const clock = new Clock();
let delta = 0;

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  data.pallets.forEach((p) => {
    p.update(delta);
  });

  renderer.render(scene, camera);
  controls.update();
}

animate();
