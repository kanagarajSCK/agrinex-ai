# AgriNex AI — Production Deployment Guide

This guide provides step-by-step instructions to deploy AgriNex AI for production using **Render** (FastAPI backend) and **Vercel** (Next.js frontend) connected to your **GitHub** repository.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │            Farmer's Browser            │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                   (Web UI / SSR / Assets)   (REST API Requests)
                              │                        │
                              ▼                        ▼
                   ┌─────────────────────┐  ┌─────────────────────┐
                   │    Vercel (Edge)    │  │  Render Web Service │
                   │   Next.js Frontend  │  │   FastAPI Backend   │
                   └─────────────────────┘  └──────────┬──────────┘
                                                       │
                           ┌───────────────────────────┼───────────────────────────┐
                           ▼                           ▼                           ▼
                 ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
                 │ Open-Meteo Weather│       │ AGMARKNET Mandi   │       │ Google Gemini AI  │
                 │   (Forecast API)  │       │  (data.gov.in)    │       │  (google-genai)   │
                 └───────────────────┘       └───────────────────┘       └───────────────────┘
```

---

## Step 1: Push Code to GitHub

Ensure all your latest work is committed and pushed to your GitHub repository:
- **Repository URL**: `https://github.com/kanagarajSCK/agrinex-ai`
- **Default Branch**: `master` (or `main`)

Check that secrets (`backend/.env`, `frontend/.env.local`) are **not** committed (they are excluded by `.gitignore`).

---

## Step 2: Deploy Backend to Render

### 2.1 Create a Render Web Service
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub account.
4. Select the repository: `kanagarajSCK/agrinex-ai`.

### 2.2 Configure Web Service Settings

Configure the service with the following exact settings:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `agrinex-backend` | Or any unique name you choose |
| **Region** | `Singapore (Southeast Asia)` or `Frankfurt` | Choose the region closest to India |
| **Branch** | `master` | Your primary branch |
| **Root Directory** | `backend` | **Important**: Tells Render to build from the backend folder |
| **Runtime** | `Python 3` | |
| **Build Command** | `pip install -r requirements.txt` | Installs FastAPI, Uvicorn, google-genai, etc. |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Starts the production ASGI server |
| **Plan Type** | `Free` (or `Starter` for persistent uptime) | |

### 2.3 Health Check Path
Under **Advanced** settings:
- **Health Check Path**: `/health` (or `/api/v1/health`)

### 2.4 Add Backend Environment Variables

In the Render service setup, navigate to **Environment Variables** and add:

#### Required Secrets:
| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key from Google AI Studio |
| `DATA_GOV_IN_API_KEY` | `579b...` | Your API Key from data.gov.in |

#### Public Configuration:
| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.10` | Rock-solid LTS Python runtime |
| `ENVIRONMENT` | `production` | Production mode |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Temporary local origins; **update after Step 3 with your Vercel URL** |
| `DATA_GOV_IN_RESOURCE_ID` | `9ef84268-d588-465a-a308-a864a43d0070` | Official AGMARKNET mandi resource ID |
| `OPEN_METEO_BASE_URL` | `https://api.open-meteo.com` | Official Open-Meteo API |
| `DATA_GOV_IN_BASE_URL` | `https://api.data.gov.in` | Official data.gov.in host |
| `GEOCODING_BASE_URL` | `https://geocoding-api.open-meteo.com` | Official Open-Meteo Geocoding host |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Stable verified Gemini model |
| `LGD_SNAPSHOT_PATH` | `../knowledge-base/locations_snapshot.json` | Relative path to verified 133k-record LGD snapshot |
| `LOG_LEVEL` | `INFO` | Standard structured logging |

### 2.5 Deploy the Backend
1. Click **Create Web Service**.
2. Wait for Render to build and start the service (typically 2–3 minutes).
3. Once deployed, Render provides your public backend URL, for example:
   `https://agrinex-backend.onrender.com`
4. Copy this URL.

### 2.6 Verify Backend Health
Open `https://your-agrinex-backend.onrender.com/` in your browser:
- You should see: `{"data": {"service": "AgriNex AI API", "status": "operational", ...}}`
- Open `https://your-agrinex-backend.onrender.com/docs` to see the live Swagger UI.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New…** $\rightarrow$ **Project**.
3. Import the GitHub repository: `kanagarajSCK/agrinex-ai`.

