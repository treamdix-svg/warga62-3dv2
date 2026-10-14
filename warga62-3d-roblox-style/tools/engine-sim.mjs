// Simulasi engine murni: memainkan banyak permainan penuh memakai HANYA aksi yang ditawarkan HUD per fase.
import { createGameEngine } from '../legacy_source/game-engine.mjs';
import { CARDS } from '../legacy_source/cards.mjs';
const engine = createGameEngine(CARDS);
let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
// Cermin logika HUD.renderActions -> daftar aksi yang tersedia
function options(s) {
  const p = s.players[s.turn], ph = s.phase, o = [];
  if (ph === 'roll') o.push(['roll']);
  else if (ph === 'jail') { o.push(['roll']); if (p.money >= 1125000) o.push(['bail']); if (p.heldCards?.some(c => c.kind === 'bail')) o.push(['usebail']); }
  else if (ph === 'buy') { const pr = engine.propertyAt(p.pos); if (p.money >= pr.price) o.push(['buy']); o.push(['skip']); }
  else if (ph === 'toll') { if (p.money >= 500000) o.push(['tollpay']); o.push(['skip']); }
  else if (ph === 'tollmove') { for (let k = 0; k < 45; k++) if (k !== p.pos && (engine.tiles[k][1] === 'toll' || s.roads[k])) o.push(['tollmove', k]); }
  else if (ph === 'salary') {
    for (const k of engine.owned(s, p)) { const b = s.buildings[k] || 0, pr = engine.propertyAt(k); if (s.roads[k]) continue;
      if (b < 2 && p.money >= pr.subsidy) o.push(['build', k]);
      else if (b === 2 && (s.upgraded[k] || 0) < p.laps && p.money >= pr.okb) o.push(['build', k]);
      if (b < 2 && p.heldCards?.some(c => c.kind === 'subsidy')) o.push(['usesubsidy', k]); }
    o.push(['salarydone']);
  } else if (ph === 'court') o.push(['courtroll']);
  else if (ph === 'debt') for (const k of engine.owned(s, p)) o.push(['sell', k]);
  else if (ph === 'card') o.push(['cardresolve']);
  else if (ph === 'cardchoice') (s.card.effect.options).forEach((_, i) => o.push(['cardchoice', i]));
  else if (ph === 'cardroll') o.push(['cardroll']);
  else if (ph === 'cardtarget') for (const t of engine.cardTargets(s)) o.push(['cardtarget', t.id]);
  else if (ph === 'swappick') for (const t of s.players.filter(x => x.id !== p.id && !x.out && !x.jail)) o.push(['swap', t.id]);
  else if (ph === 'roadpick') for (const k of engine.owned(s, p).filter(k => !s.buildings[k] && !s.roads[k])) o.push(['roadpick', k]);
  else if (ph === 'protect') { if (p.shields > 0) o.push(['protect']); o.push(['accept']); }
  else if (ph === 'end') o.push(['end']);
  return o;
}
const stats = { games: 0, over: 0, stuck: 0, errors: 0, steps: 0, phases: {}, maxSteps: 0 };
for (let g = 0; g < 60; g++) {
  const n = 2 + (g % 6);
  const s = engine.fresh(Array.from({ length: n }, (_, i) => 'P' + i), 'local'); engine.randomStart(s, rnd);
  let steps = 0;
  while (s.phase !== 'over' && steps < 6000) {
    const opts = options(s);
    stats.phases[s.phase] = (stats.phases[s.phase] || 0) + 1;
    if (!opts.length) { stats.stuck++; console.log('STUCK phase', s.phase); break; }
    // dahulukan aksi aktif (beli/bangun) tetapi kadang acak
    const [a, t] = opts[Math.floor(rnd() * opts.length)];
    try { engine.act(s, a, rnd, t ?? null); } catch (e) { stats.errors++; console.log('ERR', s.phase, a, t, e.message); break; }
    steps++;
  }
  stats.games++; stats.steps += steps; stats.maxSteps = Math.max(stats.maxSteps, steps);
  if (s.phase === 'over') stats.over++;
}
console.log(JSON.stringify(stats));
