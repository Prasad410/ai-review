import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(length=255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(length=128), index=True, nullable=False)
    university: Mapped[str] = mapped_column(String(length=255), nullable=False)
    university_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    years_of_experience: Mapped[int] = mapped_column(Integer, nullable=False)
    city: Mapped[str] = mapped_column(String(length=128), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(length=2), index=True, nullable=False)
    zip_code: Mapped[str] = mapped_column(String(length=16), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Doctor(id={self.id!s}, name={self.name!r}, specialty={self.specialty!r}, "
            f"city={self.city!r}, state={self.state!r}, zip_code={self.zip_code!r})>"
        )


class SearchHistory(Base):
    __tablename__ = "search_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    query: Mapped[str] = mapped_column(String(length=1024), nullable=False)
    specialty: Mapped[str] = mapped_column(String(length=128), nullable=False)
    place: Mapped[str] = mapped_column(String(length=128), nullable=False)
    place_type: Mapped[str] = mapped_column(String(length=16), nullable=False)
    results_count: Mapped[int] = mapped_column(Integer, nullable=False)
    ip_address: Mapped[str] = mapped_column(String(length=64), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(length=512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<SearchHistory(id={self.id!s}, query={self.query!r}, specialty={self.specialty!r}, "
            f"place={self.place!r}, place_type={self.place_type!r}, results_count={self.results_count})>"
        )