### 3.2 Configure Vercel Project Settings

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | `Next.js` | Automatically detected |
| **Root Directory** | `frontend` | Click **Edit** next to Root Directory and select `frontend` |
| **Build Command** | `npm run build` | Default |
| **Output Directory** | `.next` | Default |
| **Install Command** | `npm install` | Default |

### 3.3 Add Frontend Environment Variable

In the **Environment Variables** section, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_AGRINEX_API_URL` | `https://agrinex-backend.onrender.com` | **Your deployed Render backend URL** (no trailing slash) |

> [!IMPORTANT]
> Ensure there is **no trailing slash** at the end of the URL (e.g. `https://agrinex-backend.onrender.com`).

### 3.4 Deploy the Frontend
1. Click **Deploy**.
2. Vercel will install dependencies, compile TypeScript, run Next.js build, and deploy.
3. Once finished, Vercel gives you your production website URL, for example:
   `https://agrinex-ai.vercel.app`

---

## Step 4: Connect Vercel Domain to Render CORS

Now that your Vercel URL is created, authorize it on the backend:

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Click your `agrinex-backend` service $\rightarrow$ **Environment**.
3. Edit the `ALLOWED_ORIGINS` variable:
   ```text
   https://agrinex-ai.vercel.app,http://localhost:3000
   ```
   *(Replace `https://agrinex-ai.vercel.app` with your actual Vercel URL. You can supply multiple origins separated by commas).*
4. Click **Save Changes**. Render will automatically redeploy the backend in seconds with the updated CORS configuration.

---

## Step 5: End-to-End Verification Checklist

Test your live production deployment at `https://your-app.vercel.app`:

- [ ] **First Visit Location Onboarding**: Modal opens with *"Let's find your farming location"*.
- [ ] **GPS Location Detection**: Click *"Use my current location"*, grant browser location permission, verify your district is accurately detected and confirmed.
- [ ] **Manual Location Cascade**: Try selecting a state (e.g. *Tamil Nadu* $\rightarrow$ *Salem* $\rightarrow$ *Salem*).
- [ ] **Suggested Location**: Select *Salem, Tamil Nadu* (Suggested).
- [ ] **Dashboard Weather**: Real temperature, precipitation, and 7-day forecast load from Open-Meteo without sample tags.
- [ ] **Mandi Market Prices**: Mandi prices display genuine AGMARKNET market records.
- [ ] **AI Assistant**: Send a question (e.g. *"What fertilizer should I use for turmeric?"*) and confirm Gemini answers with localized advice and source citations.
- [ ] **Advisories**: Open the Advisories tab to review your location-tailored advisory cards.

---

## Step 6: Troubleshooting

### 1. Frontend shows "Failed to fetch"
- **Cause**: `NEXT_PUBLIC_AGRINEX_API_URL` is incorrect or missing on Vercel, or the Render backend was sleeping.
- **Fix**:
  1. Open Vercel Project $\rightarrow$ Settings $\rightarrow$ Environment Variables $\rightarrow$ Verify `NEXT_PUBLIC_AGRINEX_API_URL` equals `https://your-backend.onrender.com`.
  2. If using the Render free tier, the backend spins down after 15 minutes of inactivity. Visiting the backend URL in a browser wakes it up within 30 seconds.

### 2. CORS Error in Browser Console (`Access-Control-Allow-Origin`)
- **Cause**: Your exact Vercel frontend domain is missing from `ALLOWED_ORIGINS` on Render.
- **Fix**: Update `ALLOWED_ORIGINS` in the Render dashboard to include your Vercel domain (e.g. `https://agrinex-ai.vercel.app`). Do not include a trailing slash.

### 3. Backend Health Check Fails on Render
- **Cause**: Health check path misconfigured.
- **Fix**: Ensure Render Health Check Path is set to `/health` or `/api/v1/health`.

### 4. Mandi Prices Show "API Key Not Configured"
- **Cause**: `DATA_GOV_IN_API_KEY` was not added to Render Environment Variables.
- **Fix**: Add your valid API key in Render $\rightarrow$ Environment Variables $\rightarrow$ `DATA_GOV_IN_API_KEY`.

### 5. Gemini Assistant Returns 502 / "API Key Not Configured"
- **Cause**: `GEMINI_API_KEY` was not added to Render Environment Variables.
- **Fix**: Add your Gemini key in Render $\rightarrow$ Environment Variables $\rightarrow$ `GEMINI_API_KEY`.
