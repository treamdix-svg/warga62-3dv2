# Susunan papan dan ekonomi Warga +62

Engine di `game-engine.mjs` adalah sumber tunggal susunan petak dan harga. Halaman web dibuat dari factory engine dan katalog kartu tersebut; timer, aksi room, scheduler, AI server, serta tombol dan ringkasan Telegram memakai instance engine server yang sama.

Papan berbentuk **pentagon** berisi 45 petak: lima sudut dan lima sisi. Kelima sudut berurutan (searah jarum jam) adalah `start` (Mulai, indeks 0), `jail` (Lapas, 9), `tax-annual` (Pajak Tahunan, 18), `court` (Pengadilan, 27), dan `parking-pungli` (Parkiran Pungli, 36). Setiap sisi memuat delapan petak: lima kota satu pulau, ditambah Takdir, Musibah, dan Tol/Tilang. Satu sisi = satu pulau/kompleks: Sumatra (1–8), Kalimantan (10–17), Sulawesi (19–26), Papua (28–35), Jawa (37–44). ID kota dan petak khusus menjadi identitas aturan; indeks hanya posisi jalur.

Tata letak mengikuti papan fisik WNI Simulator: tiap pulau punya warna sendiri (Sumatra merah, Kalimantan kuning, Sulawesi hijau, Papua biru, Jawa ungu). Permainan tersimpan dari papan persegi (mesin versi 6/7) dimigrasikan otomatis berdasarkan ID stabil, sehingga posisi, kepemilikan, saldo, dan harga historis aset tetap terjaga.

Modal awal semua permainan baru ditetapkan Rp13.000.000 per pemain; nominal tidak dapat dipilih host. Pembelian tanah tertinggi adalah Jakarta Rp5.500.000. Harga naik mengikuti arah jalan pion: Aceh termurah, Jakarta termahal. Susunan papan versi 9: Sumatra (Aceh, Medan, Tol, Lampung, Padang, Takdir, Batam, Tilang), Kalimantan (Pontianak, Takdir, Palangkaraya, Banjarmasin, Musibah, Takdir, Samarinda, IKN), Sulawesi (Makassar, Tol, Musibah, Takdir, Manado, Palu, Gorontalo, Kendari), Papua (Sorong, Jayapura, Manokwari, Timika, Tol, Merauke, Takdir, Musibah), Jawa (Surabaya, Yogyakarta, Musibah, Bandung, Solo, Takdir, Musibah, Jakarta). Balikpapan diganti IKN. Denda/pajak, sewa, subsidi, dan OKB tetap memakai angka rupiah pada tabel/aturan server. Room tersimpan yang sudah berjalan mempertahankan modal dan riwayat lamanya.

Semua angka dalam rupiah. Sewa berurutan: tanah kosong / Subsidi I / Subsidi II / OKB. Tarifnya masing-masing 10%, 22%, 40%, dan 75% dari harga beli. Harga subsidi berlaku untuk tiap tingkat Subsidi; OKB dibayar satu kali.

