import { Mesh, MeshStandardMaterial, Color, MathUtils } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Pallet extends Mesh {
  width: number;
  length: number;
  height: number;
  color: Color = new Color(1, 1, 1);
  isVisible: boolean = true;
  hovered: boolean = false;
  clicked: boolean = false;
  defaultYPosition: number = 0.046;

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

  update(delta: number) {
    const selectionColor = brightenColor(this.color.clone(), 2);

    if (this.hovered) {
      !this.clicked
        ? (this.material as MeshStandardMaterial).color.lerp(
            selectionColor,
            delta * 10
          )
        : (this.material as MeshStandardMaterial).color.lerp(
            this.color,
            delta * 10
          );
      this.position.y = MathUtils.lerp(this.position.y, 0.25, delta * 5);
    } else {
      if (!this.clicked) {
        (this.material as MeshStandardMaterial).color.lerp(
          this.color,
          delta * 10
        );
        this.position.y = MathUtils.lerp(this.position.y, 0.124, delta * 5);
      } else {
        (this.material as MeshStandardMaterial).color.lerp(
          this.color,
          delta * 10
        );
      }
    }
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
    // loader.loadAsync("/models/layler/bags.glb"),
  ]);

  const palletModel = model[0].scene.children[0] as Mesh;

  return palletModel;
}

function brightenColor(color: Color, factor: number, minOffset = 0.1): Color {
  return new Color(
    Math.min((color.r + minOffset) * factor, 1),
    Math.min((color.g + minOffset) * factor, 1),
    Math.min((color.b + minOffset) * factor, 1)
  );
}
