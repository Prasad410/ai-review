"""Seed doctor records from Excel into PostgreSQL.

Run with:
    python -m backend.scripts.ingest_doctors
"""
import pandas as pd
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.models import Doctor


INPUT_FILE = "data/texas_doctors.xlsx"
COLUMNS = {
    "UNIQUE ID NUMBER": "unique_id",
    "PHYSICIAN LICENSE NUMBER": "license_number",
    "LAST NAME": "last_name",
    "FIRST NAME": "first_name",
    "PRACTICE ADDRESS CITY": "city",
    "PRACTICE ADDRESS STATE": "state",
    "PRACTICE ADDRESS ZIP CODE": "zip_code",
    "PRIMARY SPECIALTY": "specialty",
    "MEDICAL SCHOOL": "university",
    "MEDICAL SCHOOL RANK (approx)": "university_rank",
    "TOTAL YEARS IN INDUSTRY": "years_of_experience",
    "GENDER CODE": "gender_code",
}


def load_doctor_rows() -> pd.DataFrame:
    df = pd.read_excel(INPUT_FILE, dtype=str)
    df = df[list(COLUMNS.keys())].rename(columns=COLUMNS)
    df = df.dropna(subset=["first_name", "last_name", "specialty", "university", "university_rank", "years_of_experience", "city", "state", "zip_code"])
    df["name"] = df["first_name"].str.strip() + " " + df["last_name"].str.strip()
    df["university_rank"] = pd.to_numeric(df["university_rank"], errors="coerce").fillna(1571).astype(int)
    df["years_of_experience"] = pd.to_numeric(df["years_of_experience"], errors="coerce").fillna(0).astype(int)
    df["state"] = df["state"].str.strip().str.upper()
    df["specialty"] = df["specialty"].str.strip()
    df["university"] = df["university"].str.strip()
    df["city"] = df["city"].str.strip()
    df["zip_code"] = df["zip_code"].astype(str).str.strip()
    df = df[df["state"] == "TX"]
    df = df.drop_duplicates(subset=["name", "zip_code"])
    return df


def ingest_doctors(db: Session, doctors: pd.DataFrame) -> tuple[int, int, int]:
    total_rows = len(doctors)
    inserted = 0
    skipped = 0

    for record in doctors.to_dict(orient="records"):
        existing = (
            db.query(Doctor)
            .filter(Doctor.name == record["name"], Doctor.zip_code == record["zip_code"])
            .one_or_none()
        )
        if existing is not None:
            skipped += 1
            continue

        doctor = Doctor(
            name=record["name"],
            specialty=record["specialty"],
            university=record["university"],
            university_rank=record["university_rank"],
            years_of_experience=record["years_of_experience"],
            city=record["city"],
            state=record["state"],
            zip_code=record["zip_code"],
        )
        db.add(doctor)
        inserted += 1

    db.commit()
    return total_rows, inserted, skipped


def main() -> None:
    Base.metadata.create_all(bind=engine)
    doctors_df = load_doctor_rows()

    with SessionLocal() as db:
        total_rows, inserted, skipped = ingest_doctors(db, doctors_df)

    print(f"Total rows read: {total_rows}")
    print(f"Inserted rows: {inserted}")
    print(f"Skipped rows: {skipped}")


if __name__ == "__main__":
    main()
