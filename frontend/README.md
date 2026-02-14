# Manadia Dashboard Frontend

A React + TypeScript dashboard for the Manadia location tracking system with an interactive map using Leaflet.

## Features

- 📍 Real-time location tracking visualization with Leaflet map
- 👥 Filter locations by user and device
- 🔐 Secure authentication with basic auth (admin credentials)
- 📱 Responsive design (desktop and mobile)
- 🔄 Auto-refreshing location data (polls every 10 seconds)

## Architecture

### Local Development

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173/dashboard/` (Vite dev server)

### Production (Docker)

The frontend is built as a Docker service in the docker-compose setup:

- Builds React + TypeScript with Vite
- Serves static files via http-server on port 3000
- Caddy reverse-proxies `/dashboard/*` to the frontend service
- Caddy handles SSL/TLS and basic authentication

## Authentication Flow

1. User visits `/dashboard/`
2. Caddy prompts for admin credentials (basic auth)
3. React app stores credentials in localStorage
4. All API calls include Basic Auth header

## API Integration

The frontend calls these backend endpoints:

- `GET /api/history` - Get all locations
- `GET /api/history/date?query_date=YYYY-MM-DD` - Get locations by date
- `GET /api/history/device/{device}` - Get locations by device

All requests are authenticated via Basic Auth headers set in the API client.

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard layout
│   │   ├── MapComponent.tsx   # Leaflet map
│   │   ├── Controls.tsx       # Filter controls
│   │   ├── LocationList.tsx   # Recent locations sidebar
│   │   └── Login.tsx          # Login/auth form
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── api/
│   │   └── client.ts          # API client with auth interceptor
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
└── Dockerfile                 # Docker build
```

## Development Notes

- **Base path**: Set to `/dashboard/` in vite.config.ts for prod compatibility
- **Dev proxy**: Dev server proxies `/api` requests to `http://localhost:8000`
- **Auth storage**: Credentials stored in localStorage as `manadia_auth`
- **Polling**: Locations auto-refresh every 10 seconds

## Building

```bash
npm run build
```

Outputs optimized files to `dist/` directory.

## Environment Variables

No environment variables needed for the frontend—all configuration happens via Caddy.
