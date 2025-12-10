from sqlalchemy import Column, String, DateTime, Float, Text
from datetime import datetime

from .user import Base

class DonationSummary(Base):
    __tablename__ = "donation_summaries"
    
    id = Column(String, primary_key=True, default="main")
    total_donated = Column(Float, default=0.0)
    last_donation_date = Column(DateTime)
    next_donation_date = Column(DateTime)
    donation_proof_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)