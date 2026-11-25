# 📓 Catatan Harian — Semua yang Dibagikan Yang Mulia Nahlul

Aturan tetap: setiap hal yang Yang Mulia bagikan (baru atau lama) dicatat di sini, tanpa terkecuali.

---

## [2026-11-24] Brain repo + Stack Dishub Baru dinyalakan

### Yang Mulia bagikan
- URL brain: `https://github.com/nahlul/chipai-brain.git` — "ini adalah otak anda, tolong simpan"
- Instruksi: launch backend + frontend + database Project Dishub Baru, beri link akses
- Instruksi tetap: "catat ini" untuk setiap hal yang dibagikan, baru maupun lama, simpan semua di memori

### Tindakan
- Clone brain ke `/root/chipai-brain`
- Pasang identitas Chip AI ke `~/.hermes/SOUL.md` + memori (user & memory)
- Install MongoDB 7.0 (repo jammy), venv Python backend, npm install frontend
- Buat systemd unit: `dishub-backend.service`, `dishub-frontend.service`

### Akses aktif (VPS 104.64.215.247)
- Frontend: http://104.64.215.247:3000 (CRA dev server, belum production/TLS)
- Backend API: http://104.64.215.247:8001/api/
- Swagger: http://104.64.215.247:8001/docs
- DB: MongoDB lokal 127.0.0.1:27017, database `trans_koetaradja`
- Log: `/root/chipai-brain/backend.log`, `/root/chipai-brain/frontend.log`

### Catatan teknis
- Backend butuh env: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS` (wajib termasuk origin IP publik), `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Seed otomatis saat startup lewat `seed_routes.py` (hash-based re-seed)
- Frontend env: `REACT_APP_BACKEND_URL=http://104.64.215.247:8001`
- CRA di IP publik butuh: `HOST=0.0.0.0`, `DANGEROUSLY_DISABLE_HOST_CHECK=true`, `WDS_SOCKET_PORT=0`
- Folder near-duplicate: `frontend/`, `dashboard-admin/`, `tampilan-utama/` — hanya `frontend/` yang dipakai

---

## [2026-11-24] Akses GitHub penuh untuk Chip AI

### Permintaan Yang Mulia
- Chip AI harus bisa masuk ke GitHub milik Yang Mulia, akses keseluruhan tanpa terkecuali.

### Tindakan
- Generate SSH key pair ed25519 di VPS: `/root/.ssh/id_ed25519` (private) + `/root/.ssh/id_ed25519.pub` (public)
- SSH config: `/root/.ssh/config` → `Host github.com`, `IdentityFile /root/.ssh/id_ed25519`
- `known_hosts` github.com sudah ditambahkan

### Public key (paste ke GitHub):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPDN5dCmxiXigHxtQVAZNpRzB+RyUApo0QUFG67RyWiK chipai-agent@nahlul
```

### Status
- Private key tersimpan di VPS (chmod 600)
- SSH key TERVERIFIKASI PENUH:
  `Hi nahlul! You've successfully authenticated, but GitHub does not provide shell access.`
- Tes Push `chipai-brain`: BERHASIL (commit 8460c5f langsung ter-push ke github.com/nahlul/chipai-brain.git branch main)
- Tes Clone/Read 10 repo lainnya: SEMUA 100% BERHASIL
  - `project-dishub-baru` (8.0M, 404 files)
  - `project-new-dishub` (5.6M, 378 files)
  - `project-mudik-gratis` (2.0M, 106 files)
  - `project-seulamat-bush` (2.0M, 106 files)
  - `kupi-ulee-kareng` (600K, 13 files)
  - `chipdidos` (200K, 1 files)
  - `chipnewddos` (200K, 1 files)
  - `Kali-nethunter-termux` (204K, 2 files)
  - `project-ulee-kareng` (124K)
  - `nahlul` (124K)
- Tes Tulis/Branch/Push/Delete di repo lain (`project-mudik-gratis`): BERHASIL
- KESIMPULAN: Akses GitHub Chip AI ke seluruh repo milik Yang Mulia Nahlul resmi 100% AKTIF, READ & WRITE PENUH TANPA TERKECUALI.
- Bukti tangkapan layar dari Yang Mulia:
  - Label key: `HERMES-NEW`
  - Fingerprint: `SHA256:nlCwGEMfqLWNa9lFQHTkfN5mRPxxM63ueimuNXkHe8g`
  - Permission: `Read/write`
  - Status di GitHub: aktif dan terverifikasi

