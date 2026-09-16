# carkingdom

A car marketplace platform. React frontend, Django REST backend.

## Layout

```
carkingdom/
├── frontend/     React 19 + Vite 8  ->  http://localhost:5173
└── backend/      Django 5.2 LTS + DRF ->  http://localhost:8000
```

Both run independently during development and talk over HTTP. The Vite dev
server proxies `/api/*` to Django, so frontend code calls bare `/api/...` paths
and requests stay same-origin (no CORS preflight, cookies work normally).

## Running it

Two terminals, one per side.

**Backend** (Django, port 8000):

```bash
cd backend
.venv/Scripts/activate          # Windows; use .venv/bin/activate on Unix
python manage.py migrate         # first run only
python manage.py runserver
```

**Frontend** (Vite, port 5173):

```bash
cd frontend
npm install                      # first run only
npm run dev
```

Then open http://localhost:5173. To confirm the two are wired together:

```bash
curl http://localhost:8000/api/health/   # Django directly
curl http://localhost:5173/api/health/   # through the Vite proxy
```

Both should return `{"status": "ok", "service": "carkingdom-api"}`.

## Backend notes

- **Dependencies live in `backend/.venv`**, not global Python. Recreate with
  `python -m venv .venv` and `pip install -r requirements.txt`.
- **Django is pinned to 5.2 LTS deliberately.** Django REST Framework 3.16.1
  declares support only up to 5.2; the 6.x line is untested against it.
- **Configuration comes from `backend/.env`** (gitignored). Copy
  `.env.example` to `.env` and set `DJANGO_SECRET_KEY`.
- **Database is SQLite** for now. `config/settings.py` contains a commented
  MySQL block for switching to the XAMPP-bundled MySQL later.

## Frontend structure

```
frontend/src/
├── components/    reusable UI
├── pages/         route-level views
├── layouts/       shared page shells
├── hooks/         custom hooks
├── services/      API access (api.js holds the shared axios instance)
└── assets/
```

## Stack

| | |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, axios, Oxlint |
| Backend | Django 5.2 LTS, Django REST Framework 3.16, django-cors-headers |
| Database | SQLite (dev), MySQL via XAMPP (later) |

Note: XAMPP's Apache does not serve either app — Django runs its own dev server
on 8000 and Vite on 5173. XAMPP is relevant only as a MySQL source.
