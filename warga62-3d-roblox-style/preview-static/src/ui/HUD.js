import { formatRupiah, PLAYER_COLORS } from '../engine/GameBridge.js';
import { sounds } from '../audio/AudioEffects.js';

export class HUD {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks; // { onAction, onFocusPlayer, onOverview, onToggleMute }

    this.dom = {};
    this.buildSkeleton();
  }

  buildSkeleton() {
    this.container.innerHTML = `
      <div id="ui-root">
        <div class="tile-tooltip" id="tile-tooltip" hidden></div>
        <!-- TOP BAR -->
        <header class="top-bar interactive">
          <div class="brand-section">
            <span class="brand-logo">WARGA +62 <small>3D DUNIA NUSANTARA</small></span>
            <span class="badge-round" id="round-badge">Putaran 1</span>
            <span class="badge-round" id="treasury-badge">Kas Negara: Rp0</span>
          </div>

          <div class="active-player-banner" id="active-banner">
            <span class="player-dot" id="banner-dot"></span>
            <span id="banner-text">Giliran: Warga 1</span>
          </div>

          <div class="top-actions">
            <button class="btn-icon" id="btn-cam-overview" title="Tampilan Keseluruhan">
              <span>🌐</span> Ikhtisar
            </button>
            <button class="btn-icon" id="btn-cam-iso" title="Sudut Isometrik">
              <span>📐</span> Isometrik
            </button>
            <button class="btn-icon" id="btn-cam-top" title="Tampak Atas Pentagon">
              <span>🧭</span> Tampak Atas
            </button>
            <button class="btn-icon" id="btn-cam-focus" title="Fokus Pion">
              <span>🎯</span> Fokus
            </button>
            <button class="btn-icon" id="btn-sound" title="Aktifkan/Matikan Suara">
              <span id="sound-icon">🔊</span>
            </button>
          </div>
        </header>

        <!-- PLAYERS SIDEBAR -->
        <aside class="players-panel interactive" id="players-list">
          <!-- Diisi secara dinamis -->
        </aside>

        <!-- BOTTOM CONTROLS & NEWS TICKER -->
        <footer class="bottom-bar">
          <div class="event-ticker interactive" id="event-ticker">
            <span>📢</span> <span id="ticker-text">Selamat datang di Warga +62 3D! Lempar dadu untuk memulai.</span>
          </div>

          <div class="action-controls interactive" id="action-buttons">
            <!-- Tombol dinamis sesuai fase mesin -->
          </div>
        </footer>

        <!-- MODAL KARTU TAKDIR & MUSIBAH -->
        <div class="card-modal-backdrop interactive" id="card-modal" style="display: none;">
          <div class="card-frame fate" id="card-frame">
            <div class="card-header" id="modal-card-header">KARTU TAKDIR</div>
            <div class="card-body">
              <h3 class="card-title" id="modal-card-title">Judul Kartu</h3>
              <p class="card-desc" id="modal-card-desc">Deskripsi efek kartu...</p>
            </div>
            <div class="card-footer" id="modal-card-actions">
              <!-- Tombol aksi kartu -->
            </div>
          </div>
        </div>

        <!-- MODAL GAME OVER -->
        <div class="card-modal-backdrop interactive" id="game-over-modal" style="display: none;">
          <div class="card-frame fate" style="max-width: 480px;">
            <div class="card-header">PERMAINAN SELESAI! 🏆</div>
            <div class="card-body">
              <h2 class="card-title" id="winner-name">Pemenang: Warga 1</h2>
              <p class="card-desc" id="game-summary">Warga terakhir yang berhasil bertahan hidup!</p>
              <div id="final-stats" style="width: 100%; text-align: left; font-size: 13px; line-height: 1.6; color: #cbd5e1;"></div>
            </div>
            <div class="card-footer">
              <button class="btn-action success" id="btn-restart" style="width: 100%; justify-content: center;">
                🔄 Main Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cache elemen penting
    this.dom.tileTooltip = document.getElementById('tile-tooltip');
    this.dom.roundBadge = document.getElementById('round-badge');
    this.dom.treasuryBadge = document.getElementById('treasury-badge');
    this.dom.activeBanner = document.getElementById('active-banner');
    this.dom.bannerDot = document.getElementById('banner-dot');
    this.dom.bannerText = document.getElementById('banner-text');
    this.dom.playersList = document.getElementById('players-list');
    this.dom.tickerText = document.getElementById('ticker-text');
    this.dom.actionButtons = document.getElementById('action-buttons');
    this.dom.cardModal = document.getElementById('card-modal');
    this.dom.cardFrame = document.getElementById('card-frame');
    this.dom.modalCardHeader = document.getElementById('modal-card-header');
    this.dom.modalCardTitle = document.getElementById('modal-card-title');
    this.dom.modalCardDesc = document.getElementById('modal-card-desc');
    this.dom.modalCardActions = document.getElementById('modal-card-actions');
    this.dom.gameOverModal = document.getElementById('game-over-modal');
    this.dom.winnerName = document.getElementById('winner-name');
    this.dom.btnSound = document.getElementById('btn-sound');
    this.dom.soundIcon = document.getElementById('sound-icon');

    // Listener navigasi atas
    document.getElementById('btn-cam-overview').addEventListener('click', () => {
      if (this.callbacks.onOverview) this.callbacks.onOverview();
    });

    document.getElementById('btn-cam-iso').addEventListener('click', () => {
      if (this.callbacks.onIsometric) this.callbacks.onIsometric();
    });

    document.getElementById('btn-cam-top').addEventListener('click', () => {
      if (this.callbacks.onTopDown) this.callbacks.onTopDown();
    });

    document.getElementById('btn-cam-focus').addEventListener('click', () => {
      if (this.callbacks.onFocusActive) this.callbacks.onFocusActive();
    });

    this.dom.btnSound.addEventListener('click', () => {
      sounds.muted = !sounds.muted;
      this.dom.soundIcon.textContent = sounds.muted ? '🔇' : '🔊';
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });
  }

  showTileInfo(data) {
    if (!this.dom.tileTooltip || !data) return;
    this.dom.tileTooltip.textContent = `${String(data.index).padStart(2, '0')} • ${data.name}` +
      (data.price ? `  —  ${formatRupiah(data.price)}` : '');
    this.dom.tileTooltip.hidden = false;
  }
  hideTileInfo() {
    if (this.dom.tileTooltip) this.dom.tileTooltip.hidden = true;
  }

  update(state, activePlayerIndex, engine) {
    if (!state) return;

    // 1. Update Header Info
    this.dom.roundBadge.textContent = `Putaran ${state.round || 1}`;
    this.dom.treasuryBadge.textContent = `Kas Negara: ${formatRupiah(state.treasury || 0)}`;

    const activePlayer = state.players[state.turn] || state.players[0];
    const colorInfo = PLAYER_COLORS[state.turn % PLAYER_COLORS.length];
    this.dom.bannerDot.style.color = colorInfo.hex;
    this.dom.bannerDot.style.backgroundColor = colorInfo.hex;
    this.dom.bannerText.textContent = `Giliran: ${activePlayer.name}`;

    // 2. Update Daftar Pemain (Sidebar)
    this.renderPlayersList(state, activePlayerIndex, engine);

    // 3. Update Event Ticker (Log Terbaru)
    if (state.log && state.log.length > 0) {
      this.dom.tickerText.textContent = state.log[0];
    }

    // 4. Update Tombol Aksi Sesuai Fase Engine
    this.renderActionButtons(state, activePlayer, engine);

    // 5. Update Kartu Modal jika sedang aktif
    this.renderCardModal(state);

    // 6. Game Over Modal
    if (state.phase === 'over') {
      this.dom.gameOverModal.style.display = 'flex';
      this.dom.winnerName.textContent = `Pemenang: ${state.winner || 'Negara'}`;
    } else {
      this.dom.gameOverModal.style.display = 'none';
    }
  }

  renderPlayersList(state, activePlayerIndex, engine) {
    this.dom.playersList.innerHTML = '';
    state.players.forEach((p, idx) => {
      const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
      const card = document.createElement('div');
      card.className = `player-card ${idx === state.turn ? 'active' : ''} ${p.out ? 'bankrupt' : ''}`;

      const tileName = engine.tileAt(p.pos)[0];
      const ownedCount = engine.owned(state, p).length;

      card.innerHTML = `
        <div class="player-row">
          <div class="player-name-wrap">
            <span class="player-dot" style="color: ${color.hex}; background-color: ${color.hex};"></span>
            <span>${p.name}</span>
          </div>
          <div class="player-money">${p.out ? 'BANGKRUT' : formatRupiah(p.money)}</div>
        </div>
        <div class="player-sub">
          <span>📍 ${tileName}</span>
          <span>🏠 ${ownedCount} tanah ${p.jail ? '• 🔒 Lapas' : ''}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.callbacks.onFocusPlayer) this.callbacks.onFocusPlayer(idx);
      });

      this.dom.playersList.appendChild(card);
    });
  }

  renderActionButtons(state, player, engine) {
    const container = this.dom.actionButtons;
    container.innerHTML = '';

    const phase = state.phase;

    if (phase === 'roll') {
      const btnRoll = document.createElement('button');
      btnRoll.className = 'btn-action';
      btnRoll.innerHTML = '🎲 Lempar Dua Dadu';
      btnRoll.onclick = () => this.callbacks.onAction('roll');
      container.appendChild(btnRoll);
    } else if (phase === 'jail') {
      const btnRoll = document.createElement('button');
      btnRoll.className = 'btn-action';
      btnRoll.innerHTML = '🎲 Lempar Dadu Kembar';
      btnRoll.onclick = () => this.callbacks.onAction('roll');
      container.appendChild(btnRoll);

      if (player.money >= 1125000) {
        const btnBail = document.createElement('button');
        btnBail.className = 'btn-action warning';
        btnBail.innerHTML = '💳 Bayar Denda (Rp1.125.000)';
        btnBail.onclick = () => this.callbacks.onAction('bail');
        container.appendChild(btnBail);
      }

      if (player.heldCards?.some(c => c.kind === 'bail')) {
        const btnJaminan = document.createElement('button');
        btnJaminan.className = 'btn-action success';
        btnJaminan.innerHTML = '📜 Pakai Surat Jaminan';
        btnJaminan.onclick = () => this.callbacks.onAction('usebail');
        container.appendChild(btnJaminan);
      }
    } else if (phase === 'buy') {
      const prop = engine.propertyAt(player.pos);
      if (player.money >= prop.price) {
        const btnBuy = document.createElement('button');
        btnBuy.className = 'btn-action success';
        btnBuy.innerHTML = `🛒 Beli ${engine.tileAt(player.pos)[0]} (${formatRupiah(prop.price)})`;
        btnBuy.onclick = () => this.callbacks.onAction('buy');
        container.appendChild(btnBuy);
      }

      const btnSkip = document.createElement('button');
      btnSkip.className = 'btn-action secondary';
      btnSkip.innerHTML = '⏭️ Lewati Pembelian';
      btnSkip.onclick = () => this.callbacks.onAction('skip');
      container.appendChild(btnSkip);
    } else if (phase === 'salary') {
      // Pembangunan Subsidi atau OKB
      const owned = engine.owned(state, player);
      let canBuildAny = false;

      owned.forEach(k => {
        const b = state.buildings[k] || 0;
        const prop = engine.propertyAt(k);
        const tile = engine.tileAt(k);

        if (b < 2 && player.money >= prop.subsidy) {
          canBuildAny = true;
          const btn = document.createElement('button');
          btn.className = 'btn-action';
          btn.innerHTML = `🏗️ Subsidi ${b + 1}: ${tile[0]} (${formatRupiah(prop.subsidy)})`;
          btn.onclick = () => this.callbacks.onAction('build', k);
          container.appendChild(btn);
        } else if (b === 2 && (state.upgraded[k] || 0) < player.laps && player.money >= prop.okb) {
          canBuildAny = true;
          const btn = document.createElement('button');
          btn.className = 'btn-action warning';
          btn.innerHTML = `🏰 Rumah OKB: ${tile[0]} (${formatRupiah(prop.okb)})`;
          btn.onclick = () => this.callbacks.onAction('build', k);
          container.appendChild(btn);
        }
      });

      const btnDone = document.createElement('button');
      btnDone.className = 'btn-action success';
      btnDone.innerHTML = canBuildAny ? '✅ Selesai Membangun' : '✅ Selesai Gajian';
      btnDone.onclick = () => this.callbacks.onAction('salarydone');
      container.appendChild(btnDone);
    } else if (phase === 'court') {
      const btnCourt = document.createElement('button');
      btnCourt.className = 'btn-action warning';
      btnCourt.innerHTML = '⚖️ Lempar Dadu Sidang';
      btnCourt.onclick = () => this.callbacks.onAction('courtroll');
      container.appendChild(btnCourt);
    } else if (phase === 'toll') {
      if (player.money >= 500000) {
        const btnToll = document.createElement('button');
        btnToll.className = 'btn-action warning';
        btnToll.innerHTML = '🚗 Bayar Tol Rp500.000';
        btnToll.onclick = () => this.callbacks.onAction('tollpay');
        container.appendChild(btnToll);
      }
      const btnStay = document.createElement('button');
      btnStay.className = 'btn-action secondary';
      btnStay.innerHTML = '🛑 Tetap di Sini';
      btnStay.onclick = () => this.callbacks.onAction('skip');
      container.appendChild(btnStay);
    } else if (phase === 'debt') {
      // Menjual aset ke negara 50%
      const owned = engine.owned(state, player);
      owned.forEach(k => {
        const val = engine.saleValue(state, k);
        const tile = engine.tileAt(k);
        const btn = document.createElement('button');
        btn.className = 'btn-action danger';
        btn.innerHTML = `🏷️ Jual ${tile[0]} (+${formatRupiah(val)})`;
        btn.onclick = () => this.callbacks.onAction('sell', k);
        container.appendChild(btn);
      });
    } else if (phase === 'cardroll') {
      const btnCardRoll = document.createElement('button');
      btnCardRoll.className = 'btn-action';
      btnCardRoll.innerHTML = '🎲 Lempar Dadu Nasib Kartu';
      btnCardRoll.onclick = () => this.callbacks.onAction('cardroll');
      container.appendChild(btnCardRoll);
    } else if (phase === 'protect') {
      if (player.shields > 0) {
        const btnProt = document.createElement('button');
        btnProt.className = 'btn-action success';
        btnProt.innerHTML = '🛡️ Gunakan Kartu Pelindung';
        btnProt.onclick = () => this.callbacks.onAction('protect');
        container.appendChild(btnProt);
      }
      const btnAccept = document.createElement('button');
      btnAccept.className = 'btn-action danger';
      btnAccept.innerHTML = '⚡ Terima Efek Musibah';
      btnAccept.onclick = () => this.callbacks.onAction('accept');
      container.appendChild(btnAccept);
    }
  }

  renderCardModal(state) {
    if (state.phase === 'card' && state.card) {
      sounds.playCardDraw();
      const card = state.card;
      this.dom.cardModal.style.display = 'flex';
      this.dom.cardFrame.className = `card-frame ${card.kind === 'fate' ? 'fate' : 'hazard'}`;
      this.dom.modalCardHeader.textContent = card.kind === 'fate' ? '✦ KARTU TAKDIR ✦' : '✉ KARTU MUSIBAH ✉';
      this.dom.modalCardTitle.textContent = card.title;
      this.dom.modalCardDesc.textContent = card.description;

      this.dom.modalCardActions.innerHTML = '';
      const btnResolve = document.createElement('button');
      btnResolve.className = 'btn-action success';
      btnResolve.style.width = '100%';
      btnResolve.style.justifyContent = 'center';
      btnResolve.innerHTML = '✨ Jalankan Efek Kartu';
      btnResolve.onclick = () => {
        this.dom.cardModal.style.display = 'none';
        this.callbacks.onAction('cardresolve');
      };
      this.dom.modalCardActions.appendChild(btnResolve);
    } else if (state.phase === 'cardchoice' && state.card?.effect?.options) {
      this.dom.cardModal.style.display = 'flex';
      const card = state.card;
      this.dom.cardTitle.textContent = card.title;
      this.dom.modalCardDesc.textContent = 'Pilih salah satu opsi:';
      this.dom.modalCardActions.innerHTML = '';

      card.effect.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.style.width = '100%';
        btn.style.justifyContent = 'center';
        btn.textContent = opt.label;
        btn.onclick = () => {
          this.dom.cardModal.style.display = 'none';
          this.callbacks.onAction('cardchoice', idx);
        };
        this.dom.modalCardActions.appendChild(btn);
      });
    } else {
      this.dom.cardModal.style.display = 'none';
    }
  }
}