---

## [2026-11-24] Menjalankan Stack `project-seulamat-bush` (Mudik Gratis Aceh)

### Permintaan Yang Mulia
- Jalankan repo `project-seulamat-bush`: backend, frontend, dan database.

### Tindakan
- Database: Pasang PostgreSQL 16 di VPS, buat database `mudik_db` dan user `mudik_app`.
- Backend:
  - Direktori: `/root/project-seulamat-bush/backend`
  - Stack: Node.js + Express + TypeScript + Prisma ORM
  - Sinkronisasi schema ke PostgreSQL via `npx prisma db push`
  - Port backend: `3100` (agar tidak bentrok dengan frontend Dishub port 3000)
  - Admin awal di-seed: `admin@mudik.acehprov.go.id` / `admin123456`
  - Data rute awal: Banda Aceh -> Medan, Banda Aceh -> Meulaboh
  - Dikelola lewat systemd: `seulamat-backend.service` (auto-restart)
- Frontend:
  - Direktori: `/root/project-seulamat-bush/frontend`
  - Stack: Vite + React + TypeScript + Tailwind CSS
  - Port frontend: `5273` (agar tidak bentrok dengan stack lain)
  - Reverse proxy internal Vite `/api` diarahkan ke backend port `3100`
  - Dikelola lewat systemd: `seulamat-frontend.service` (auto-restart)

### Status & Akses Aktif (VPS 104.64.215.247)
- Frontend Web: http://104.64.215.247:5273/
- Admin Panel: http://104.64.215.247:5273/admin/login
- Backend API Health: http://104.64.215.247:3100/health
- Akun Admin:
  - Email: `admin@mudik.acehprov.go.id`
  - Password: `admin123456`
- Database: PostgreSQL 16 (database: `mudik_db`, user: `mudik_app`)
- Layanan systemd: `postgresql`, `seulamat-backend`, `seulamat-frontend` (semua aktif `active`)

## 2026-11-24 — Perbaikan alur register dan ekspor manifest `project-seulamat-bush`

### Permintaan Yang Mulia Nahlul
- Setelah user register, jangan langsung masuk panel/dashboard; user harus diarahkan ke login dan login manual memakai akun yang baru dibuat.
- Hilangkan masalah popup `Anda belum login!` saat user yang sudah login menekan `Daftar Sekarang` di panel.
- Perbaiki tombol manifest `Ekspor Semua` dan `Ekspor Sudah Plotting` yang tidak memberikan data.

### Diagnosis dan tindakan
- `frontend/pages/Register.tsx` sebelumnya menyimpan JWT hasil register ke localStorage dan mengarahkan ke `/dashboard`; diperbaiki agar token/session lama dihapus, modal menyuruh login, dan penutupan modal memakai `navigate('/login')`.
- `frontend/pages/DaftarMudik.tsx` sebelumnya hanya membaca `localStorage.userId`; sekarang dapat mengambil `id` dari klaim JWT jika userId tidak ada, menyimpannya kembali, dan guard mengarahkan tanpa popup.
- `frontend/pages/Login.tsx` sekarang membaca user ID dari `data.id`, `data.userId`, `data.id_user`, atau klaim JWT (`id`, `sub`, dan fallback terkait), sehingga sesi pendaftaran konsisten.
- Root cause export: frontend meminta nama `.xlsx` tetapi backend mengirim CSV dan endpoint plotting memfilter status approved sehingga bisa kosong. Ditambahkan `backend/src/xlsx.ts` generator XLSX OOXML/ZIP tanpa dependency tambahan.
- Endpoint export manifest semua/rute/bus dan `/api/admin/export` sekarang mengirim XLSX asli. Export semua default mengambil semua status; export plotting mengambil semua pendaftar yang `kendaraan_id`-nya tidak null, tidak dibatasi status.
- Frontend service diganti dari Vite dev server ke `vite preview` agar benar-benar menyajikan build production terbaru.

