# AgriNex AI frontend

Responsive Next.js 16 App Router interface for AgriNex AI. It is a public website that opens directly to the dashboard without registration or login. The current Phase 02 application is a demonstration; it has no live agricultural data, database, AI, or voice integrations.

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Validate the frontend with:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## Routes

| Route | Preview |
| --- | --- |
| `/` and `/dashboard` | Farm overview, demo metrics, weather charts, market snapshot, and sample advisory |
| `/assistant` | Local chat UI preview; no question is sent to an AI service |
| `/weather` | Sample current conditions, seven-day forecast, temperature and rainfall charts |
| `/markets` | Searchable and filterable sample prices and comparison chart |
| `/crops` | Searchable crop catalog and unpopulated knowledge placeholders |
| `/farms` | Session-only farm cards and manual location form; no GPS or persistence |
| `/advisories` | Searchable and expandable sample history entries |
| `/settings` | Local language and preference control previews |

All values, prices, locations, and profiles are illustrative demonstration content. Language options do not activate translations. Agricultural information is not verified advice.

## Responsive navigation

Desktop uses a persistent sidebar, tablet uses a horizontally scrollable navigation row, and mobile uses a compact bottom bar plus an expandable navigation drawer. Charts use Recharts responsive containers.
