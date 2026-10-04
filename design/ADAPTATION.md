# Adaptasi desain: Terakhir Kali

Sumber arah:

- `design/design.md`
- `design/index-1.html`
- `design/index-2.html`
- `design/index-3.html`

## Design read

Aplikasi HP personal untuk orang sibuk yang ingin sadar pada hubungan dan kebiasaan bermakna, dengan bahasa visual editorial yang hangat dan tenang.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1.

## Yang dipakai

- Kanvas gelap obsidian, surface tonal, garis batas tipis.
- Banner utama forest green sebagai ruang refleksi.
- Coral hangat sebagai aksen tindakan utama dan status terpilih.
- Serif editorial untuk pertanyaan atau refleksi utama.
- Sans untuk daftar aktivitas, tanggal, dan kontrol.
- Spacing modular 4px/8px, margin layar 16px.
- Radius: banner 24px, kartu 16px, kontrol 8px sampai 12px.
- Elevasi tonal, bukan bayangan kabur.
- Bottom sheet untuk form, konfirmasi reset, dan konfirmasi hapus.

## Yang tidak dipakai

Contoh UI berasal dari aplikasi fitness. Terakhir Kali tidak memakai:

- Avatar, profil, notifikasi, streak, skor, target, atau statistik kebugaran.
- Foto olahraga, emoji dekoratif, maskot, ring chart, dan klaim sinkronisasi.
- Tab bar lima item. MVP punya satu layar daftar, jadi navigasi bawah tidak dibutuhkan.
- Kartu carousel, bento grid, atau badge status tanpa data nyata.
- Glow, loop animasi, atau backdrop blur sebagai gaya umum.

## Light theme

Light theme memakai forest sebagai warna utama dan coral sebagai aksen terbatas, bukan sekadar membalik warna dark theme.

Target token awal:

| Peran | Dark | Light |
| --- | --- | --- |
| Background | `#121316` | `#F7F5F0` |
| Surface | `#1E2026` | `#FFFFFF` |
| Surface elevated | `#252830` | `#EEEAE2` |
| Border | `#2B2E37` | `#D8D2C7` |
| Text utama | `#F4F4F6` | `#20231F` |
| Text sekunder | `#B7BBC5` | `#5E625C` |
| Forest | `#2A4032` | `#31533E` |
| Coral | `#FF6347` | `#B84332` |
| Fokus | `#F7B267` | `#8B4A1D` |

Final color pairings require WCAG AA contrast check during implementation.

## Major decision reasons

- Forest banner: separates one quiet reflective prompt from actionable activity list.
- Coral: reserved for add action and selected/confirmed state, so urgency does not spread across screen.
- Editorial serif: gives meaningful activities human weight without making list data hard to scan.
- One-column list: primary job is compare elapsed time, not browse dashboard modules.
- Bottom sheets: supports short, focused phone actions without adding screen hierarchy.
- Motion 1: use press feedback and sheet transitions only. Product promise is calm awareness, not attention capture.
