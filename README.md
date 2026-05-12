# OLX Frontend (Next.js)

## Setup
1. `npm install`
2. Configure `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:5000/api`)
3. `npm run dev`

## Deployment (Dokploy / Docker)
This project includes a `Dockerfile` for easy deployment.
- Set `NEXT_PUBLIC_API_URL` during build time for Next.js to connect to your backend.

## Admin Features
- **Admin Dashboard**: Approve/Reject ads.
- **WhatsApp Scan**: Hidden page at `/admin/whatsapp` to link your WhatsApp for OTP sending.
