# Prayer Diary (Offline, Portable)

A fully offline Prayer Diary app using:

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)

Data files:

- Main database: `diary.db`
- Auto-backup JSON: `backup/diary-backup.json`

## Run locally

1. Install Node.js (one-time) from nodejs.org
2. Open a terminal in the `prayer-diary` folder
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:7390`

## Portability (move to a new laptop)

1. Zip the entire `prayer-diary/` folder (including `diary.db` and `backup/`)
2. Unzip on the new machine
3. Install Node.js (one-time)
4. Run `npm install` once in the folder
5. Start with `start.bat` (Windows) or `start.sh` (Mac/Linux), then open `http://localhost:7390`

All your data remains in local files, so moving the folder moves everything.

## Notes

- Every write operation updates `backup/diary-backup.json` automatically.
- If `diary.db` is damaged, import `backup/diary-backup.json` from Settings to restore.
- On first server start, the app attempts to download mascot image files to `public/assets/jesus/`. If download fails, inline SVG mascots are used automatically.
