from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Doctor, Review
from app.schemas import RankRequest, RankResponse, ReviewRequest, ReviewResponse
from app.services.rank_service import rank_doctors
from sqlalchemy import select, distinct

router = APIRouter(tags=["rank"])


@router.post("/rank", response_model=RankResponse)
def rank_endpoint(request: RankRequest, http_request: Request, db: Session = Depends(get_db)):
    return rank_doctors(
        request,
        db,
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent"),
    )


@router.post("/reviews", response_model=ReviewResponse)
def submit_review(request: ReviewRequest, db: Session = Depends(get_db)):
    review = Review(
        user_name=request.user_name.strip(),
        user_email=request.user_email.strip(),
        user_review=request.user_review.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/search-metadata")
def search_metadata(db: Session = Depends(get_db)):
    """Return distinct specialties, zip codes and city names from the doctors table."""
    specialties_q = select(distinct(Doctor.specialty)).order_by(Doctor.specialty)
    zips_q = select(distinct(Doctor.zip_code)).order_by(Doctor.zip_code)
    cities_q = select(distinct(Doctor.city)).order_by(Doctor.city)

    specialties = [row[0] for row in db.execute(specialties_q).all() if row[0]]
    zip_codes = [row[0] for row in db.execute(zips_q).all() if row[0]]
    cities = [row[0] for row in db.execute(cities_q).all() if row[0]]

    return {
        "specialties": specialties,
        "zip_codes": zip_codes,
        "cities": cities,
    }
