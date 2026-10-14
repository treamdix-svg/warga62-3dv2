import * as THREE from 'three';
import { engine, ISLAND_CONFIG, CORNER_CONFIG } from '../engine/GameBridge.js';

// Warna & ikon tiap petak (satu sumber untuk permukaan petak, label, dan penanda).
const SPECIAL_COLOR = { fate: '#f5b301', hazard: '#dc2626', toll: '#2563eb', fine: '#1d4ed8' };
export const SPECIAL_ICON = { start: '⚑', jail: '⚖', tax: '▤', court: '⚖', pungli: '▦', fate: '✦', hazard: '✉', toll: '⇄', fine: '⚠', asset: '⌂' };

export function tileColorHex(i) {
  const [, type, , , island] = engine.tiles[i];
  if (i % 9 === 0) return CORNER_CONFIG[i]?.hex || '#f59e0b';
  if (SPECIAL_COLOR[type]) return SPECIAL_COLOR[type];
  return ISLAND_CONFIG.find((c) => c.name === island)?.hex || '#3b82f6';
}

// Warna permukaan petak: tint sangat terang dari warna pulau agar tulisan terbaca.
export function tileTopColor(i, out = new THREE.Color()) {
  return out.set(tileColorHex(i)).lerp(new THREE.Color(0xfffdf4), 0.82);
}
