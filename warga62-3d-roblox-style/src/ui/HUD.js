import { engine, formatRupiah, PLAYER_COLORS, ISLAND_CONFIG } from '../engine/GameBridge.js';
import { sounds } from '../audio/AudioEffects.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LEVEL_NAME = ['Tanah kosong', 'Subsidi 1', 'Subsidi 2', 'OKB (villa)'];
const CAMERA_MODES = [
  ['follow', '🎥', 'Ikuti', 'Kamera mengikuti pemain'],
  ['iso', '📐', 'Isometrik', 'Sudut isometrik, tetap mengikuti pemain'],
  ['overview', '🌏', 'Ikhtisar', 'Lihat seluruh dunia'],
  ['top', '🧭', 'Atas', 'Tampak atas'],
  ['free', '✋', 'Geser', 'Geser kamera bebas (dua jari / klik kanan)'],
];

// Antarmuka permainan. Semua tombol aksi dibuat dari fase engine asli (state.phase) dan memanggil engine.act().
export class HUD {
  constructor(container, callbacks) {
    this.container = container; this.cb = callbacks;
    this.busy = false; this.lastCardId = null; this.lastEventKey = '';
    this.state = null; this.playersCollapsed = false;
    this.build();
  }

  build() {
    this.container.innerHTML = `
    <div id="ui-root">
      <header class="top-bar interactive">
        <div class="brand"><b>WARGA +62</b><small>3D Dunia Nusantara</small></div>
        <div class="pill" id="round-badge" title="Putaran">Putaran 1</div>
        <div class="pill money" id="treasury-badge" title="Kas negara">Kas Negara Rp0</div>
        <div class="turn-banner" id="turn-banner"><span class="dot" id="turn-dot"></span><span id="turn-text">Giliran</span></div>
        <nav class="cam-buttons" id="cam-buttons">
          ${CAMERA_MODES.map(([id, icon, label, tip]) => `<button class="icon-btn" data-cam="${id}" title="${tip}" aria-label="${tip}"><span>${icon}</span><em>${label}</em></button>`).join('')}
          <button class="icon-btn" id="btn-sound" title="Suara" aria-label="Suara"><span id="sound-icon">🔊</span></button>
          <button class="icon-btn" id="btn-menu" title="Menu" aria-label="Menu"><span>☰</span></button>
        </nav>
      </header>

      <aside class="players-panel interactive" id="players-panel">
        <button class="panel-toggle" id="players-toggle" aria-label="Tampilkan atau sembunyikan daftar pemain">👥 Pemain</button>
        <div class="players-list" id="players-list"></div>
      </aside>

      <div class="tile-info interactive" id="tile-info" hidden></div>
      <div class="toast-stack" id="toast-stack"></div>

      <div class="bottom-dock">
        <div class="card-sheet interactive" id="card-sheet" hidden></div>
        <div class="msg-panel interactive" id="msg-panel">
          <div class="msg-title" id="msg-title">Selamat datang</div>
          <div class="msg-text" id="msg-text">Lempar dadu untuk memulai.</div>
          <div class="dice-readout" id="dice-readout" hidden></div>
        </div>
        <div class="action-controls interactive" id="action-buttons"></div>
      </div>

      <div class="drawer interactive" id="menu-drawer" hidden>
        <div class="drawer-head"><b>Menu</b><button class="icon-btn" id="menu-close" aria-label="Tutup">✕</button></div>
        <div class="tabs"><button data-tab="menu" class="active">Permainan</button><button data-tab="log">Riwayat</button><button data-tab="rules">Aturan</button></div>
        <div class="tab-body" id="tab-menu">
          <label class="row">Volume suara <input type="range" id="vol" min="0" max="100" value="60"></label>
          <label class="row">Grafis
            <select id="quality-select"><option value="auto">Otomatis</option><option value="low">Hemat (HP)</option><option value="high">Tinggi (PC)</option></select>
          </label>
          <button class="btn-action secondary wide" id="btn-newgame">🔄 Permainan baru</button>
          <p class="hint">Mode lokal: semua pemain bergantian di satu perangkat. Aturan, kartu, dan ekonomi memakai engine asli Warga +62.</p>
        </div>
        <div class="tab-body" id="tab-log" hidden></div>
        <div class="tab-body" id="tab-rules" hidden>
          <ul class="rules">
            <li>Modal awal Rp13 juta per warga. Dua dadu menggerakkan pion sekali; kembar tidak memberi giliran tambahan tetapi wajib menarik satu kartu Takdir setelah efek lokasi.</li>
            <li>Aset baru bisa dibeli setelah 1 putaran. Melewati Mulai memberi gaji Rp1 juta dan kesempatan membangun (maks. 2 Subsidi, lalu OKB pada gajian berikutnya).</li>
            <li>Sewa naik ×2 bila satu kompleks dikuasai dan ×3 bila satu pulau dikuasai.</li>
            <li>Bila saldo kurang, jual aset ke negara (50% nilai). Jika tetap kurang, bangkrut. Warga terakhir yang bertahan menang.</li>
            <li>Lapas: bebas dengan dadu kembar, bayar Rp1.125.000, kartu jaminan, atau otomatis pada giliran ke-3.</li>
            <li>Kartu Takdir & Musibah: 98 kartu resmi (termasuk kartu stopwatch setelah 2 putaran).</li>
          </ul>
        </div>
      </div>

      <div class="modal-backdrop interactive" id="gameover" hidden>
        <div class="modal">
          <h2>🏆 Permainan selesai</h2>
          <p class="winner" id="winner-name"></p>
          <div id="final-stats" class="final-stats"></div>
          <button class="btn-action success wide" id="btn-restart">🔄 Main lagi</button>
        </div>
      </div>

      <div class="modal-backdrop interactive" id="start-screen" hidden>
        <div class="modal start">
          <div class="logo">WARGA +62</div>
          <p class="sub">Dunia 3D Nusantara — lima wilayah, 45 lokasi, satu kota yang hidup.</p>
          <div class="count-row"><span>Jumlah warga</span>
            <button class="icon-btn" id="count-minus" aria-label="Kurangi">−</button><b id="count-val">4</b><button class="icon-btn" id="count-plus" aria-label="Tambah">+</button>
          </div>
          <div class="name-grid" id="name-grid"></div>
          <button class="btn-action success wide" id="btn-start">▶ Mulai bermain</button>
          <p class="hint">Putar kamera dengan seret, perbesar dengan scroll/cubit, geser dengan klik kanan atau tombol ✋.</p>
        </div>
      </div>
    </div>`;
    const $ = (id) => document.getElementById(id);
    this.dom = {
      round: $('round-badge'), treasury: $('treasury-badge'), banner: $('turn-banner'), dot: $('turn-dot'), turnText: $('turn-text'),
      players: $('players-list'), playersPanel: $('players-panel'), tile: $('tile-info'), toasts: $('toast-stack'), card: $('card-sheet'),
      msgTitle: $('msg-title'), msgText: $('msg-text'), dice: $('dice-readout'), actions: $('action-buttons'), drawer: $('menu-drawer'),
      log: $('tab-log'), gameover: $('gameover'), winner: $('winner-name'), stats: $('final-stats'), start: $('start-screen'),
      soundIcon: $('sound-icon'), camButtons: $('cam-buttons'),
    };
    this.dom.camButtons.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cam]'); if (!b) return;
      sounds.playClick(); this.cb.onCamera?.(b.dataset.cam);
    });
    $('btn-sound').addEventListener('click', () => {
      sounds.init(); sounds.setMuted(!sounds.muted); this.dom.soundIcon.textContent = sounds.muted ? '🔇' : '🔊';
    });
    $('btn-menu').addEventListener('click', () => { this.dom.drawer.hidden = !this.dom.drawer.hidden; this.renderLog(); });
    $('menu-close').addEventListener('click', () => { this.dom.drawer.hidden = true; });
    this.dom.drawer.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
      this.dom.drawer.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('active', x === b));
      for (const t of ['menu', 'log', 'rules']) $('tab-' + t).hidden = t !== b.dataset.tab;
      if (b.dataset.tab === 'log') this.renderLog();
    }));
    $('vol').addEventListener('input', (e) => sounds.setVolume(Number(e.target.value) / 100));
    const qs = $('quality-select');
    qs.value = new URLSearchParams(location.search).get('quality') || 'auto';
    qs.addEventListener('change', () => {
      const u = new URL(location.href);
      if (qs.value === 'auto') u.searchParams.delete('quality'); else u.searchParams.set('quality', qs.value);
      location.href = u.toString();
    });
    $('btn-newgame').addEventListener('click', () => { this.dom.drawer.hidden = true; this.showStart(); });
    $('btn-restart').addEventListener('click', () => { this.dom.gameover.hidden = true; this.showStart(); });
    $('players-toggle').addEventListener('click', () => { this.playersCollapsed = !this.playersCollapsed; this.dom.playersPanel.classList.toggle('collapsed', this.playersCollapsed); });
    // Menu mulai
    this.playerCount = 4;
    const renderNames = () => {
      $('count-val').textContent = this.playerCount;
      const grid = $('name-grid'); const old = [...grid.querySelectorAll('input')].map((i) => i.value);
      grid.innerHTML = '';
      for (let i = 0; i < this.playerCount; i++) {
        const row = document.createElement('label'); row.className = 'name-row';
        row.innerHTML = `<span class="dot" style="background:${PLAYER_COLORS[i].hex}"></span>`;
        const input = document.createElement('input'); input.maxLength = 18; input.value = old[i] ?? `Warga ${i + 1}`; input.setAttribute('aria-label', `Nama pemain ${i + 1}`);
        row.appendChild(input); grid.appendChild(row);
      }
    };
    $('count-minus').addEventListener('click', () => { this.playerCount = Math.max(2, this.playerCount - 1); renderNames(); });
    $('count-plus').addEventListener('click', () => { this.playerCount = Math.min(engine.MAX_PLAYERS || 15, this.playerCount + 1); renderNames(); });
    $('btn-start').addEventListener('click', () => {
      const names = [...document.querySelectorAll('#name-grid input')].map((i, n) => i.value.trim() || `Warga ${n + 1}`);
      this.dom.start.hidden = true; sounds.init(); sounds.startAmbient();
      this.cb.onStart?.(names);
    });
    renderNames();
  }

  showStart() { this.dom.start.hidden = false; }
  setCameraMode(mode) { this.dom.camButtons.querySelectorAll('[data-cam]').forEach((b) => b.classList.toggle('active', b.dataset.cam === mode)); }
  setBusy(busy) { this.busy = busy; this.dom.actions.classList.toggle('busy', busy); this.dom.actions.querySelectorAll('button').forEach((b) => { b.disabled = busy; }); }

  toast(text, kind = '') {
    const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = text;
    this.dom.toasts.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3100);
    while (this.dom.toasts.children.length > 4) this.dom.toasts.firstChild.remove();
  }

  showDice(dice, doubles) {
    if (!dice) return;
    this.dom.dice.hidden = false;
    this.dom.dice.textContent = dice.length === 1 ? `🎲 ${dice[0]}` : `🎲 ${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}${doubles ? ' • KEMBAR!' : ''}`;
  }
  hideDice() { this.dom.dice.hidden = true; }

  tileDetail(i, state) {
    const data = engine.tiles[i];
    const lines = [];
    const island = ISLAND_CONFIG.find((c) => c.name === data[4]);
    let html = `<div class="ti-head"><span class="ti-num" style="background:${island?.hex || '#f59e0b'}">${i}</span><b>${esc(data[0])}</b><small>${esc(data[4])}</small></div>`;
    if (data[1] === 'asset') {
      const prop = engine.propertyAt(i);
      const owner = state?.owners?.[i];
      const level = state?.buildings?.[i] || 0;
      const ownerName = owner === undefined ? 'Belum dimiliki' : owner === 'state' ? 'Negara' : state.players.find((p) => p.id === owner)?.name || '-';
      lines.push(`Harga ${formatRupiah(prop.price)}`);
      lines.push(`Pemilik: ${esc(ownerName)}`);
      lines.push(`Bangunan: ${LEVEL_NAME[level]}`);
      if (state?.roads?.[i]) lines.push('Berubah menjadi jalan tol');
      else if (owner !== undefined && state) lines.push(`Sewa kini ${formatRupiah(Math.round(prop.rents[level] * engine.rentMultiplier(state, i)))}`);
      else lines.push(`Sewa ${formatRupiah(prop.rents[0])} – ${formatRupiah(prop.rents[3])}`);
    } else {
      const desc = { start: 'Gaji Rp1.000.000 saat melewati', jail: 'Hanya berkunjung bila tidak dipenjara', tax: 'Rp500.000 per tanah milikmu', court: 'Lempar 1 dadu untuk putusan hakim', pungli: 'Bayar Rp750.000 (bebas bagi pemilik Bandung)', fate: 'Tarik Kartu Takdir', hazard: 'Tarik Kartu Musibah', toll: 'Tol opsional Rp500.000 ke tol lain', fine: 'Denda Rp500.000' }[data[1]];
      if (desc) lines.push(desc);
    }
    return html + lines.map((l) => `<div class="ti-line">${l}</div>`).join('');
  }
  showTileInfo(i, state) { this.dom.tile.innerHTML = this.tileDetail(i, state || this.state); this.dom.tile.hidden = false; }
  hideTileInfo() { this.dom.tile.hidden = true; }

  renderLog() {
    if (this.dom.drawer.hidden || !this.state) return;
    this.dom.log.innerHTML = (this.state.log || []).map((l) => `<div class="log-line">${esc(l)}</div>`).join('') || '<p class="hint">Belum ada riwayat.</p>';
  }

  update(state) {
    this.state = state;
    const p = state.players[state.turn] || state.players[0];
    const col = PLAYER_COLORS[state.turn % PLAYER_COLORS.length];
    this.dom.round.textContent = `Putaran ${state.round || 1}`;
    this.dom.treasury.textContent = `Kas Negara ${formatRupiah(state.treasury || 0)}`;
    this.dom.dot.style.background = col.hex; this.dom.dot.style.color = col.hex;
    this.dom.turnText.textContent = `Giliran: ${p.name}`;
    this.renderPlayers(state);
    this.renderMessage(state);
    this.renderCard(state, p);
    this.renderActions(state, p);
    this.renderLog();
    if (state.phase === 'over') this.showGameOver(state); else this.dom.gameover.hidden = true;
  }

  renderPlayers(state) {
    const list = this.dom.players; list.innerHTML = '';
    state.players.forEach((p, idx) => {
      const c = PLAYER_COLORS[idx % PLAYER_COLORS.length];
      const el = document.createElement('button');
      el.className = `player-card${idx === state.turn ? ' active' : ''}${p.out ? ' out' : ''}`;
      el.style.setProperty('--pc', c.hex);
      const lands = engine.owned(state, p).length;
      const held = (p.heldCards || []).map((h) => ({ bail: '📜', shield: '🛡', subsidy: '🏷' }[h.kind] || '🎴')).join('');
      el.innerHTML = `<span class="dot"></span><span class="pc-name">${esc(p.name)}</span><span class="pc-money">${p.out ? 'BANGKRUT' : formatRupiah(p.money)}</span>
        <span class="pc-sub">📍 ${esc(engine.tileAt(p.pos)[0])} · 🏠 ${lands}${p.jail ? ' · 🔒' : ''}${held ? ' · ' + held : ''}</span>`;
      el.addEventListener('click', () => { sounds.playClick(); this.cb.onFocusPlayer?.(idx); });
      list.appendChild(el);
    });
  }

  renderMessage(state) {
    const ev = state.event;
    const title = ev?.title || 'Warga +62';
    const text = ev?.text || (state.log?.[0] || 'Lempar dadu untuk memulai.');
    this.dom.msgTitle.textContent = title; this.dom.msgText.textContent = text;
    const prev = this.lastEventKey; this.lastEventKey = title + text;
    if (prev !== this.lastEventKey) { this.dom.msgTitle.parentElement.classList.remove('flash'); void this.dom.msgTitle.offsetWidth; this.dom.msgTitle.parentElement.classList.add('flash'); }
  }

  renderCard(state) {
    const el = this.dom.card;
    const phases = ['card', 'cardchoice', 'cardroll', 'cardtarget', 'protect'];
    if (!state.card || !phases.includes(state.phase)) { el.hidden = true; return; }
    const c = state.card;
    if (this.lastCardId !== c.presentationId) { this.lastCardId = c.presentationId; this.cb.onCardShown?.(c); }
    el.hidden = false;
    el.className = `card-sheet interactive ${c.kind === 'fate' ? 'fate' : 'hazard'}`;
    el.innerHTML = `<div class="card-kind">${c.kind === 'fate' ? '✦ KARTU TAKDIR ✦' : '✉ KARTU MUSIBAH ✉'}${c.stopwatch ? ' ⏱' : ''}</div><b class="card-title">${esc(c.title)}</b><p class="card-desc">${esc(c.description)}</p>`;
  }

  button(label, cls, onClick, disabled = false) {
    const b = document.createElement('button');
    b.className = 'btn-action ' + cls; b.innerHTML = label; b.disabled = this.busy || disabled;
    b.addEventListener('click', () => { if (this.busy) return; sounds.playClick(); onClick(); });
    return b;
  }

  renderActions(state, player) {
    const box = this.dom.actions; box.innerHTML = '';
    const act = (a, t) => () => this.cb.onAction(a, t);
    const add = (...args) => box.appendChild(this.button(...args));
    const phase = state.phase;
    const name = (k) => esc(engine.tileAt(k)[0]);
    box.classList.toggle('many', false);
    if (phase === 'roll') add('🎲 Lempar Dua Dadu', 'primary', act('roll'));
    else if (phase === 'jail') {
      add(`🎲 Lempar Dadu (butuh kembar${player.jailTurns ? ` • percobaan ${player.jailTurns}/2` : ''})`, 'primary', act('roll'));
      if (player.money >= 1125000) add('💳 Bayar tebusan Rp1.125.000', 'warning', act('bail'));
      if (player.heldCards?.some((c) => c.kind === 'bail')) add('📜 Pakai Surat Jaminan', 'success', act('usebail'));
    } else if (phase === 'buy') {
      const prop = engine.propertyAt(player.pos);
      add(`🛒 Beli ${name(player.pos)} (${formatRupiah(prop.price)})`, 'success', act('buy'), player.money < prop.price);
      add('⏭ Lewati', 'secondary', act('skip'));
    } else if (phase === 'toll') {
      add('🚗 Bayar tol Rp500.000', 'warning', act('tollpay'), player.money < 500000);
      add('🛑 Tetap di sini', 'secondary', act('skip'));
    } else if (phase === 'tollmove') {
      box.classList.add('many');
      for (let k = 0; k < 45; k++) {
        if (k === player.pos) continue;
        if (engine.tiles[k][1] === 'toll' || state.roads[k]) add(`🚗 ke ${k} · ${name(k)}`, 'secondary', act('tollmove', k));
      }
    } else if (phase === 'salary') {
      box.classList.add('many');
      const owned = engine.owned(state, player);
      owned.forEach((k) => {
        const b = state.buildings[k] || 0, prop = engine.propertyAt(k);
        if (state.roads[k]) return;
        if (b < 2) {
          add(`🏗 ${name(k)} → Subsidi ${b + 1} (${formatRupiah(prop.subsidy)})`, 'primary', act('build', k), player.money < prop.subsidy);
          if (player.heldCards?.some((c) => c.kind === 'subsidy')) add(`🏷 Voucher di ${name(k)}`, 'success', act('usesubsidy', k));
        } else if (b === 2) {
          const wait = (state.upgraded[k] || 0) >= player.laps;
          add(`🏰 ${name(k)} → OKB (${formatRupiah(prop.okb)})${wait ? ' • gajian berikutnya' : ''}`, 'warning', act('build', k), wait || player.money < prop.okb);
        }
      });
      add('✅ Selesai', 'success', act('salarydone'));
    } else if (phase === 'court') add('⚖ Lempar Dadu Sidang', 'warning', act('courtroll'));
    else if (phase === 'debt') {
      box.classList.add('many');
      const debt = state.debt;
      const info = document.createElement('div'); info.className = 'debt-info';
      info.textContent = debt ? `Utang ${formatRupiah(debt.amount)} — saldo ${formatRupiah(player.money)}. Jual aset ke negara (50%).` : 'Jual aset untuk melunasi.';
      box.appendChild(info);
      engine.owned(state, player).forEach((k) => add(`🏷 Jual ${name(k)} (+${formatRupiah(engine.saleValue(state, k))})`, 'danger', act('sell', k)));
    } else if (phase === 'card') add('✨ Jalankan efek kartu', 'success', act('cardresolve'));
    else if (phase === 'cardchoice') {
      (state.card?.effect?.options || []).forEach((o, i) => add(esc(o.label), 'primary', act('cardchoice', i)));
    } else if (phase === 'cardroll') add('🎲 Lempar dadu kartu', 'primary', act('cardroll'));
    else if (phase === 'cardtarget') {
      box.classList.add('many');
      engine.cardTargets(state).forEach((t) => add(`🎯 ${esc(t.name)}`, 'primary', act('cardtarget', t.id)));
    } else if (phase === 'swappick') {
      box.classList.add('many');
      state.players.filter((x) => x.id !== player.id && !x.out && !x.jail).forEach((t) => add(`🔁 Tukar dengan ${esc(t.name)}`, 'primary', act('swap', t.id)));
    } else if (phase === 'roadpick') {
      box.classList.add('many');
      engine.owned(state, player).filter((k) => !state.buildings[k] && !state.roads[k]).forEach((k) => add(`🛣 Jadikan tol: ${name(k)}`, 'warning', act('roadpick', k)));
    } else if (phase === 'protect') {
      if (player.shields > 0) add('🛡 Pakai pelindung', 'success', act('protect'));
      add('⚡ Terima musibah', 'danger', act('accept'));
    } else if (phase === 'end') add('⏭ Akhiri giliran', 'primary', act('end'));
    if (this.busy) box.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    if (!box.children.length && phase !== 'over') { const i = document.createElement('div'); i.className = 'debt-info'; i.textContent = 'Menunggu...'; box.appendChild(i); }
  }

  showGameOver(state) {
    this.dom.gameover.hidden = false;
    this.dom.winner.textContent = `Pemenang: ${state.winner || 'Negara'}`;
    const rows = state.players.map((p) => ({ p, w: engine.wealth(state, p) })).sort((a, b) => b.w - a.w);
    this.dom.stats.innerHTML = rows.map(({ p, w }, i) => `<div class="fs-row"><span>${i + 1}. ${esc(p.name)}${p.out ? ' (bangkrut)' : ''}</span><b>${formatRupiah(w)}</b></div>`).join('');
  }
}
