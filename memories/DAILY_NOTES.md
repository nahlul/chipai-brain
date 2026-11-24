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
- Menunggu Yang Mulia pasang public key di GitHub atau kirim token
- [Update] Yang Mulia mengirim Fine-grained token (nama token: HERMES-ACCES).
- Hasil tes token (2026-11-24):
  - `GET /user` → 200 OK, akun `nahlul` (ChipXploit), 11 repo terlihat (semua publik)
  - API repo permissions → push: True, admin: True, pull: True
  - `git push` → 403 Permission denied
  - Write via API → "Resource not accessible by personal access token"
  - Kesimpulan: token read-only secara efektif; perlu Contents = Read and write
- Keamanan: token pernah tampil di chat Telegram → harus di-revoke lalu regenerate
- Credential token sudah DIHAPUS dari VPS; origin diubah ke SSH (git@github.com:nahlul/chipai-brain.git)
- Jalur cadangan: SSH public key `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPDN5dCmxiXigHxtQVAZNpRzB+RyUApo0QUFG67RyWiK chipai-agent@nahlul` belum dipasang di GitHub
- Daftar 11 repo Yang Mulia: chipai-brain, chipdidos, chipnewddos, Kali-nethunter-termux, kupi-ulee-kareng, nahlul, project-dishub-baru, project-mudik-gratis, project-new-dishub, project-seulamat-bush, project-ulee-kareng


