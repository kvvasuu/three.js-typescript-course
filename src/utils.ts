import { Mesh, MeshStandardMaterial, Object3D, Vector3, Box3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Pallet extends Mesh {
  width: number;
  length: number;
  height: number;
  isVisible: boolean = true;
  model?: Object3D;

  constructor(width: number = 0.8, length: number = 1.2, height: number = 0.6) {
    super();
    this.width = width;
    this.length = length;
    this.height = height;
  }

  toggleVisible() {
    this.visible = !this.visible;
  }

  toggleWireframe() {
    (this.material as MeshStandardMaterial).wireframe = !(
      this.material as MeshStandardMaterial
    ).wireframe;
  }

  setModel(model: Object3D) {
    this.model = model;
    this.add(model);
  }

  fitModelToDimensions() {
    if (!this.model) return;

    const sizee = new Vector3(this.width, this.length, this.height);

    const box = new Box3().setFromCenterAndSize(this.position, sizee);
    const size = new Vector3();
    box.getSize(size);

    const scaleX = this.width / 0.8;
    const scaleZ = this.length / 1.2;
    const scaleY = 1;

    console.log(scaleX);

    this.model.scale.set(scaleX, scaleY, scaleZ);

    console.log(this.model);
  }

  updateDimensions(width: number, length: number) {
    this.width = width;
    this.length = length;
    this.fitModelToDimensions();
  }
}

export function arrangePallets(
  trailerWidth: number,
  trailerLength: number,
  pallets: Pallet[]
): Pallet[] {
  let currentX = 0,
    currentZ = 0;
  let rowMaxDepth = 0;
  let placedPallets: Pallet[] = [];

  for (let pallet of pallets) {
    const { width, length } = pallet;

    if (currentX + width > trailerWidth) {
      currentX = 0;
      currentZ += rowMaxDepth;
      rowMaxDepth = 0;
    }

    if (currentZ + length > trailerLength) break;

    pallet.position.set(currentX + width / 2, 0, currentZ + length / 2);

    currentX += width;
    rowMaxDepth = Math.max(rowMaxDepth, length);

    placedPallets.push(pallet);
  }

  return placedPallets;
}

export async function loadModels() {
  const loader = new GLTFLoader();
  const [...model] = await Promise.all([
    loader.loadAsync("/models/layler/paleta.glb"),
    loader.loadAsync("/models/layler/bags.glb"),
  ]);

  const palletModel = model[0].scene.children[0] as Mesh;
  const bagsModel = model[1].scene.children[0] as Mesh;

  return { palletModel, bagsModel };
}
