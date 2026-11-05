/**
 * Finds the box that holds everything visible in an image's pixels (RGBA, as
 * from getImageData). Returns null if the image is entirely transparent.
 */
export function visibleBounds(data: Uint8ClampedArray, width: number, height: number, threshold = 24) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/**
 * The crop that removes a logo's empty transparent margins, or null when there
 * is nothing worth trimming (less than 6% of the width or height would go).
 * A small margin is kept so the artwork never touches the edge.
 */
export function trimCrop(data: Uint8ClampedArray, width: number, height: number) {
  const box = visibleBounds(data, width, height);
  if (!box) return null;
  const empty = (box.minX + (width - 1 - box.maxX)) / width;
  const emptyY = (box.minY + (height - 1 - box.maxY)) / height;
  if (empty < 0.06 && emptyY < 0.06) return null;
  const pad = Math.ceil(Math.max(width, height) * 0.01);
  const left = Math.max(0, box.minX - pad);
  const top = Math.max(0, box.minY - pad);
  const right = Math.min(width - 1, box.maxX + pad);
  const bottom = Math.min(height - 1, box.maxY + pad);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}
