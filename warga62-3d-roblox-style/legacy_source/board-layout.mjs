// Pentagon route: five corners and five sides, one island per side.
// Corners (index): Mulai 0, Lapas 9, Pajak Tahunan 18, Pengadilan 27, Parkiran Pungli 36.
// Every side holds eight tiles between its two corners (Sumatra 1-8, Kalimantan 10-17, ...).
// All numbers are percentages of a square board. Both functions are stringified into the
// browser page, so they must stay self-contained (no references to module-level values).
export const BOARD_CORNERS = Object.freeze([0, 9, 18, 27, 36]);

export function boardPosition(index) {
  if (!Number.isInteger(index) || index < 0 || index >= 45) throw Error('Indeks papan tidak valid.');
  const cx = 50, R = 49.5, cy = (100 - R * 1.809) / 2 + R, depth = 7.4, corner = 8.6, inset = 7.9, gap = .35, sideTiles = 8;
  const vertex = k => {
    const a = (54 + 72 * (k % 5)) * Math.PI / 180;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  };
  const rect = (x, y, width, height, rotation, extra) => {
    const a = rotation * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
      const px = sx * width / 2, py = sy * height / 2;
      return [x + px * c - py * s, y + px * s + py * c];
    });
    return {x, y, width, height, centroid: [x, y], rotation, points, content: {left: 5, top: 5, width: 90, height: 90}, ...extra};
  };
  const island = Math.floor(index / 9), slot = index % 9;
  if (slot === 0) {
    // Corner tile: an upright square centred on the vertex, pulled slightly towards the middle.
    const [vx, vy] = vertex(island), pull = corner * .35;
    const dx = cx - vx, dy = cy - vy, len = Math.hypot(dx, dy);
    const x = vx + dx / len * pull, y = vy + dy / len * pull;
    return rect(x, y, corner, corner, 0, {corner: true, side: 'corner', island, outer: 'top', pawn: {x, y: y - corner * .1}});
  }
  const from = vertex(island), to = vertex(island + 1);
  const dx = to[0] - from[0], dy = to[1] - from[1], length = Math.hypot(dx, dy), ux = dx / length, uy = dy / length;
  const width = (length - inset * 2) / sideTiles;
  const along = inset + (slot - .5) * width;
  // Inward normal of a clockwise polygon in screen coordinates.
  const nx = -uy, ny = ux;
  const x = from[0] + ux * along + nx * depth / 2, y = from[1] + uy * along + ny * depth / 2;
  // Text never runs upside down: keep the rotation within ±90° and remember which local edge faces outwards.
  let rotation = Math.atan2(uy, ux) * 180 / Math.PI, outer = 'top';
  if (rotation > 90 + 1e-6 || rotation < -90 - 1e-6) { rotation += rotation > 0 ? -180 : 180; outer = 'bottom'; }
  const side = ['bottom', 'left-lower', 'left-upper', 'right-upper', 'right-lower'][island];
  return rect(x, y, width - gap, depth, Number(rotation.toFixed(4)), {corner: false, side, island, outer, pawn: {x, y}});
}

// The free middle of the board (inner pentagon) plus anchors for the island captions.
export function boardCenter() {
  const cx = 50, R = 49.5, cy = (100 - R * 1.809) / 2 + R, depth = 7.4, corner = 8.6, margin = 1.4;
  // The bigger corner squares reach furthest towards the middle, so the inner pentagon is sized to clear them.
  const apothem = R * Math.cos(Math.PI / 5), r = Math.min((apothem - depth - margin) / Math.cos(Math.PI / 5), R - corner * .35 - corner * .7072 - .8), inner = r * Math.cos(Math.PI / 5);
  const polygon = [0, 1, 2, 3, 4].map(k => {
    const a = (54 + 72 * k) * Math.PI / 180;
    return [Number((cx + r * Math.cos(a)).toFixed(3)), Number((cy + r * Math.sin(a)).toFixed(3))];
  });
  const islands = [0, 1, 2, 3, 4].map(k => {
    const mid = (54 + 72 * k + 36) * Math.PI / 180, distance = Math.min(apothem - depth - 3.6, inner - 3.4);
    let rotation = (54 + 72 * k + 36) - 90;
    rotation = ((rotation + 540) % 360) - 180;
    if (rotation > 90 || rotation < -90) rotation += rotation > 0 ? -180 : 180;
    return {x: Number((cx + distance * Math.cos(mid)).toFixed(3)), y: Number((cy + distance * Math.sin(mid)).toFixed(3)), rotation: Number(rotation.toFixed(3))};
  });
  return {cx, cy, polygon, islands};
}
