# Meridian

Meridian is a React + TypeScript web app for discovering doctors from a natural-language search prompt such as:

- `best cardiologist in Plano`
- `top dermatologist near 75024`

The UI parses the user query, sends a ranking request to the backend, and displays doctor results.

## Tech stack

- React 19
- TypeScript
- Vite
- CSS Modules
- ESLint

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ or 20+
- npm (comes with Node.js)

## Local setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npm run dev
   ```

   The app will usually be available at:

   - http://localhost:5173

3. Build for production

   ```bash
   npm run build
   ```

4. Run lint checks

   ```bash
   npm run lint
   ```

## Configuration

The app reads runtime config in this order:

1. `public/config.json` (runtime config mounted in Kubernetes)
2. environment variables starting with `VITE_`
3. built-in defaults

### Runtime config

The file [public/config.json](public/config.json) contains settings used at runtime:

```json
{
  "apiBaseUrl": "https://aireview.com",
  "apiRankPath": "/v1/rank",
  "useMockApi": false
}
```

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `https://aireview.com` | Base URL for the rank API |
| `VITE_API_RANK_PATH` | `/v1/rank` | Endpoint path for the rank API |
| `VITE_USE_MOCK_API` | `false` | If `true`, the app uses mock doctor data instead of the real API |

> For local development, you can set `VITE_USE_MOCK_API=true` if you want to test the UI without a backend.

## Project structure

```text
src/
  components/      # presentational UI components
  config/          # runtime config loading
  hooks/           # custom hooks such as useDoctorSearch
  services/        # API calls and parsing logic
  styles/          # global CSS and design tokens
  types/           # shared TypeScript contracts
```

## Request and response flow

1. A user enters a natural-language prompt.
2. `parsePrompt()` extracts the specialty and place.
3. `toRankRequest()` converts the parsed data into the backend contract.
4. `searchDoctors()` sends the request to the API or uses mock data.
5. The results are rendered in the UI.

## API contract

The frontend expects a request payload like:

```json
{
  "version": "1",
  "specialty": "cardiologist",
  "place": "75024",
  "place_type": "zip",
  "original_query": "best cardiologist in zip code 75024"
}
```

The response is mapped from snake_case backend fields to camelCase in the frontend.

## Docker and deployment

To build the container:

```bash
docker build -t meridian-web:latest .
```

To run the app with the default Docker setup:

```bash
docker run -p 8080:80 meridian-web:latest
```

Kubernetes deployment files are in the [k8s](k8s) folder. The recommended deployment flow is:

1. mount runtime settings via ConfigMap
2. point `apiBaseUrl` at your actual backend
3. set `useMockApi` only for development or demos

## How to extend the app

### Add a new backend field

When the API contract changes:

1. update the types in [src/types/api.ts](src/types/api.ts)
2. update the request mapping in [src/services/promptParser.ts](src/services/promptParser.ts)
3. update the response mapping in [src/services/doctorApi.ts](src/services/doctorApi.ts)

### Add a new UI feature

Keep UI-only changes inside [src/components](src/components), and keep business logic in [src/hooks](src/hooks) and [src/services](src/services).

### Improve search parsing

The query parsing rules live in [src/services/promptParser.ts](src/services/promptParser.ts). Add or refine patterns there when supporting new search formats.

## Notes for contributors

- Prefer small, focused changes.
- Update types before updating components.
- Keep runtime config logic separate from UI logic.
- Use the mock API mode when testing UI behavior without a live backend.
