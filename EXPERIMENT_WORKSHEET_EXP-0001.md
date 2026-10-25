# EXP-0001 — Worksheet Eksperimen Adaptasi Lirik Manual

> Produk: **LyraSync AI** · Fase 0 (validasi metode manual) · Status: **menunggu eksekusi manual**
> Log induk: `EXPERIMENT_LOG.md` (EXP-0001) · Salinan isian: `local/EXP-0001-ISIAN.md` (di-gitignore, tidak pernah di-push)

## 0. Fakta terverifikasi (terukur, 2026-10-25)

| Item | Nilai | Metode |
|---|---|---|
| Audio referensi | `The Sun - Chanmina.mp3` | Ada di folder proyek; **tidak masuk git** (di-ignore `*.mp3`) |
| Format | MP3, 48.000 Hz, stereo | ffprobe (FFmpeg 8.1.1) |
| Durasi | 212,22 detik ≈ 3:32 | ffprobe |
| Bitrate | ±250 kbps | ffprobe |
| Hak pakai | Kopi milik pengguna, dipakai untuk eksperimen adaptasi pribadi | Pernyataan pengguna |

> **Pengaman hak cipta (repo GitHub ini PUBLIK):** lirik sumber, romaji, dan kandidat adaptasi ditulis **hanya di salinan `local/`** yang di-gitignore. Worksheet yang di-commit sengaja tidak berisi lirik. Jangan pernah pindahkan lirik ke file yang ter-track.

## 1. Prosedur (± 30–45 menit, dapat diulang)

Kerjakan berurutan; isi salinan `local/EXP-0001-ISIAN.md` sambil mengerjakan.

### Langkah 1 — Pilih frasa (±5 mnt)
- Pilih **2–4 baris yang dinyanyikan** (bukan bagian rap cepat untuk eksperimen pertama); disarankan bagian chorus yang mudah dikenali.
- Putar dari awal, catat waktu **mulai** dan **selesai** frasa format `mm:ss.d`.
- Ulangi pengecekan 2–3×; kalau hasilnya bergeser lebih dari ±0,5 detik, pakai rata-rata dan catat ketidakyakinannya.

### Langkah 2 — Tandai fitur vokal (±5 mnt)
Putar frasa berulang dan tandai per baris/kata:
- **Jeda/pause** — di antara kata atau baris mana.
- **Vokal panjang (held note)** — suku kata mana yang ditarik, kira-kira berapa detik.
- **Melisma** — satu suku kata melewati beberapa nada (tandai suku katanya).
- **Kepadatan relatif** — baris mana yang paling cepat/padat.

### Langkah 3 — Lirik sumber + romaji (di salinan lokal) (±5 mnt)
- Tulis teks sumber (Jepang) **beserta romaji per baris** — romaji yang mengikuti pengucapan nyata saat dinyanyikan, bukan transliterasi harfiah kanji.
- Sumber lirik harus dari yang berhak Anda gunakan (koleksi pribadi, transkrip telinga sendiri, atau sumber berlisensi yang Anda miliki). Jangan menyalin dari web tanpa izin.

### Langkah 4 — Estimasi mora & kepadatan sumber (±5 mnt)
- Bahasa Jepang dihitung per **mora**, bukan suku kata: setiap kana = 1 mora; sokuon `っ` dan hatsuon `ん` masing-masing juga 1 mora; vokal panjang (ー / kana tambahan) tetap dihitung.
- Hitung total mora frasa, lalu bagi durasi frasa → **kepadatan sumber** (mora/detik). Ini pembanding utama untuk kandidat Indonesia.

### Langkah 5 — Tiga kandidat Indonesia (±10 mnt)
Satu kandidat per pendekatan, di salinan lokal:
- **A — meaning-first:** kesetiaan makna dulu; bentuk kalimat boleh agak canggung untuk dinyanyikan.
- **B — balanced:** inti makna dipertahankan, pilihan kata diarahkan ke yang wajar dinyanyikan.
- **C — singability-first:** kecocokan panjang & tekanan jadi prioritas; makna inti tetap ada tapi boleh longgar.
Catat 1–2 kalimat alasan pilihan kata penting per kandidat.

### Langkah 6 — Kepadatan tiap kandidat (±2 mnt)
- Hitung suku kata Indonesia tiap kandidat ÷ durasi frasa → suku kata/detik.
- Bandingkan dengan kepadatan sumber: lebih padat / setara / lebih renggang.
- Ingat: angka ini **heuristik** — melisma dan vokal panjang membuat perbedaan kecil masih wajar.

### Langkah 7 — Uji nyanyi/baca (±10 mnt)
- Nyanyikan (atau lantunkan mengikuti melodi) **tiap kandidat 2–3×** mengikuti audio.
- Catat spesifik, bukan umum: *di kata mana* tersangkut/kepanjangan, tekanan jatuh di suku kata yang salah, bagian yang harus ditarik/dipotong paksa.
- Boleh rekam dengan HP agar telinga Anda bisa membandingkan ulang.

### Langkah 8 — Skor 1–5 memakai rubrik §2 (±3 mnt)

### Langkah 9 — Skor berbobot memakai rumus §3 (±1 mnt)

### Langkah 10 — Kesimpulan & pemenang (aturan §4)
Opsional: uji kandidat terkuat ke workflow generasi (mis. Suno) **hanya jika** Anda punya akses & izin; catat setting secukupnya agar bisa direproduksi (tanpa kredensial).

