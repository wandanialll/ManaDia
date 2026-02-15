# Local Development Setup

Quick guide to get ManaDia running locally **without Docker or PostgreSQL**.  
Uses SQLite + a seed script so you can start building immediately.

---

## Prerequisites

| Tool    | Version | Check              |
| ------- | ------- | ------------------ |
| Python  | 3.10+   | `python --version` |
| Node.js | 18+     | `node --version`   |
| npm     | 9+      | `npm --version`    |
| Git     | any     | `git --version`    |

---

## 1 — Clone & Backend Setup

```powershell
# Clone the repo
git clone <repo-url> ManaDia
cd ManaDia

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows PowerShell
# source venv/bin/activate          # macOS / Linux

# Install Python dependencies
pip install -r requirements.txt
```

---

## 2 — Seed the Mock Database

A seed script generates a **SQLite** database (`dev.db`) with realistic mock data so you don't need PostgreSQL locally.

```powershell
$env:DATABASE_URL = "sqlite:///dev.db"
python seed_mock_data.py
```

This creates:

| Data              | Details                                           |
| ----------------- | ------------------------------------------------- |
| **187 locations** | 3 devices, 2 users, across Kuala Lumpur and Tokyo |
| **3 API keys**    | 1 active, 1 expired, 1 revoked                    |

### Test API Key (for local dev)

```
dev-test-key-manadia-1234567890abcdef
```

Use it in the `X-Api-Key` header when calling protected endpoints.

> Re-run `python seed_mock_data.py` at any time to reset the database to its initial state.

---

## 3 — Start the Backend

```powershell
$env:DATABASE_URL = "sqlite:///dev.db"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Verify it's running:

```powershell
# Health check
Invoke-RestMethod http://localhost:8000/

# Fetch locations (requires API key)
Invoke-RestMethod -Uri "http://localhost:8000/history?limit=5" `
  -Headers @{ "X-Api-Key" = "dev-test-key-manadia-1234567890abcdef" }
```

---

## 4 — Start the Frontend

Open a **second terminal**:

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server starts at **http://localhost:5173/dashboard/**  
It proxies `/api/*` requests to the backend on port 8000 automatically (configured in `vite.config.ts`).

### Login

The frontend uses Basic Auth which is normally validated by Caddy.  
For local development the proxy bypasses Caddy, so the backend accepts any Basic Auth header.  
Enter **any username/password** on the login screen — it will authenticate via the pass-through path.

---

## 5 — All-in-One Quick Start (copy-paste)

### Terminal 1 — Backend

```powershell
cd ManaDia
.\venv\Scripts\Activate.ps1
$env:DATABASE_URL = "sqlite:///dev.db"
python seed_mock_data.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 — Frontend

```powershell
cd ManaDia/frontend
npm install
npm run dev
```

Open **http://localhost:5173/dashboard/** in your browser.

---

## Mock Data Overview

### Devices & Routes

| Device        | User  | Route                            | Points | Date       |
| ------------- | ----- | -------------------------------- | ------ | ---------- |
| `pixel-8`     | dania | Kuala Lumpur (KLCC → Kajang)     | 80     | 2026-02-15 |
| `pixel-8`     | dania | Kuala Lumpur (KLCC → Mid Valley) | 50     | 2026-02-14 |
| `iphone-15`   | taro  | Tokyo (Shinjuku → Akihabara)     | 40     | 2026-02-15 |
| `tablet-home` | dania | Stationary (KLCC)                | 30     | 2026-02-15 |

### API Keys

| User           | Status                          | Key                                     |
| -------------- | ------------------------------- | --------------------------------------- |
| `dev-admin`    | **Active** (expires 2027-01-01) | `dev-test-key-manadia-1234567890abcdef` |
| `old-user`     | Expired (2025-01-01)            | `expired-key-do-not-use-123456789`      |
| `revoked-user` | Revoked                         | `revoked-key-do-not-use-123456789`      |

---

## API Endpoints Reference

| Method | Path                                  | Auth    | Description                  |
| ------ | ------------------------------------- | ------- | ---------------------------- |
| `GET`  | `/`                                   | None    | Health check                 |
| `GET`  | `/health`                             | None    | Health check (alias)         |
| `POST` | `/pub`                                | None\*  | OwnTracks location ingestion |
| `GET`  | `/history`                            | API Key | All locations (paginated)    |
| `GET`  | `/history/date?query_date=YYYY-MM-DD` | API Key | Locations by date            |
| `GET`  | `/history/device/{device_id}`         | API Key | Locations by device          |
| `POST` | `/admin/generate-api-key?user_name=X` | Admin   | Generate new API key         |
| `POST` | `/admin/revoke-api-key?api_key=X`     | Admin   | Revoke an API key            |

\*In production, `/pub` is protected by Caddy Basic Auth.

---

## Environment Variables

For local dev with SQLite, only `DATABASE_URL` is needed. Full list for reference:

| Variable                  | Default   | Required (local) | Description                                |
| ------------------------- | --------- | ---------------- | ------------------------------------------ |
| `DATABASE_URL`            | —         | **Yes**          | `sqlite:///dev.db` for local dev           |
| `DB_PASSWORD`             | —         | No (SQLite)      | PostgreSQL password                        |
| `DB_USER`                 | `manadia` | No (SQLite)      | PostgreSQL user                            |
| `DB_HOST`                 | `db`      | No (SQLite)      | PostgreSQL host                            |
| `DB_PORT`                 | `5432`    | No (SQLite)      | PostgreSQL port                            |
| `DB_NAME`                 | `manadia` | No (SQLite)      | PostgreSQL database name                   |
| `LOG_LEVEL`               | `INFO`    | No               | `DEBUG`, `INFO`, `WARNING`, `ERROR`        |
| `API_KEY_EXPIRATION_DAYS` | `365`     | No               | Days until new API keys expire (0 = never) |

---

## Troubleshooting

### `DB_PASSWORD environment variable is required`

You forgot to set `DATABASE_URL`. Run:

```powershell
$env:DATABASE_URL = "sqlite:///dev.db"
```

### Port 8000 already in use

```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Frontend can't reach backend

Make sure the backend is running on port 8000. The Vite proxy in `vite.config.ts` forwards `/api/*` → `http://localhost:8000`.

### Reset everything

```powershell
Remove-Item dev.db -ErrorAction SilentlyContinue
$env:DATABASE_URL = "sqlite:///dev.db"
python seed_mock_data.py
```
