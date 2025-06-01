// Pastel color palette in RGB (original hex in comments)
const PASTEL_COLORS_RGB = [
  "165, 216, 255", // #A5D8FF light blue
  "178, 242, 187", // #B2F2BB light green
  "255, 214, 165", // #FFD6A5 light orange
  "255, 173, 173", // #FFADAD light red/pink
  "208, 191, 255", // #D0BFFF light purple
  "255, 243, 191", // #FFF3BF light yellow
  "181, 234, 215", // #B5EAD7 mint
  "255, 218, 193", // #FFDAC1 peach
  "199, 206, 234", // #C7CEEA lavender
  "226, 240, 203", // #E2F0CB pale green
  "241, 192, 232", // #F1C0E8 light magenta
  "181, 185, 255", // #B5B9FF periwinkle
  "243, 176, 195", // #F3B0C3 rose
  "182, 226, 211", // #B6E2D3 teal
  "249, 248, 113", // #F9F871 lemon
];

export function getRandomColor(existingColors: string[]): string {
  let picked =
    PASTEL_COLORS_RGB[Math.floor(Math.random() * PASTEL_COLORS_RGB.length)];

  // if all colors are already used, return any random color
  if (existingColors.length === PASTEL_COLORS_RGB.length) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `${r},${g},${b}`;
  }

  while (existingColors.includes(picked)) {
    picked =
      PASTEL_COLORS_RGB[Math.floor(Math.random() * PASTEL_COLORS_RGB.length)];
  }
  return picked;
}
