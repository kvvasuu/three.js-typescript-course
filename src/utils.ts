import { Mesh, MeshStandardMaterial } from "three";

export class Pallet extends Mesh {
  width: number = 0.8;
  length: number = 1.2;
  height: number = 0.6;
  isVisible: boolean = true;

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
}

function arrangePallets(
  trailerWidth: number,
  trailerLength: number,
  pallets: Pallet[],
  palletsPlaced: number = 0
) {
  let currentX = 0,
    currentZ = 0;
  let rowMaxHeight = 0;

  for (let pallet of pallets) {
    const { width, length } = pallet;

    if (currentX + width > trailerWidth) {
      currentX = 0;
      currentZ += rowMaxHeight;
      rowMaxHeight = 0;
    }

    if (currentZ + length > trailerLength) break;

    pallet.position.x = currentX + width / 2;
    pallet.position.y = 0;
    pallet.position.z = currentZ + length / 2;

    currentX += width;

    rowMaxHeight = Math.max(rowMaxHeight, length);
    palletsPlaced++;
  }

  return pallets.splice(0, palletsPlaced);
}

export default arrangePallets;
