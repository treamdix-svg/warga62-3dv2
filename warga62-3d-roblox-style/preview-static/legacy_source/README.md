# Warga +62

Dibuat oleh **Xtream**. Warga berusaha bertahan hidup sementara negara semakin kaya. **Permainan selesai saat tinggal satu warga yang bertahan; dialah pemenangnya.**

© 2026 Xtream. Seluruh hak cipta dilindungi.

Pembaruan terbaru: papan pentagon, tema baru, dadu lebih cepat, modal Rp13 juta — lihat [VISUAL-UPDATE.md](VISUAL-UPDATE.md). Tampilan web ada di folder `client/` (`page.html`, `style.css`, `app.js`) dan dirakit oleh `client-page.mjs`.

## Bermain

Buka https://game.storenya.online. Pilih **Buat Permainan**, bagikan kode, lalu pemain kedua memilih **Gabung Permainan**. Host memulai setelah minimal 2 dan sampai 15 warga bergabung (ruang bot: 1–14 lawan AI). **Cara Bermain** memuat aturan lengkap. **Main melalui Telegram** membuka bot yang mendaftarkan username-nya melalui API sinkronisasi. Menu Telegram belum dapat membuka bot sebelum kode bot Contabo diperbarui dan dijalankan.

Web dan Telegram memakai state server yang sama. `/connect KODE_TAUTAN` menautkan akun Telegram ke pemain web; gunakan tombol Tautkan Telegram untuk memperoleh kode pribadi. Jangan membuat pemain baru untuk melanjutkan pemain lama. `/web` pada bot mengirim tautan pribadi. Browser menyimpan akses pemain agar refresh atau menutup halaman tidak menghapus identitas; jangan bagikan tautan pribadi atau kode penautan.

## Aturan utama

Papan pentagon 45 petak (lima sudut, lima sisi, satu pulau per sisi) dan harga aset dipertahankan. Modal awal tiap warga Rp13 juta. Dua dadu memindahkan pion sekali. Kembar tidak memberi giliran tambahan, tetapi setelah efek lokasi wajib menarik satu kartu Takdir (kembar saat keluar Lapas tidak). Pemain pertama diacak saat permainan dimulai. Aset baru bisa dibeli setelah 1 putaran. Dadu keluar penjara dan satu dadu kartu mengikuti aturan masing-masing.

Melewati Mulai memberi gaji Rp1 juta dan kesempatan membangun. Maksimal dua Subsidi; OKB tersedia pada gajian berikutnya setelah Subsidi 2. Pembayaran langsung dilakukan bila saldo cukup. Bila kurang, jual aset ke negara sebesar 50% nilai tanah beserta bangunannya. Bila kewajiban tetap tidak terpenuhi, bangkrut. Tanah sitaan menghasilkan sewa untuk negara.

Penjara dapat ditinggalkan dengan dadu kembar (1 lempar per giliran), pembayaran Rp1.125.000, atau kartu bebas penjara. Pada giliran ke-3 sejak masuk, pemain bebas otomatis tanpa bayar. Pilihan dan biaya tampil sesuai fase server.

Dua deck terpisah: 33 Takdir biasa, 33 Musibah biasa, serta 16 stopwatch untuk masing-masing deck (98 kartu). Stopwatch berada di luar kocokan sampai semua warga aktif melewati 2 putaran; aktivasi terjadi sekali. Pembebasan Lahan (Takdir, dengan ganti rugi harga tanah) dan Tanah Longsor (Musibah, tanpa ganti rugi) mengubah tanah kosong milikmu menjadi jalan tol. Biaya tol Rp500.000 tidak bisa dipotong kartu diskon. Daftar lengkap: [CARDS.md](CARDS.md). Kartu simpan tidak ikut kocokan sebelum dipakai; buangan yang sah dikocok ketika deck habis. Perpindahan, syarat, pilihan otomatis, dan batas efek tercantum pada kartu.

## Hadiah untuk pemenang (opsional, dari host)

Saat membuat room online, host melihat langkah **"Mau beri hadiah?"**: isi tautan/teks (mis. DANA Kaget) dan/atau unggah gambar (mis. QR; otomatis diperkecil ≤ ±40 KB), atau pilih **Lewati — main biasa**. Hadiah bisa diubah/dihapus di lobi selama permainan belum dimulai. Isinya tidak pernah ada di state publik; hanya pemenang (warga terakhir) yang dapat membukanya setelah game selesai, dan pemenang yang tertaut Telegram menerima pesan sekali di chat pribadinya (lewat `game-sync.mjs`; **pasang ulang kode bot Contabo dari `release/warga62-contabo-code.tar.gz`**). Room melawan AI tidak memakai hadiah, dan siapa pun tetap bisa bermain tanpa hadiah.

## Hingga 15 pemain, AFK, dan masuk kembali

- **15 pemain** per room (web dan Telegram). Pion tiap pemain punya warna, nomor, dan label nama; pion giliran berdenyut dengan panah, pionmu bertanda KAMU. Ketuk nama pemain di daftar untuk menemukan pionnya. Room ramai (9+ warga aktif) mendapat jam keputusan 40% lebih pendek.
- **Batas AFK** (room online): giliran tanpa tindakan manual = 1 strike. Sejak strike ke-1, jam lempar dadu (termasuk lempar keluar Lapas) hanya 12 detik. Strike ke-2: semua keputusan jadi 20 detik. Strike ke-4: pemain dikeluarkan otomatis (aset ke negara, seperti Menyerah). Satu tindakan manual menghapus strike. Pemain AI tidak terkena.
- **Refresh aman, keluar tidak sengaja bisa masuk lagi**: identitas pemain disimpan di sessionStorage (refresh) dan localStorage (tab/browser tertutup). Dari perangkat lain: tab Online → isi nama yang sama, kode room, dan **kode masuk kembali** 6 angka (tampil di lobi dan Menu Permainan). Hanya hash kode yang disimpan server; percobaan salah dibatasi 40 kali per room.