### Verifikasi nyata
- `npm test` backend: 4 test lulus, 0 gagal.
- `npx tsc --noEmit -p tsconfig.json`: lulus.
- `npm run build` frontend: lulus (`tsc -b` + `vite build`).
- XLSX diuji dengan Python `zipfile`: file valid `Microsoft Excel 2007+`, semua XML parts well-formed.
- E2E melalui frontend proxy port 5273: register HTTP 201, login HTTP 200, riwayat HTTP 200, export semua dan plotting HTTP 200 dengan MIME XLSX dan header ZIP valid.
- Systemd `seulamat-backend.service` dan `seulamat-frontend.service`: aktif; frontend HTTP 200 dan backend health `{"ok":true}`.
- Commit GitHub: `32b2457` pada `nahlul/project-seulamat-bush` branch `main`.

### Data uji yang dibuat di database VPS
- User uji: `Budi Santoso` (`budi1795540080377@contoh.com`) dan `E2E Tester` (`e2e1795540515767@contoh.com`).
- Armada uji: `Bus Test 01`, rute Banda Aceh → Medan, kapasitas 40.
- Pendaftaran uji: `MDK-1`, BUDI SANTOSO, status `DITERIMA H-3`, bus 1.

---

## [2026-11-25] Redesign UI Publik & Fitur Kelola Rute Admin (`project-dishub-baru`)

### Permintaan Yang Mulia Nahlul
- Perbaiki tampilan Footer dan Header navbar agar rapi, selaras, tanpa tombol `Beranda` putih sendiri saat transparan, dan memakai logo lokal Trans Koetaradja.
- Perbarui kredensial login admin panel Dishub Baru.
- Tambahkan fitur **Kelola Rute & Halte** lengkap di panel admin (isi urutan halte tiap koridor seperti Ulee Kareng, Meudiwana, Ulee Lheue, dll., plus fitur ubah urutan, tambah, edit, hapus rute/halte) dan sinkronkan ke halaman publik.

### Perubahan yang diterapkan
- **UI Header & Footer (`frontend/src/components/Header.jsx`, `Footer.jsx`, `frontend/public/trans-logo.png`):**
  - Menyalin aset logo lokal `/trans-logo.png` (81.358 bytes).
  - Redesign Footer ke gaya deep navy executive transit 4 kolom dengan logo `brightness-0 invert`, kontras WCAG AAA, dan alamat rapi.
  - Menyeragamkan styling/animasi 7 tab Header (`bg-white/20 text-white` saat hero transparan, `bg-sky-50 text-sky-700` saat solid/scroll, `aria-current="page"`).
- **Auth Admin (`backend/.env`):**
  - Menetapkan kredensial admin & `JWT_SECRET` di environment backend (tidak di-commit ke git), sinkron ke MongoDB `trans_koetaradja.admins`, sehingga login `/admin` berjalan normal tanpa HTTP 500.
- **Backend Rute & Seeding (`backend/routes/route_routes.py`, `backend/seed_routes.py`):**
  - Memperbaiki bug `GET /api/routes/` yang sebelumnya membuang field `halte` (`"halte": 0`) sehingga kartu `/rute` sempat tampil `0 Halte`.
  - Menambahkan endpoint admin terlindungi cookie auth: `GET /routes/admin/list`, `GET /routes/admin/halte-presets`, `POST /routes/admin`, `PUT /routes/admin/{route_id}`, `DELETE /routes/admin/{route_id}`, `PUT /routes/admin/reorder` + logging aktivitas.
  - Mengubah `seed_routes.py` agar hanya men-seed saat koleksi `bus_routes` kosong (`count == 0`) supaya editan admin tidak tertimpa saat restart backend.
