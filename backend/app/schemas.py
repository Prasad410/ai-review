import uuid
from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel


class RankRequest(BaseModel):
    version: Literal["1"]
    specialty: str
    place: str
    place_type: Literal["zip", "city"]
    original_query: str


class LocationSchema(BaseModel):
    city: str
    state: str
    zip_code: str


class DoctorSchema(BaseModel):
    id: uuid.UUID
    name: str
    specialty: str
    university: str
    university_rank: int
    years_of_experience: int
    location: LocationSchema
    rating: float

    class Config:
        orm_mode = True


class MetaSchema(BaseModel):
    specialty: str
    place: str
    total_results: int
    ranked_by: List[str]


class RankResponse(BaseModel):
    results: List[DoctorSchema]
    meta: MetaSchema


class ReviewRequest(BaseModel):
    user_name: str
    user_email: str
    user_review: str


class ReviewResponse(BaseModel):
    id: uuid.UUID
    user_name: str
    user_email: str
    user_review: str
    created_at: datetime

    class Config:
        orm_mode = True
