import { createGameEngine } from '@legacy/game-engine.mjs';
import { CARDS } from '@legacy/cards.mjs';
import { createWorld } from '../world/WorldMap.js';

// Engine Warga +62 asli (tanpa modifikasi) dengan 98 kartu resmi.
export const engine = createGameEngine(CARDS);

// Dunia 3D: jalur 45 lokasi dihitung sekali dan dipakai semua modul.
export const world = createWorld();
// Plat kota (petak aset) / kampung (Tol, Tilang) di sisi luar petak. Takdir & Musibah sengaja tanpa landmark.
for (let i = 0; i < 45; i++) if (i % 9 !== 0 && !['fate', 'hazard'].includes(engine.tiles[i][1])) world.addPlate(i);

// Lima wilayah sesuai engine (indeks petak = 9 per pulau).
export const ISLAND_CONFIG = [
  { name: 'Sumatra', color: 0xef4444, hex: '#ef4444', lightHex: '#fee2e2', range: [1, 8] },
  { name: 'Kalimantan', color: 0xeab308, hex: '#eab308', lightHex: '#fef9c3', range: [10, 17] },
  { name: 'Sulawesi', color: 0x10b981, hex: '#10b981', lightHex: '#d1fae5', range: [19, 26] },
  { name: 'Papua', color: 0x0ea5e9, hex: '#0ea5e9', lightHex: '#e0f2fe', range: [28, 35] },
  { name: 'Jawa', color: 0xa855f7, hex: '#a855f7', lightHex: '#f3e8ff', range: [37, 44] },
];

export const CORNER_CONFIG = {
  0: { name: 'Mulai', color: 0x16a34a, hex: '#16a34a', icon: '⚑', desc: 'START • Gaji Rp1.000.000' },
  9: { name: 'Lapas', color: 0xf59e0b, hex: '#f59e0b', icon: '⚖', desc: 'LAPAS • Tebusan Rp1.125.000' },
  18: { name: 'Pajak Tahunan', color: 0x0d9488, hex: '#0d9488', icon: '▤', desc: 'PAJAK • Rp500.000 / Tanah' },
  27: { name: 'Pengadilan', color: 0x7c3aed, hex: '#7c3aed', icon: '⚖', desc: 'PENGADILAN • Sidang Hakim' },
  36: { name: 'Parkiran Pungli', color: 0xd97706, hex: '#d97706', icon: '▦', desc: 'PUNGLI • Bayar Rp750.000' },
};

// Posisi 3D sebuah lokasi (di atas permukaan jalan). Indeks sama persis dengan engine.
export function getTile3DPosition(index, yOffset = 0) {
  if (!Number.isInteger(index) || index < 0 || index >= 45) throw Error('Indeks petak tidak valid: ' + index);
  const t = world.tiles[index];
  return { index, x: t.x, y: t.y + yOffset, z: t.z, rotationY: Math.atan2(t.tx, t.tz), corner: t.corner, island: t.island };
}

export function formatRupiah(amount) {
  if (amount === undefined || amount === null) return 'Rp0';
  return 'Rp' + Number(amount).toLocaleString('id-ID');
}

// Warna pembeda untuk hingga 15 pemain (batas engine).
export const PLAYER_COLORS = [
  { name: 'Merah Merona', color: 0xef4444, hex: '#ef4444' },
  { name: 'Biru Samudra', color: 0x3b82f6, hex: '#3b82f6' },
  { name: 'Kuning Kunyit', color: 0xf5b301, hex: '#f5b301' },
  { name: 'Hijau Daun', color: 0x22c55e, hex: '#22c55e' },
  { name: 'Ungu Ningrat', color: 0xa855f7, hex: '#a855f7' },
  { name: 'Oranye Senja', color: 0xf97316, hex: '#f97316' },
  { name: 'Pink Merona', color: 0xec4899, hex: '#ec4899' },
  { name: 'Teal Laut', color: 0x14b8a6, hex: '#14b8a6' },
  { name: 'Putih Melati', color: 0xf1f5f9, hex: '#f1f5f9' },
  { name: 'Cokelat Kopi', color: 0x92400e, hex: '#92400e' },
  { name: 'Biru Langit', color: 0x38bdf8, hex: '#38bdf8' },
  { name: 'Hijau Lumut', color: 0x84cc16, hex: '#84cc16' },
  { name: 'Magenta', color: 0xd946ef, hex: '#d946ef' },
  { name: 'Abu Batu', color: 0x64748b, hex: '#64748b' },
  { name: 'Hitam Legam', color: 0x1e293b, hex: '#1e293b' },
];

// Level bangunan engine: 0 tanah, 1 Subsidi 1, 2 Subsidi 2, 3 OKB.
export function playerColorOf(ownerId) {
  if (ownerId === 'state' || ownerId === undefined || ownerId === null) return null;
  return PLAYER_COLORS[Number(ownerId) % PLAYER_COLORS.length];
}
