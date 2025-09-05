Glam.AI Admin Panel & Backend

Backend (Node/Express + TS)
- Path: /workspace/backend
- Setup: cp .env.example .env and set GLAM_API_KEY
- Dev: npm run dev
- Prod: npm run build && npm start
- Endpoints:
  - POST /api/auth/login { email, password }
  - POST /api/glam/tryon (Bearer token)

Frontend (React + Vite + TS)
- Path: /workspace/frontend
- Dev: npm run dev (proxies /api to http://localhost:4000)

Security
- Backend stores and uses Glam API key; frontend never sees it.
- JWT-based sessions; role guard for admin/subadmin.
- Helmet, CORS, and rate limiting enabled.

Notes
- Replace in-memory user seed with DB for production.
- Add S3/Firebase for media storage if needed.
