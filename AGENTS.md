# Meridian — Developer Guide

Physician discovery web app. Users enter natural-language prompts (e.g. `best cardiologist in Plano`); the UI parses specialty + place and calls the ranking API.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
npm run lint
```

## Architecture

```
src/
  components/     # Presentational UI (CSS modules)
  config/         # API endpoints + runtime config (K8s-friendly)
  hooks/          # useDoctorSearch — state logic (portable to mobile)
  services/
    doctorApi.ts      # POST /v1/rank client + response mapping
    promptParser.ts   # Natural language → RankRequest
    mockDoctors.ts    # Local fallback when useMockApi=true
  types/api.ts    # Shared contracts — extend here first
```

## Backend integration

**Endpoint:** `POST {apiBaseUrl}/v1/rank`  
**Default:** `https://aireview.com/v1/rank`

### Request payload

```json
{
  "version": "1",
  "specialty": "cardiologist",
  "place": "75024",
  "place_type": "zip",
  "original_query": "best cardiologist in zip code 75024"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | API contract version (`"1"`) |
| `specialty` | string | Normalized specialty slug |
| `place` | string | City name or 5-digit US zip |
| `place_type` | `"city"` \| `"zip"` | How `place` should be interpreted |
| `original_query` | string | Raw user prompt (for backend NLP/logging) |

Future fields: add to `RankRequest` in `src/types/api.ts` and `toRankRequest()` in `promptParser.ts`.

### Expected response

```json
{
  "results": [
    {
      "id": "doc-001",
      "name": "Dr. Elena Chen",
      "specialty": "Cardiologist",
      "university": "Johns Hopkins University",
      "university_rank": 1,
      "years_of_experience": 22,
      "location": { "city": "Plano", "state": "TX", "zip_code": "75024" },
      "rating": 4.8
    }
  ],
  "meta": {
    "specialty": "cardiologist",
    "place": "75024",
    "total_results": 5,
    "ranked_by": ["university_prestige", "years_of_experience"]
  }
}
```

Snake_case from the backend is mapped to camelCase in `doctorApi.ts`.

## Configuration

| Source | Priority | Use case |
|--------|----------|----------|
| `/config.json` | 1 (runtime) | K8s ConfigMap mount — no rebuild needed |
| `VITE_*` env vars | 2 (build-time) | CI/CD Docker build args |

### config.json (runtime, K8s)

```json
{
  "apiBaseUrl": "https://aireview.com",
  "apiRankPath": "/v1/rank",
  "useMockApi": false
}
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://aireview.com` | API host |
| `VITE_API_RANK_PATH` | `/v1/rank` | Rank endpoint path |
| `VITE_USE_MOCK_API` | `false` | `true` = skip API, use mock data |

## Deployment (Kubernetes)

```bash
docker build -t meridian-web:latest .
kubectl apply -f k8s/
```

See `k8s/` for Deployment, Service, Ingress, and ConfigMap. Mount `config.json` via ConfigMap for per-environment API URLs.

## Extending the app

1. **New request fields** → `RankRequest` + `toRankRequest()` + backend contract
2. **New response fields** → `Doctor` / `RankApiDoctor` + mapper in `doctorApi.ts`
3. **New UI** → components in `src/components/`, keep logic in hooks/services
4. **Mobile** → reuse `hooks/` and `services/` in React Native

## Design

Follow `.agents/skills/frontend-design/SKILL.md` for UI work. Brand: Meridian. Palette and typography tokens live in `src/styles/tokens.css`.
