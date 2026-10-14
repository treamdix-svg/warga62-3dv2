// Fit mode uses the largest uniform square that fits the measured viewport.
// Zoom changes that same square uniformly and enables two-axis panning.
export function boardViewport({width, height, mobile = false, zoom = 1, inset = 0}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw Error('Area papan tidak valid.');
  const safeInset = Math.max(0, inset);
  const availableWidth = Math.max(1, width - safeInset * 2);
  const availableHeight = Math.max(1, height - safeInset * 2);
  const factor = Math.max(1, Math.min(2.5, Number.isFinite(zoom) ? zoom : 1));
  const base = 1280;
  const scale = Math.min(availableWidth, availableHeight) / base * factor;
  const size = Math.round(base * scale);
  return {base, size, width: size, height: size, scale, scroll: factor > 1, compact: size < 760, mobile};
}
