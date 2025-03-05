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
  let x = 0,
    y = 0; // Pozycja startowa

  for (let palette of palettes) {
    const { width, length } = palette;

    // Sprawdzenie, czy paleta mieści się w rzędzie
    if (x + width > trailerWidth) {
      // Nowy rząd
      x = 0;
      y += length;
    }

    // Jeśli nowy rząd wykracza poza długość naczepy, przerywamy
    if (y + length > trailerLength) break;

    // Dodajemy pozycję palety
    positions.push({ x: x + width / 2, y: 0, z: y + length / 2 });

    // Przesuwamy x do następnej pozycji
    x += width;
  }

  return positions;
}

export default arrangePalettes;
