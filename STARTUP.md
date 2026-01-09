# Startup Instructions

## Option 1: Run Everything (Recommended)
From the project root (`instagram-scheduler`), run:
```bash
npm start
```
This starts both the Server (port 5001) and Client (port 5173).

## Option 2: Run Separately
If you prefer separate terminals:

**1. Backend (Server)**
```bash
cd server
npm start
```

**2. Frontend (Client)**
```bash
cd client
npm run dev -- --host
```
*Note: The `--host` flag connects the client to your local network IP (e.g., 192.168.x.x).*
