# Doctor Ranking Backend

This backend is a FastAPI service for the Doctor Ranking MVP. It exposes a single POST endpoint for ranking doctors by specialty and location, with Texas-only filtering and rating-based sorting.

## Features

- FastAPI application
- PostgreSQL persistence via SQLAlchemy 2.0 ORM
- UUID primary keys and `created_at` timestamps
- `POST /v1/rank` endpoint
- Health check at `GET /health`
- Production-ready layered architecture

## Project structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── routers/
│   │   ├── __init__.py
│   │   └── rank.py
│   ├── schemas.py
│   └── services/
│       ├── __init__.py
│       └── rank_service.py
├── scripts/
│   └── ingest_doctors.py
├── requirements.txt
└── .env.example
```

## Setup

1. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Create `.env` from `.env.example`

```bash
cp .env.example .env
```

4. Update `DATABASE_URL` with your PostgreSQL connection string

Example:

```bash
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/doctor_ranking
```

## Database

This project uses SQLAlchemy ORM.

To create tables and seed sample data:

```bash
python -m backend.scripts.ingest_doctors
```

## Running the app

Start the server with Uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API

### Health

- `GET /health`

Response:

```json
{"status": "ok"}
```

### Rank doctors

- `POST /v1/rank`
- Request body:

```json
{
  "version": "1",
  "specialty": "cardiologist",
  "place": "75024",
  "place_type": "zip",
  "original_query": "best cardiologist in 75024"
}
```

- Response body:

```json
{
  "results": [
    {
      "id": "",
      "name": "",
      "specialty": "",
      "university": "",
      "university_rank": 0,
      "years_of_experience": 0,
      "location": {
        "city": "",
        "state": "",
        "zip_code": ""
      },
      "rating": 0
    }
  ],
  "meta": {
    "specialty": "",
    "place": "",
    "total_results": 0,
    "ranked_by": [
      "university_prestige",
      "years_of_experience"
    ]
  }
}
```

## Notes

- Filtering is Texas-only (`state = TX`)
- Search supports `place_type` values `zip` and `city`
- Results are sorted by `rating` descending
