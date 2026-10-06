<div align="center">
  <img src="assets/logo-mark.svg" alt="Logo Terakhir Kali" width="96" height="96">

# Terakhir Kali

Catat hal-hal yang penting bagimu, lalu lihat sudah berapa lama sejak terakhir kali kamu melakukannya.

</div>

## Tentang

**Terakhir Kali** adalah aplikasi HP yang menunjukkan sudah berapa lama sejak kamu terakhir menelepon Ibu, bertemu sahabat lama, atau memeriksakan gigi. Daftar diurutkan agar hal yang paling lama terlewat selalu ada di atas.

Aplikasi ini sengaja dibuat tenang. Ia hanya menyampaikan fakta, keputusannya tetap di tanganmu.

- Tanpa streak, target, skor, atau rasa bersalah
- Pengingat hanya jika kamu memilihnya sendiri
- Tanpa akun, sinkronisasi cloud, iklan, atau analitik
- Semua data tersimpan di perangkat

## Unduh

Ambil APK terbaru dari [halaman Releases](https://github.com/zmy16/terakhir-kali-app/releases/latest), lalu pasang di HP Android. Jika diminta, izinkan pemasangan dari browser atau pengelola file lewat **Install unknown apps**. Setiap rilis mencantumkan checksum SHA-256 untuk memverifikasi file.

## Fitur

- **Yang paling lama di atas.** Urutan berdasarkan `lastDoneAt` terlama, lalu `updatedAt` terlama, lalu `id`.
- **Durasi berbasis kalender.** Tanggal dibandingkan sebagai tanggal kalender lokal, bukan selisih 24 jam. Hari ini tampil `Baru saja`, selebihnya tahun penuh, lalu bulan penuh, lalu hari.
- **Tambah, ubah, hapus.** Judul maksimal 80 karakter dan tanggal masa depan ditolak. Tanggal dipilih lewat pemilih tanggal bawaan sistem.
- **Tandai hari ini.** Meminta konfirmasi, lalu menyediakan satu kali undo.
- **Profil lokal.** Hanya berisi nama tampilan, dipakai untuk sapaan sesuai jam. Ini bukan akun login.
- **Tema gelap dan terang** dari sheet pengaturan.
- **Pengingat lembut opsional.** Satu notifikasi lokal sekali jalan, pada waktu yang dipilih untuk satu aktivitas. Tidak ada pengulangan otomatis; izin notifikasi diminta hanya saat pengingat disimpan.
- **Backup JSON.** Export langsung ke folder Download di Android. Import menggabungkan data dan tidak pernah menghapus data yang ada.
- **Kondisi loading, kosong, dan error penyimpanan**, lengkap dengan tombol coba lagi jika data tersimpan gagal dibaca.

> [!NOTE]
> Teks antarmuka aplikasi berbahasa Indonesia.

## Tech stack

| Bagian | Pilihan |
| --- | --- |
| Framework | [Expo](https://expo.dev) SDK 57, React Native 0.86, React 19.2 |
| Bahasa | TypeScript 6 (`strict`) |
| Penyimpanan | `expo-sqlite` key-value store, dengan payload JSON yang berversi dan divalidasi |
| Backup | `expo-file-system`, `react-native-file-access`, `expo-document-picker` |
| Input tanggal | `@react-native-community/datetimepicker` |
| Pengingat lokal | `expo-notifications` |
| Grafik | `react-native-svg` untuk logo dan ikon |
| Tata letak | `react-native-safe-area-context` |
| Unit test | Test runner bawaan Node (`node:test`) lewat `tsx` |
| Build | [EAS Build](https://docs.expo.dev/build/introduction/) |

Tidak ada library navigasi, state manager, atau UI kit. Aplikasi ini satu layar dengan bottom sheet, jadi semuanya tidak dibutuhkan.

## Memulai

Prasyarat: Node.js dan npm (dikembangkan dengan Node 24), serta [Expo Go](https://expo.dev/go) di HP Android atau emulator Android.

```bash
npm install
npm start
```

Scan kode QR dengan Expo Go. Jika HP dan komputer tidak berada di jaringan yang sama, pakai tunnel:

```bash
npm run start:tunnel
```

> [!TIP]
> Jika Expo Go menampilkan `Cannot connect to Expo CLI`, biasanya tunnel lama masih berjalan. Hentikan proses yang memakai port `8081`, jalankan ulang, lalu scan QR yang baru.

### Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm start` | Jalankan dev server |
| `npm run android` | Jalankan dan buka di Android |
| `npm run ios` | Jalankan dan buka di iOS |
| `npm run start:tunnel` | Dev server lewat tunnel |
| `npm run start:lan` | Dev server lewat jaringan lokal |
| `npm test` | Jalankan unit test |
| `npm run typecheck` | Cek tipe dengan `tsc --noEmit` |

## Struktur proyek

```text
terakhir-kali-app/
├── App.tsx                   Layar utama, bottom sheet, dan komponen UI
├── index.ts                  Titik masuk aplikasi
├── src/
│   ├── activity.ts           Durasi, validasi, dan pengurutan
│   ├── storage.ts            Simpan dan muat aktivitas (Expo SQLite key-value)
│   ├── storage-codec.ts      Encode dan validasi payload tersimpan
│   ├── profile.ts            Nama profil lokal
│   ├── backup.ts             Format backup dan logika penggabungan
│   ├── backup-file.ts        Export dan import lewat sistem file
│   ├── interaction-copy.ts   Teks untuk aksi "Tandai hari ini"
│   └── *.test.ts             Unit test untuk modul di atas
├── assets/                   Logo dan ikon aplikasi
├── scripts/                  Pembuat ikon aplikasi
├── app.json                  Konfigurasi Expo
├── eas.json                  Profil EAS Build
├── package.json              Dependensi dan script npm
└── tsconfig.json             Konfigurasi TypeScript
```

Logika bisnis ada di `src/` sebagai fungsi biasa tanpa ketergantungan pada React, sehingga bisa diuji di Node tanpa perangkat.

## Model data

```ts
type Activity = {
  id: string;
  title: string;
  lastDoneAt: string; // tanggal kalender lokal, YYYY-MM-DD
  createdAt: string;  // timestamp ISO
  updatedAt: string;  // timestamp ISO
};
```

Aktivitas disimpan di satu key dengan field versi. Data tersimpan divalidasi saat dibaca. Jika payload rusak, aplikasi menampilkan error penyimpanan dengan tombol coba lagi.

### Format backup

```json
{
  "version": 1,
  "exportedAt": "2026-10-04T16:09:58.000Z",
  "profileName": "Raid",
  "activities": []
}
```

Saat import, data digabung berdasarkan `id`. Jika `id` yang sama ada di kedua sisi, data dengan `updatedAt` lebih baru yang dipakai.

> [!IMPORTANT]
> Data hanya ada di perangkat. Menghapus aplikasi atau berpindah HP akan menghapusnya. Lakukan export backup lebih dulu.

## Membuat APK

APK dibuat dengan EAS Build. Profil `preview` di `eas.json` menghasilkan APK yang bisa langsung dipasang dan menaikkan `versionCode` secara otomatis.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Build berjalan di server Expo dan berakhir dengan tautan unduhan. Package name Android adalah `com.raidm.terakhirkali`.

> [!NOTE]
> `owner` dan `extra.eas.projectId` di `app.json` menunjuk ke akun Expo penulis asli. Untuk membuild dengan akunmu sendiri, jalankan `npx eas-cli@latest init` lalu perbarui nilai tersebut.

## Pengujian

```bash
npm test
npm run typecheck
```

Unit test mencakup format durasi, validasi input, urutan aktivitas, format dan penggabungan backup, codec penyimpanan, serta teks aksi. Pengujian UI dijalankan terpisah dengan Katalon Studio terhadap APK yang terpasang, dan tidak termasuk dalam repositori ini.

## Status platform

| Platform | Status |
| --- | --- |
| Android | APK tersedia; pengingat dan export Download memerlukan build native, bukan Expo Go |
| iOS | Sudah dikonfigurasi di `app.json`, tetapi belum dibuild atau diuji |
