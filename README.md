# NmaNancy Hairhub — Full Website + Backend

## Includes
- Customer-facing responsive salon website
- Online appointment request form
- SQLite database for appointments and services
- Private admin dashboard at `/admin`
- Appointment status management
- Service management
- WhatsApp/phone contact buttons
- Gallery and salon sections

## Run locally
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run: `npm install`
4. Set an admin key:
   - macOS/Linux: `export ADMIN_KEY="your-secret-key"`
   - Windows PowerShell: `$env:ADMIN_KEY="your-secret-key"`
5. Run: `npm start`
6. Open `http://localhost:3000`
7. Admin: `http://localhost:3000/admin`

For production, use a hosting provider that supports Node.js and persistent storage, and set a strong `ADMIN_KEY` as an environment variable. Do not use the default key in production.

## Business details
NmaNancy Hairhub
15 Samek Rd, Ugwu Orji, Owerri North, Imo, Nigeria
0706 596 3565
Monday–Sunday, 8:00 AM–8:00 PM
