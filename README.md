# OAV Sorada Half-Yearly Admit Card

Production-oriented starter for Odisha Adarsha Vidyalaya, Sorada.

## Stack
- Frontend: HTML/CSS/JavaScript, deployable to Netlify
- Backend: Node.js + Express, deployable to Render
- Database: MongoDB Atlas via Mongoose
- Repository: GitHub
- Excel import: SheetJS (`xlsx`)

## Local testing
### Option A: Demo mode (no MongoDB required)
1. Install Node.js 18+.
2. In `backend`, run `npm install`.
3. Copy `.env.example` to `.env` and keep `DEMO_MODE=true`.
4. Run `npm run dev`.
5. Open `http://localhost:5000` — the backend serves the frontend too for the easiest local test.

The demo database is `backend/data/students.json`, populated from the supplied Excel workbook. It contains only the fields needed by the admit-card application.

### Option B: MongoDB Atlas/local MongoDB
Set `DEMO_MODE=false` and `MONGODB_URI=...` in `backend/.env`, then run the server. Use the Admin page to import Excel data.

## Admin
Open `/admin.html`.
Default local demo credentials from `.env.example`:
- username: `admin`
- password: `change-this-password`

Change the password before any real deployment.

## Production deployment
### GitHub
Push this repository to a private GitHub repository. Do not commit `.env` or secrets.

### Render
Create a Web Service from the GitHub repository:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DEMO_MODE=false`, `FRONTEND_ORIGIN=https://YOUR-NETLIFY-SITE.netlify.app`

### Netlify
Create a site from the same GitHub repository:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variable: `API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

For the first deployment, use the Netlify URL in `FRONTEND_ORIGIN` on Render. Then redeploy Render if the URL changes.

## Important privacy note
The supplied workbook contains more personal information than this application needs (for example phone numbers and government-ID fields). The importer intentionally stores only admit-card fields. Keep the GitHub repository private and never commit the original workbook.

## Updated Half-Yearly Timetable
The project includes the latest official Half-Yearly Examination 2026-27 timetable for Classes VI-XII, including XI/XII Science and Commerce streams. Examination timing: 10:30 AM - 1:30 PM.
