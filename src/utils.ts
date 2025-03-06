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
    currentZ = 0; // Pozycja startowa (X dla szerokości, Z dla długości)
  let rowMaxHeight = 0; // Największa wysokość w bieżącym rzędzie (dla poprawnego przesunięcia Z)

  for (let palette of palettes) {
    const { width, length } = palette;

    // Sprawdzenie, czy paleta mieści się w szerokości naczepy
    if (currentX + width > trailerWidth) {
      // Przejście do nowego rzędu
      currentX = 0;
      currentZ += rowMaxHeight;
      rowMaxHeight = 0; // Reset wysokości dla nowego rzędu
    }

    // Jeśli nowy rząd wykracza poza długość naczepy, kończymy rozmieszczanie
    if (currentZ + length > trailerLength) break;

    // Ustawienie pozycji palety (środek palety jako punkt referencyjny)
    positions.push({
      x: currentX + width / 2,
      y: 0,
      z: currentZ + length / 2,
    });

    // Przesunięcie X w prawo
    currentX += width;

    // Aktualizacja największej wysokości w bieżącym rzędzie
    rowMaxHeight = Math.max(rowMaxHeight, length);
  }

  return positions;
}

export default arrangePalettes;