| Wilayah | Kota | Beli | Subsidi per tingkat | OKB | Sewa kosong / I / II / OKB |
|---|---|---:|---:|---:|---|
| Sumatra | Aceh | 1.500.000 | 300.000 | 700.000 | 150.000 / 330.000 / 600.000 / 1.125.000 |
| Sumatra | Medan | 1.700.000 | 300.000 | 700.000 | 170.000 / 374.000 / 680.000 / 1.275.000 |
| Sumatra | Lampung | 1.900.000 | 300.000 | 700.000 | 190.000 / 418.000 / 760.000 / 1.425.000 |
| Sumatra | Padang | 2.000.000 | 300.000 | 700.000 | 200.000 / 440.000 / 800.000 / 1.500.000 |
| Sumatra | Batam | 2.100.000 | 300.000 | 700.000 | 210.000 / 462.000 / 840.000 / 1.575.000 |
| Kalimantan | Pontianak | 2.200.000 | 350.000 | 750.000 | 220.000 / 484.000 / 880.000 / 1.650.000 |
| Kalimantan | Palangkaraya | 2.200.000 | 350.000 | 750.000 | 220.000 / 484.000 / 880.000 / 1.650.000 |
| Kalimantan | Banjarmasin | 2.400.000 | 350.000 | 750.000 | 240.000 / 528.000 / 960.000 / 1.800.000 |
| Kalimantan | Samarinda | 2.500.000 | 350.000 | 750.000 | 250.000 / 550.000 / 1.000.000 / 1.875.000 |
| Kalimantan | IKN | 2.500.000 | 350.000 | 750.000 | 250.000 / 550.000 / 1.000.000 / 1.875.000 |
| Sulawesi | Makassar | 2.500.000 | 400.000 | 800.000 | 250.000 / 550.000 / 1.000.000 / 1.875.000 |
| Sulawesi | Manado | 2.700.000 | 400.000 | 800.000 | 270.000 / 594.000 / 1.080.000 / 2.025.000 |
| Sulawesi | Palu | 2.800.000 | 400.000 | 800.000 | 280.000 / 616.000 / 1.120.000 / 2.100.000 |
| Sulawesi | Gorontalo | 2.800.000 | 400.000 | 800.000 | 280.000 / 616.000 / 1.120.000 / 2.100.000 |
| Sulawesi | Kendari | 2.800.000 | 400.000 | 800.000 | 280.000 / 616.000 / 1.120.000 / 2.100.000 |
| Papua | Sorong | 3.000.000 | 450.000 | 850.000 | 300.000 / 660.000 / 1.200.000 / 2.250.000 |
| Papua | Jayapura | 3.100.000 | 450.000 | 850.000 | 310.000 / 682.000 / 1.240.000 / 2.325.000 |
| Papua | Manokwari | 3.200.000 | 450.000 | 850.000 | 320.000 / 704.000 / 1.280.000 / 2.400.000 |
| Papua | Timika | 3.300.000 | 450.000 | 850.000 | 330.000 / 726.000 / 1.320.000 / 2.475.000 |
| Papua | Merauke | 3.400.000 | 450.000 | 850.000 | 340.000 / 748.000 / 1.360.000 / 2.550.000 |
| Jawa | Surabaya | 3.500.000 | 500.000 | 900.000 | 350.000 / 770.000 / 1.400.000 / 2.625.000 |
| Jawa | Yogyakarta | 3.700.000 | 500.000 | 900.000 | 370.000 / 814.000 / 1.480.000 / 2.775.000 |
| Jawa | Bandung | 4.400.000 | 500.000 | 900.000 | 440.000 / 968.000 / 1.760.000 / 3.300.000 |
| Jawa | Solo | 4.800.000 | 500.000 | 900.000 | 480.000 / 1.056.000 / 1.920.000 / 3.600.000 |
| Jawa | Jakarta | 5.500.000 | 500.000 | 900.000 | 550.000 / 1.210.000 / 2.200.000 / 4.125.000 |

Nilai jual kembali adalah 50% dari harga beli dan biaya bangunan yang tercatat saat aset diperoleh. Migrasi menyimpan basis tersebut pada aset lama, jadi harga baru tidak menambah keuntungan atau mengurangi nilai investasi historis pemain.

## Aturan sewa kompleks & kembar (diperbarui)
- Modal awal Rp13.000.000. Aset hanya bisa dibeli setelah menyelesaikan 1 putaran (melewati Mulai).
- Tiap pulau punya 5 kota: satu kompleks 2 kota dan satu kompleks 3 kota (warna sama di papan).
- Pemilik satu kompleks penuh: sewa ×2. Pemilik seluruh pulau: sewa ×3. Kota yang berubah jadi jalan tol memutus bonus.
- Dadu kembar: tidak jalan dua kali, tetapi wajib menarik satu kartu Takdir setelah efek lokasi selesai (ikut video WNI Simulator).
- Setelah giliran berpindah ada jeda ±2,8 detik agar pembayaran terlihat semua pemain; kartu yang dibuka tampil penuh di tengah untuk semua pemain.
- Layar akhir: pemenang + statistik (tanah, rumah, saldo, kekayaan) dan lama permainan terlihat semua; link/QRIS sponsor hanya untuk pemenang.
- Lapas: 1 lempar per giliran mencari dadu kembar. Kembar membebaskan dan langsung bergerak (tanpa Takdir wajib). Gagal: giliran berpindah. Pada giliran ke-3 sejak masuk, bebas otomatis tanpa bayar. Alternatif: bayar Rp1.125.000 atau pakai Surat Jaminan.
- Pengadilan 3–4: Lapas + denda Rp1.125.000 (turun 25%); 5–6 kompensasi tetap Rp1.000.000; 1–2 Lapas + 50% saldo. Parkiran Pungli Rp750.000. Tol Rp500.000 tanpa diskon.
- Pemain pertama diacak saat permainan dimulai.
- Kartu: 98 (33 Takdir + 33 Musibah + 16 + 16 stopwatch; stopwatch masuk setelah semua warga 2 putaran). Kartu undian dadu genap/ganjil membayar dan menagih nominal yang sama.
