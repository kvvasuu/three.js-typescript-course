type palletSize = {
  width: number;
  length: number;
};

function arrangePalettes(
  trailerWidth: number,
  trailerLength: number,
  palettes: palletSize[]
) {
  let positions = [];
  let currentX = 0,
    currentZ = 0;
  let rowMaxHeight = 0;

  for (let palette of palettes) {
    const { width, length } = palette;

    if (currentX + width > trailerWidth) {
      currentX = 0;
      currentZ += rowMaxHeight;
      rowMaxHeight = 0;
    }

    if (currentZ + length > trailerLength) break;

    positions.push({
      x: currentX + width / 2,
      y: 0,
      z: currentZ + length / 2,
    });

    currentX += width;

    rowMaxHeight = Math.max(rowMaxHeight, length);
  }

  return positions;
}

export default arrangePalettes;