## 2. Rubrik berjangkar (skor 1–5 per dimensi)

Anchors membuat penskoran konsisten antar percobaan; nilai 2 dan 4 berada di antara.

**Meaning preservation (kesetiaan makna)**
- 1 = pesan inti berganti total / tidak dikenali
- 3 = inti pesan ada, tapi ada detail penting yang hilang atau bergeser
- 5 = pesan inti dan nuansa utama terbawa tanpa distorsi

**Natural Indonesian (kealamian bahasa)**
- 1 = terdengar seperti terjemahan kata per kata / tidak gramatikal
- 3 = gramatikal tapi kaku, atau pilihan kata tidak lazim
- 5 = kalimat yang memang akan dituturkan penutur asli dalam konteks lagu

**Rhythm / phrase fit (kecocokan ritme & panjang frasa)**
- 1 = jelas kepanjangan/kekurangan sampai menghambat
- 3 = bisa dinyanyikan tapi ada 1–2 titik yang harus dipercepat/ditarik paksa
- 5 = muat natural pada durasi frasa tanpa akrobatik

**Word stress fit (kecocokan tekanan kata)**
- 1 = tekanan alami kata berulang kali jatuh di nada/suku kata yang salah sampai terdengar salah arti
- 3 = beberapa kata tekanannya bergeser tapi masih dimengerti
- 5 = tekanan alami kata jatuh nyaman pada pola melodi

**Singability (kemudahan dinyanyikan)**
- 1 = banyak konsonan beruntun / vokal sempit di nada panjang, sulit diartikulasikan
- 3 = bisa dinyanyikan dengan sedikit usaha ekstra
- 5 = vokal terbuka di nada panjang, artikulasi lancar

**Audio result (HANYA jika kandidat benar-benar dites ke workflow generasi)**
- 1 = pelafalan salah total / hasil tidak bisa dipakai
- 3 = dimengerti tapi ada salah ucap/tekanan
- 5 = pelafalan & frasa terdengar tepat
- Jika tidak dites tulis **Not tested** — jangan mengarang nilai.

## 3. Skor berbobot — HIPOTESIS, dapat dikalibrasi

> Bobot ini adalah hipotesis awal, **bukan fakta ilmiah**. Setelah beberapa eksperimen, kalibrasi dan catat perubahannya di `EXPERIMENT_LOG.md`.

| Dimensi | Bobot |
|---|---|
| Rhythm / phrase fit | 30% |
| Word stress fit | 20% |
| Singability | 20% |
| Meaning preservation | 20% |
| Natural Indonesian | 10% |

Rumus: `total = 0.30·R + 0.20·S + 0.20·N + 0.20·M + 0.10·I` (masukan 1–5, hasil 1–5).

**Contoh perhitungan (angka fiktif, BUKAN hasil eksperimen):** kandidat dengan R=4, S=3, N=4, M=3, I=4 → total = 1,2 + 0,6 + 0,8 + 0,6 + 0,4 = **3,60**.

## 4. Aturan pemilihan pemenang

1. Pemenang = **total berbobot tertinggi**.
2. Selisih dua kandidat teratas < **0,5** → anggap **setara**; catat keduanya dan sebutkan pembeda kualitatif (mis. makna lebih utuh).
3. Kandidat dengan nilai **Meaning ≤ 2 tidak boleh menjadi pemenang** meski totalnya tertinggi (makna inti wajib terjaga). Catat sebagai *disqualification*.
4. Tulis pemenang + alasan di bagian kesimpulan salinan lokal.

## 5. Lembar isian — isi di `local/EXP-0001-ISIAN.md`

Kolom isian mengikuti template `EXPERIMENT_LOG.md`: tanggal; frasa (start/end); lirik sumber + romaji; mora & kepadatan; jeda/vokal panjang/melisma; Kandidat A/B/C + alasan; suku kata & kepadatan tiap kandidat; observasi uji nyanyi per putaran; skor 6 dimensi; masalah teramati; audio result (Not tested / Passed / Mixed / Failed); perubahan antar-iterasi; kesimpulan (Verified for this phrase / Tentative / Inconclusive); aturan yang bisa dipakai ulang (jika ada); confidence (Low / Medium / High); eksperimen berikutnya.

## 6. Checklist kelulusan Phase 0 (diisi SETELAH eksperimen)

- [ ] Satu frasa terdokumentasi lengkap (waktu, lirik, romaji, mora, durasi)
- [ ] Tiga kandidat dibandingkan dengan skor + observasi nyata
- [ ] **Limitasi metode** ditulis (apa yang tak bisa diputuskan dari teks saja; apa yang butuh dengar langsung)
- [ ] **Langkah berikutnya** ditulis (eksperimen kedua; pendekatan yang perlu diuji ulang)
- [ ] **Draf kebutuhan minimum overlay & editor** diisi dari pengalaman nyata mengerjakan Langkah 1–10 (mis. "butuh loop frasa A–B", "butuh tampilan mora vs suku kata berdampingan")

Bagian 9–11 di salinan lokal menampung limitasi, langkah berikutnya, dan draf kebutuhan minimum. Setelah Anda selesai, hasilnya saya rangkum (tanpa lirik mentah) ke `EXPERIMENT_LOG.md` dan `ROADMAP.md`.
