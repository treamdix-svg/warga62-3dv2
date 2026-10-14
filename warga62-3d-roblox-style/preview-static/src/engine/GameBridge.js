import { createGameEngine } from '@legacy/game-engine.mjs';
import { CARDS } from '@legacy/cards.mjs';

// Inisialisasi engine Warga +62 asli dengan 98 kartu resmi
export const engine = createGameEngine(CARDS);

// Pemetaan warna dan gaya pulau Indonesia
export const ISLAND_CONFIG = [
  { name: 'Sumatra', color: 0xef4444, hex: '#ef4444', lightHex: '#fee2e2', bgHex: '#7f1d1d', range: [1, 8] },
  { name: 'Kalimantan', color: 0xeab308, hex: '#eab308', lightHex: '#fef9c3', bgHex: '#713f12', range: [10, 17] },
  { name: 'Sulawesi', color: 0x10b981, hex: '#10b981', lightHex: '#d1fae5', bgHex: '#064e3b', range: [19, 26] },
  { name: 'Papua', color: 0x0ea5e9, hex: '#0ea5e9', lightHex: '#e0f2fe', bgHex: '#0c4a6e', range: [28, 35] },
  { name: 'Jawa', color: 0xa855f7, hex: '#a855f7', lightHex: '#f3e8ff', bgHex: '#581c87', range: [37, 44] }
];

export const CORNER_CONFIG = {
  0: { name: 'Mulai', color: 0x16a34a, hex: '#16a34a', icon: '⚑', desc: 'START • Gaji Rp1.000.000' },
  9: { name: 'Lapas', color: 0xf59e0b, hex: '#f59e0b', icon: '⚖', desc: 'LAPAS • Tebusan Rp1.125.000' },
  18: { name: 'Pajak Tahunan', color: 0x0d9488, hex: '#0d9488', icon: '▤', desc: 'PAJAK • Rp500.000 / Tanah' },
  27: { name: 'Pengadilan', color: 0x7c3aed, hex: '#7c3aed', icon: '⚖', desc: 'PENGADILAN • Sidang Hakim' },
  36: { name: 'Parkiran Pungli', color: 0xd97706, hex: '#d97706', icon: '▦', desc: 'PUNGLI • Bayar Rp750.000' }
};

// Geometri Pentagon Beraturan 3D (Regular Pentagon Coordinates)
// Radius keliling ke 5 sudut pentagon (Circumradius)
export const PENTAGON_R = 25.5;
export const TILE_DEPTH = 4.2;
export const CORNER_CUT = 2.7;

// 5 Titik Sudut Pentagon Beraturan (Orientasi simetris: sisi bawah horizontal Sumatra)
// Sudut (derajat): 54, 126, 198, 270 (apex atas Pengadilan), 342
export const PENTAGON_VERTICES = [0, 1, 2, 3, 4].map(k => {
  const rad = ((54 + 72 * k) * Math.PI) / 180;
  return {
    x: PENTAGON_R * Math.cos(rad),
    z: PENTAGON_R * Math.sin(rad),
    angleRad: rad
  };
});

export function getTile3DPosition(index, yOffset = 0.5) {
  if (!Number.isInteger(index) || index < 0 || index >= 45) {
    throw Error('Indeks petak tidak valid: ' + index);
  }

  const island = Math.floor(index / 9);
  const slot = index % 9;

  // 1. PETAK SUDUT UTAMA (Indices: 0, 9, 18, 27, 36)
  if (slot === 0) {
    const v = PENTAGON_VERTICES[island];
    // Tarik sedikit ke arah pusat (0,0) agar pas di persimpangan sisi
    const pull = TILE_DEPTH * 0.42;
    const x = v.x - Math.cos(v.angleRad) * pull;
    const z = v.z - Math.sin(v.angleRad) * pull;
    const rotationY = -v.angleRad + Math.PI / 2;

    return {
      index,
      x,
      y: yOffset,
      z,
      width: 4.8,
      height: 4.8,
      rotationY,
      corner: true,
      island
    };
  }

  // 2. PETAK SISI (8 Petak per Sisi Pulau: 1..8, 10..17, 19..26, 28..35, 37..44)
  const p1 = PENTAGON_VERTICES[island];
  const p2 = PENTAGON_VERTICES[(island + 1) % 5];

  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  const sideLength = Math.hypot(dx, dz);
  const ux = dx / sideLength;
  const uz = dz / sideLength;

  // Normal vektor ke arah dalam pusat pentagon
  const nx = -uz;
  const nz = ux;

  // Jarak antar petak
  const availableLength = sideLength - 2 * CORNER_CUT;
  const tileWidth = availableLength / 8;
  const along = CORNER_CUT + (slot - 0.5) * tileWidth;

  const x = p1.x + ux * along + nx * (TILE_DEPTH * 0.5);
  const z = p1.z + uz * along + nz * (TILE_DEPTH * 0.5);
  const rotationY = Math.atan2(ux, uz);

  return {
    index,
    x,
    y: yOffset,
    z,
    width: tileWidth - 0.08,
    height: TILE_DEPTH,
    rotationY,
    corner: false,
    island
  };
}

export function formatRupiah(amount) {
  if (amount === undefined || amount === null) return 'Rp0';
  return 'Rp' + Number(amount).toLocaleString('id-ID');
}

export const PLAYER_COLORS = [
  { name: 'Merah Merona', color: 0xef4444, hex: '#ef4444' },
  { name: 'Biru Samudra', color: 0x3b82f6, hex: '#3b82f6' },
  { name: 'Kuning Kunyit', color: 0xf59e0b, hex: '#f59e0b' },
  { name: 'Hijau Daun', color: 0x10b981, hex: '#10b981' },
  { name: 'Ungu Ningrat', color: 0xa855f7, hex: '#a855f7' },
  { name: 'Oranye Senja', color: 0xf97316, hex: '#f97316' },
  { name: 'Pink Merona', color: 0xec4899, hex: '#ec4899' },
  { name: 'Teal Laut', color: 0x14b8a6, hex: '#14b8a6' }
];
