# NIKOH — Tajik Wedding Invitation

React + Vite wedding invitation demo with a built-in server API and persistent JSON database.

## Start locally
1. Install Node.js 20 or newer.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite.

The development command starts both the Vite site and the API server. Guest responses are saved on the server in `data/rsvps.json`, not only in the visitor's browser. The file is created automatically after the first RSVP. Keep this file private and back it up.

## API
- `GET /api/health` — server health check.
- `GET /api/rsvps` — returns the total number of saved responses only.
- `POST /api/rsvps` — validates and saves a guest response.

## Deploying for an agency
Deploy to a Node.js host that supports a persistent writable disk. Run `npm install`, `npm run build`, then `npm start`; configure the host to preserve the `data/` directory across restarts and redeploys. A static-only host cannot run this included database server. For a commercial deployment with multiple staff members, add an authenticated admin panel and regular backups before collecting real guest information.

## Mokky.dev integration
This project is configured to send guest responses to `https://2376cfc39ec4eb2f.mokky.dev/rsvps` using the `.env` file. The collection must be enabled and allow creating records. Since Vite variables are public, never place private/admin tokens in `.env` variables beginning with `VITE_`. Test the form and confirm the record appears in the Mokky.dev collection before using it with real guests.

Wedding edits in the settings panel are currently saved in the current browser. Replace demo names, date, venue and images for each client before sale.
