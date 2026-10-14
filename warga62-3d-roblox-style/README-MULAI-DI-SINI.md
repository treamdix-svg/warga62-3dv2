# WARGA +62 — 3D Dunia Nusantara (v3)

Versi 3D lokal dari Warga +62. **Hanya visual yang dirombak.** Aturan, kartu, ekonomi, dadu, dan giliran dijalankan oleh engine asli (`legacy_source/game-engine.mjs` + `legacy_source/cards.mjs`, tidak diubah). Paket ini **tidak terhubung ke VPS produksi** dan tidak memakai token bot.

## Cara menjalankan

**Windows (tanpa `npm install`):** klik dua kali `JALANKAN_PREVIEW_WINDOWS.bat` (butuh Node.js), lalu buka `http://localhost:5180`. Server hanya bisa diakses dari komputer sendiri.

**Mode pengembangan:**

```powershell
npm install
npm run dev        # buka alamat dari Vite (biasanya http://localhost:5173)
npm run build      # menghasilkan dist/
npm run serve      # menyajikan dist/ di http://localhost:5180
npm run test:engine  # simulasi 60 permainan penuh memakai engine asli
```

Opsi alamat: `?quality=low` (HP) / `?quality=high` (PC), `?autostart=4` (langsung main 4 warga).

## Isi dunia 3D

- **Jalur 45 petak** bersambung seperti papan asli. Tiap petak menampilkan **gambar landmark kotanya** (dirender dari model 3D-nya sendiri) dan pita nama, tanpa nomor. Bingkai petak berwarna pulau dan berubah ke warna pemilik.
- **Satu petak = satu paket**: tanah (lot properti) menempel di sisi dalam, kota (landmark khas) menempel di sisi luar.
- **Tanah properti** mengikuti level engine: tanah kosong (lahan + patok, bingkai warna pulau), Subsidi 1 (rumah kecil), Subsidi 2 (rumah bertingkat), OKB (villa + kolam + mahkota). Perubahan tampil langsung dengan animasi.
- **Landmark utama pulau** (model 3D lengkap dengan taman): Jam Gadang (Sumatra), Tugu Khatulistiwa (Kalimantan), Tongkonan (Sulawesi), Honai (Papua), Monas (Jawa).
- **Klaster 25 kota**, misalnya: Masjid Raya Baiturrahman (Aceh), Istana Maimun (Medan), Menara Siger (Lampung), Rumah Gadang (Padang), pelabuhan + Barelang (Batam), Tugu Khatulistiwa mini + Kapuas (Pontianak), pasar terapung (Banjarmasin), Jembatan Mahakam (Samarinda), Istana Garuda (IKN), Pantai Losari (Makassar), Jembatan Ponulele (Palu), Benteng Otanaha (Gorontalo), Raja Ampat + pelabuhan (Sorong), bukit JAYAPURA, Puncak Jaya + tambang (Timika), Tugu Km 0 + rumah rayap Musamus (Merauke), Tugu Pahlawan (Surabaya), Tugu Jogja + candi + pasar (Yogyakarta), Gedung Sate (Bandung), Keraton (Solo), Monas mini + skyline (Jakarta).
- Petak **Takdir dan Musibah** sengaja tanpa landmark. Petak Tol/Tilang diberi kampung rumah adat pulau.
- Kota pusat (gedung, stadion, bundaran, masjid), sungai + jembatan, pegunungan, hutan berinstansi, kendaraan, perahu, burung, dan balon udara.
- Avatar blok dengan animasi berjalan mengikuti jalur. Dadu 3D memantul dan berhenti di angka hasil engine.
- Kamera: Ikuti, Isometrik, Ikhtisar, Atas, Geser (putar/zoom/geser).
- Efek suara prosedural, efek koin/konfeti, panel kartu di bawah (tidak menutupi dunia).

## Status integrasi — apa adanya

| Fitur | Status |
|---|---|
| Dua dadu, giliran, modal, beli, bangun (Subsidi/OKB), sewa ×2/×3, pajak, pungli, tilang, pengadilan, lapas (kembar/bayar/jaminan), tol + pilih tujuan, utang & jual aset, bangkrut, pemenang | **Berjalan** (engine asli) |
| Semua 16 fase engine punya tombol HUD, termasuk `cardchoice`, `cardtarget`, `swappick`, `roadpick`, `tollmove`, voucher subsidi | **Berjalan** |
| 98 kartu Takdir/Musibah termasuk stopwatch | **Berjalan** (engine asli) |
| Room online, reconnect, multiplayer, timer & aturan AFK, bot AI, Telegram | **Belum tersambung.** Fitur ini ada di server VPS, tidak ada di paket ini. Versi ini hot-seat lokal 2–15 pemain di satu perangkat. |

## Pengujian yang sudah dijalankan

- `npm run build` sukses.
- `npm run test:engine`: 60 permainan penuh (2–7 pemain), hanya memakai aksi yang ditawarkan HUD. Semuanya selesai, tanpa error dan tanpa kebuntuan.
- Autopilot browser (Chromium + WebGL software) mengklik tombol HUD lintas fase roll, card, cardroll, cardchoice, cardtarget, toll, tollmove, court, salary, buy, tanpa error JavaScript.
- Draw call diukur: profil HP pada kamera ikuti sekitar 107 draw call dan sekitar 150 ribu segitiga tanpa bayangan.
- **Belum diuji di HP Android sungguhan.** Lingkungan pengujian tidak punya GPU. Uji di Chrome Android sebelum dirilis; bila berat, pakai `?quality=low`.
