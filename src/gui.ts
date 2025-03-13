import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { data, createPalletObjects } from "./layler";

const gui = new GUI();

const palletFolder = gui.addFolder("Pallets");

palletFolder
  .add(data, "palletNumber", 1, 100, 1)
  .name("Pallets number")
  .onChange(() => {
    data.updatePalletQuantity();
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

export default gui;
