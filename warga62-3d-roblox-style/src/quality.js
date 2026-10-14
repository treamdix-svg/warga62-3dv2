// Profil kualitas otomatis: HP Android mendapat beban lebih ringan, PC mendapat detail penuh.
const ua = navigator.userAgent || '';
const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const mobile = /Android|iPhone|iPad|Mobile/i.test(ua) || coarse;
const forced = new URLSearchParams(location.search).get('quality');
const tier = forced === 'low' || forced === 'high' ? forced : (mobile ? 'low' : 'high');

export const quality = tier === 'low' ? {
  tier, mobile,
  pixelRatio: 1.25, antialias: false, shadowMap: 1024, shadowExtent: 46, terrainSegments: 140, terrainCastShadow: false,
  trees: 420, rocks: 90, grass: 0, lod: 0, treeShadow: false, clouds: 7, vehicles: 6, birds: 0, particles: 40, labelDistance: 62,
} : {
  tier, mobile,
  pixelRatio: 1.75, antialias: true, shadowMap: 2048, shadowExtent: 58, terrainSegments: 200, terrainCastShadow: true,
  trees: 1000, rocks: 200, grass: 900, lod: 1, treeShadow: true, clouds: 12, vehicles: 12, birds: 10, particles: 90, labelDistance: 85,
};
