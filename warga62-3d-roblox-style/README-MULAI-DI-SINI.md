# WARGA +62 — 3D Dunia Nusantara (percobaan visual)

Versi ini dibuat dari source Warga +62 3D yang dikirim. File aslinya **tidak diubah**, dan paket ini **tidak terhubung ke VPS**.

## Langsung coba di Windows

1. Ekstrak ZIP ke folder baru, misalnya `Desktop\\warga62-3d-roblox-style`.
2. Klik dua kali `JALANKAN_PREVIEW_WINDOWS.bat` (memerlukan Node.js).
3. Buka `http://localhost:5180` di Chrome. Bila browser muncul lebih dulu, refresh setelah server siap.
4. Coba lempar dadu, perbesar/pindahkan kamera, atau klik titik lokasi.
5. Tutup jendela terminal preview untuk menghentikannya.

Versi preview ini memakai modul Three.js lokal dalam `preview-static/vendor/`, sehingga **tidak perlu `npm install`**. Situs preview hanya dapat diakses dari komputer sendiri (`127.0.0.1`).

## Mode pengembangan melalui Vite

Di PowerShell (dalam folder proyek):

```powershell
npm install
npm run dev
```

Lalu buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Apa yang diganti

- Papan kaku diganti pulau hijau berbentuk organik, tebing, air, gunung, awan, pepohonan, kota kecil, dan jalan.
- 45 lokasi dipertahankan urutannya, tetapi ditampilkan sebagai checkpoint bundar yang bisa diklik, bukan petak persegi panjang.
- Avatar pemain menjadi karakter kotak/cartoon bergaya permainan 3D.
- Properti tanah dibangun di sisi dalam jalan agar tidak menutupi checkpoint.
- Kamera dan UI disesuaikan untuk desktop dan HP.
- Logika inti masih mengimpor `legacy_source/game-engine.mjs` dan `legacy_source/cards.mjs` tanpa modifikasi.

## Batasan dan status pengujian

- **Ini mode permainan lokal/demonstrasi**, memakai empat pemain contoh. Belum tersambung dengan multiplayer, room, data asli, atau bot Telegram.
- Kode JavaScript telah diperiksa sintaksnya; pembuatan scene (45 checkpoint), HUD, dan simulasi tombol dadu telah diuji pada browser dengan renderer pengganti.
- Lingkungan pengujian tidak menyediakan WebGL, sehingga visual 3D sebenarnya dan performa mobile belum dapat diverifikasi dengan rendering nyata di sini. Uji pada Chrome Windows sebelum menerbitkan.
- Build Vite di lingkungan ini tidak berhasil dijalankan karena paket ZIP sebelumnya menyertakan dependensi yang ditujukan untuk Windows dan unduhan instalasi dependensi baru tidak tersedia. Jalankan `npm install && npm run build` di Windows jika hendak menyiapkan bundle produksi.
- Tidak ada deployment, konfigurasi ulang, atau modifikasi pada VPS produksi.

**Penting**: jangan menimpa folder `/home/xtream/warga62-vps` atau mengganti domain produksi. Jangan menggunakan token bot produksi di mode preview.
