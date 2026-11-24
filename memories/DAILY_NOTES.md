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
