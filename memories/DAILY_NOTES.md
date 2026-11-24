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