## Kontrol permainan

Menu Permainan menyediakan Keluar / Menyerah dan Akhiri Permainan. Menyerah menyelesaikan efek/tagihan yang sudah menunggu, lalu saldo dan aset tersisa menjadi milik negara; sisa utang setelah aset habis dicatat sebagai tidak tertagih. Akhiri Permainan hanya untuk pembuat ruang dan menyimpan ringkasan kewajiban tanpa menjalankan keputusan baru. Kedua tindakan membutuhkan konfirmasi. Kembali ke Lobi membuat ruang baru bersama, sambil menyimpan ruang selesai sebagai arsip. Menutup halaman tidak menyerah.

## Timer online

Pengadilan 3–4: Lapas + denda Rp1.125.000. Parkiran Pungli Rp750.000 (gratis bagi pemilik Bandung).

Lempar 30 detik: tidak ditekan = dadu dilempar otomatis (semi-otomatis); pemain yang sudah AFK (strike) atau keluar game: lewat waktu = masuk Lapas dan giliran dilewati. Beli/bangun/tol 90 detik, tetapi tanpa gerakan sampai detik 55 = dianggap AFK, sisa giliran dilewati (gerakan pertama memperpanjang ke 90 detik). Kartu, dadu nasib, dan pelindung 45 detik; pilihan/target kartu 45; utang 180; keluar penjara 60; lanjut giliran 15. Animasi dadu 2,6 detik dan selalu tampil untuk semua pemain (nomor lemparan unik). Kartu tampil sebagai panel samping/bawah sehingga papan tetap terlihat.

Timeout lempar pertama melempar otomatis; pemain yang sudah AFK langsung ke Lapas; lempar manual mereset hitungan timeout. Pembelian otomatis dilewati; pembangunan otomatis diselesaikan. Utang otomatis menjual berdasarkan **nilai jual terkecil**, kemudian **indeks petak terkecil**, hingga cukup atau bangkrut. Pilihan kartu memakai pilihan sah pertama; target memakai pemain/aset sah pertama. Kartu dice otomatis dilempar. Telegram mengingatkan sekali pada 15 detik, tanpa edit setiap detik.

Server memproses timeout dan aktivasi walaupun browser/bot tertutup. Restart membaca deadline tersimpan. Migrasi mempertahankan pemain, uang, aset, dan kartu lama yang sedang diselesaikan. Permainan lama tanpa timestamp mulai mendapat timestamp saat migrasi karena waktu awal sebenarnya tidak tersedia.

## Pemasangan dua VPS

Ikuti [DEPLOYMENT.md](DEPLOYMENT.md). Web berada di IDCloudHost; bot hanya di Contabo. Jangan menjalankan bot IDCloudHost. Jangan menyalin `.env`, data room, atau runtime bot dari satu VPS ke lainnya.

## Verifikasi

`npm test` menguji mesin bersama, animasi/state, semua kartu, timer/CAS, restart, geometri papan, startup, dan alur dua pemain hingga selesai. `npm run test:http` membutuhkan izin membuka port lokal. `npm run test:browser` membutuhkan Chromium yang diizinkan berjalan. Pengujian API Telegram memakai adapter lokal dan tidak mengirim pesan ke Telegram sungguhan.

## Aset dan lisensi

Ilustrasi papan SVG, desain papan, teks dan katalog kartu dibuat dalam proyek Warga +62. Font memakai font sistem; tidak mengambil font/ilustrasi eksternal saat bermain. Node.js, PM2, Chromium, dan komponen sistem tetap milik pembuatnya dengan lisensi masing-masing. Pemberitahuan lisensi dependensi tidak dihapus atau diklaim sebagai karya Xtream.


## Musik latar yang dikelola pengelola

- **Pemain hanya bisa mengecilkan volume** (slider Volume utama, Musik latar, Efek) di panel Suara. Gaya musik, daftar YouTube, pemutar video, dan lagu berikutnya tidak tersedia untuk pemain; pengaturan musik/efek yang pernah dimatikan di perangkat lama diabaikan (slider 0 = senyap).
- **Pengelola** membuka `/owner-musik` di domain game dan memasukkan kunci (`WARGA_OWNER_KEY` di `.env`). Di sana ada: gaya musik bawaan (Game modern / Lagu daerah), pakai daftar YouTube atau tidak, tampilkan pemutar video atau tidak, serta daftar lagu YouTube (maks. 30; link `watch?v=`, `youtu.be`, `shorts`, `embed`, `music.youtube.com`; video tanpa embed ditolak). Semua pengaturan berlaku untuk semua pemain (disimpan di server, `config/music`).
- Daftar YouTube berisi lagu + dinyalakan = diputar acak lewat pemutar resmi YouTube menggantikan musik bawaan (pemutar tersembunyi kecuali dinyalakan; aturan YouTube menganjurkan pemutar terlihat). Daftar kosong atau dimatikan = musik bawaan sesuai gaya yang dipilih.
- Lagu tidak diunduh atau disimpan (hanya ID dan judul). Kunci salah 8 kali = penguncian 10 menit. Tes: `node self-test-music.mjs`.
