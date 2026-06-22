from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models import Doctor, SearchHistory
from app.schemas import DoctorSchema, LocationSchema, MetaSchema, RankRequest, RankResponse


MAX_RANK = 1571


def calculate_rating(university_rank: int, years_of_experience: int) -> float:
    school_score = ((MAX_RANK - university_rank) / MAX_RANK) * 100
    experience_score = (min(years_of_experience, 40) / 40) * 100
    overall_score = (school_score * 0.4) + (experience_score * 0.6)
    return round(overall_score / 10, 1)


def rank_doctors(request: RankRequest, db: Session, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> RankResponse:
    # Filter by specialty (case-insensitive) and geography in SQL for efficiency.
    normalized_specialty = request.specialty.strip().lower()
    normalized_place = request.place.strip()

    def build_query(specialty_condition):
        query = select(Doctor).where(specialty_condition).where(Doctor.state == "TX")
        if request.place_type == "zip":
            query = query.where(func.trim(Doctor.zip_code) == normalized_place)
        else:
            query = query.where(func.trim(func.lower(Doctor.city)) == normalized_place.lower())
        return query

    query = build_query(func.trim(func.lower(Doctor.specialty)) == normalized_specialty)
    doctors = db.execute(query).scalars().all()

    if not doctors:
        fallback_specialty = func.trim(func.lower(Doctor.specialty)).like(f"%{normalized_specialty}%")
        doctors = db.execute(build_query(fallback_specialty)).scalars().all()

    doctor_scores = [
        (
            calculate_rating(doctor.university_rank, doctor.years_of_experience),
            doctor,
        )
        for doctor in doctors
    ]
    doctor_scores.sort(key=lambda item: item[0], reverse=True)

    results: List[DoctorSchema] = []
    for score, doctor in doctor_scores:
        results.append(
            DoctorSchema(
                id=doctor.id,
                name=doctor.name,
                specialty=doctor.specialty,
                university=doctor.university,
                university_rank=doctor.university_rank,
                years_of_experience=doctor.years_of_experience,
                location=LocationSchema(
                    city=doctor.city,
                    state=doctor.state,
                    zip_code=doctor.zip_code,
                ),
                rating=score,
            )
        )

    results_count = len(results)
    print("Doctors returned after ranking:", results_count)

    history = SearchHistory(
        query=request.original_query,
        specialty=request.specialty.strip(),
        place=request.place.strip(),
        place_type=request.place_type,
        results_count=results_count,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(history)
    db.commit()

    meta = MetaSchema(
        specialty=request.specialty.strip(),
        place=request.place.strip(),
        total_results=results_count,
        ranked_by=["university_prestige", "years_of_experience"],
    )

    return RankResponse(results=results, meta=meta)
