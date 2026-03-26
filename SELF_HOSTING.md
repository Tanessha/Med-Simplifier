# Self-Hosting Scan Scribe

This repo already includes:

- a React frontend in the project root
- an Express backend in `backend/`
- MongoDB persistence through Mongoose

There is no Firebase in this project. The safe persistent option here is MongoDB.

## 1. Local self-hosting on your own machine

Use this when you want the app to run on your laptop or desktop.

### Install prerequisites

1. Install Node.js 20 or newer.
2. Install MongoDB Community Server.
3. Make sure MongoDB is running locally.

Default local connection:

```env
mongodb://127.0.0.1:27017/scan-scribe
```

### Configure the backend

1. Open `backend/.env`.
2. Make sure it contains:

```env
PORT=8082
MONGO_URI=mongodb://127.0.0.1:27017/scan-scribe
JWT_SECRET=replace-with-a-long-random-secret
```

If you want a clean template, copy from [backend/.env.example](/C:/Final-Demo-main/backend/.env.example).

### Start the backend

```powershell
cd C:\Final-Demo-main\backend
npm install
npm start
```

### Start the frontend

Open a second terminal:

```powershell
cd C:\Final-Demo-main
npm install
npm run dev
```

### What this gives you

- frontend at the Vite dev URL, usually `http://localhost:8080` or `http://localhost:5173`
- backend at `http://localhost:8082`
- medical history, reports, prescriptions, appointments, reminders, and scan history stored in MongoDB on your machine

## 2. VPS self-hosting for internet access

Use this when you want other devices to reach the app.

Recommended stack:

- Ubuntu VPS
- Node.js
- MongoDB
- PM2
- Nginx

### Server setup

SSH into your server and install:

```bash
sudo apt update
sudo apt install -y nginx
```

Install Node.js 20 and npm using NodeSource or nvm.

Install PM2:

```bash
npm install -g pm2
```

Install MongoDB Community Server and keep it bound to localhost only.

### Copy the project

Put the repo on the server, for example:

```bash
/var/www/scan-scribe
```

### Configure backend env

Inside `backend/.env` on the server:

```env
PORT=8082
MONGO_URI=mongodb://127.0.0.1:27017/scan-scribe
JWT_SECRET=replace-with-a-long-random-secret
```

### Install dependencies

```bash
cd /var/www/scan-scribe
npm install
cd backend
npm install
```

### Build the frontend

```bash
cd /var/www/scan-scribe
npm run build
```

This creates a `dist/` folder for the frontend.

### Run the backend with PM2

From the repo root:

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

PM2 config file:

- [deploy/ecosystem.config.cjs](/C:/Final-Demo-main/deploy/ecosystem.config.cjs)

### Configure Nginx

Use the included sample:

- [deploy/nginx.scan-scribe.conf](/C:/Final-Demo-main/deploy/nginx.scan-scribe.conf)

Copy it into Nginx and replace `your-domain.com` with your real domain.

Example:

```bash
sudo cp /var/www/scan-scribe/deploy/nginx.scan-scribe.conf /etc/nginx/sites-available/scan-scribe
sudo ln -s /etc/nginx/sites-available/scan-scribe /etc/nginx/sites-enabled/scan-scribe
sudo nginx -t
sudo systemctl reload nginx
```

### Add HTTPS

Use Certbot after DNS points to your VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 3. Important safety notes

For a medical-style dashboard, do not rely on the in-memory fallback for real storage.

You should have:

- MongoDB running and connected
- a strong `JWT_SECRET`
- HTTPS enabled on the VPS
- MongoDB not exposed publicly
- regular backups

## 4. How to confirm persistence is real

If MongoDB is not connected, this app falls back to temporary in-memory storage.

To confirm real persistence:

1. Start backend with MongoDB running.
2. Add a report or appointment in the dashboard.
3. Restart the backend.
4. Refresh the dashboard.

If the data is still there, MongoDB is working correctly.

## 5. Files added for self-hosting

- [backend/.env.example](/C:/Final-Demo-main/backend/.env.example)
- [deploy/ecosystem.config.cjs](/C:/Final-Demo-main/deploy/ecosystem.config.cjs)
- [deploy/nginx.scan-scribe.conf](/C:/Final-Demo-main/deploy/nginx.scan-scribe.conf)

## 6. Fastest path for you

If you want the simplest next move:

1. Install MongoDB locally.
2. Add `JWT_SECRET` to `backend/.env`.
3. Start backend with `npm start` in `backend/`.
4. Start frontend with `npm run dev` in the repo root.

That gives you a self-hosted setup on your own machine immediately.