- **Panel Admin & Sinkronisasi Publik (`frontend/src/pages/admin/AdminRoutes.jsx`, `AdminLayout.jsx`, `AdminDashboard.jsx`, `App.js`, `lib/api.js`, `lib/routeUtils.js`, `components/RouteExplorer.jsx`, `components/TripPlanner.jsx`):**
  - Menambahkan halaman `/admin/routes` (**Kelola Rute**) lengkap di sidebar dan kartu statistik `Rute & Koridor` di Dashboard.
  - Mendukung CRUD koridor, ubah urutan koridor, CRUD halte, ubah urutan halte (tombol naik/turun + drag & drop), sisip halte, tambah/rename arah lintasan, input koordinat & jadwal (`senin_kamis`, `jumat`, `sabtu`, `minggu`), preset halte, pencarian, dan **Undo** perubahan terakhir.
  - Memindahkan posisi `<Toaster />` ke `bottom-right` agar tidak menutupi tombol `Logout`, auto-scroll kartu koridor aktif, dan merapikan tombol edit arah di pill tab.
  - Menyambungkan `RouteExplorer.jsx` dan `TripPlanner.jsx` (`liveRoutes`) ke data API terbaru serta memperbaiki `resolveBackendUrl` di `api.js` untuk `localhost`/`127.0.0.1` & IP publik.

### Verifikasi nyata
- Build frontend (`npm run build`): lulus (`main.1e2b36fb.js`, `main.43ba0817.css`).
- Systemd `dishub-backend.service` (`8001`) & `dishub-frontend.service` (`3000`): aktif (`active`).
- API publik `/api/routes/` mengembalikan 10 koridor lengkap dengan jumlah halte masing-masing (Ulee Kareng: 40, Meudiwana: 60, Ulee Lheue: 20, dst.).
- Verifikasi headless browser di `http://104.64.215.247:3000/admin/routes` dan `/rute`: login sukses, CRUD & reorder rute/halte bekerja, data test dibersihkan, halaman `/rute` sinkron dengan database.
- Commit implementasi fitur: `03e51f9` pada `nahlul/chipai-brain` branch `main`.

---

## [2026-11-25] Rencana Migrasi Home Server (Revisi Spek & Budget Nyata)

### Yang Mulia bagikan
- WiFi: **Rp 2.000.000 / TAHUN** (~Rp 166.666 / bulan).
- Hardware server (estimasi Rp 2.500.000 sekali beli):
  - Processor: Intel Core i5-4570 (LGA 1150)
  - Motherboard: H81 LGA 1150
  - RAM: DDR3 8GB 1600MHz
  - Storage: SSD SATA 256GB
  - Casing: Micro ATX / jadul
  - PSU: 400–450W
- Budget / patokan listrik: Rp 200.000 / bulan.
- Kapasitas listrik rumah: **4 Ampere** (900 VA / ~880–900 W maksimal MCB).
- Opsi koneksi yang dipertimbangkan: **internet inject-an** (tunneling/kuota seluler).
- Langganan AI: Rp 150.000 / bulan.
- Pertanyaan Yang Mulia: Berapa pengeluaran per bulan dari listrik saja dan ditambah langganan AI, perbandingan spek i5-4570 vs VPS aktif, serta ketertarikan ke Mini PC Lenovo ThinkCentre untuk menekan beban 4A.

---

## [2026-11-25] Setup Tools Pembuatan Dokumen Word, Excel, PowerPoint, & PDF

### Permintaan Yang Mulia Nahlul
- Meminta Chip menyiapkan & menginstall seluruh kebutuhan untuk membuat dokumen **Word (`.docx`)** dan **Excel (`.xlsx`)** agar nanti Yang Mulia tinggal memberi perintah.

### Komponen yang terpasang & terverifikasi
- Hermes documents venv: `/root/.hermes/environments/documents/gen-980ad4fc39ae459b9cac9a0d7d1c24da/venv/bin/python`
  - `python-docx==1.2.0`
  - `openpyxl==3.1.5`
  - `python-pptx==1.0.2`
  - `reportlab`, `pypdf`, `pdfplumber`, `pypdfium2`
- Paket OS: `libreoffice-writer-nogui`, `libreoffice-calc-nogui`, `libreoffice-impress-nogui` (`LibreOffice 24.2.7.2`), `poppler-utils` (`pdftoppm 24.02.0`), `fonts-dejavu-core`, `fonts-liberation`.
- Smoke test lulus: validasi `.docx`, hitung ulang formula `.xlsx` (`=SUM(B2:B3)`), dan ekspor ke `.pdf` via `soffice --headless` berjalan bersih tanpa error.

