from sqlalchemy import Column, String, Integer, DateTime, Float
from datetime import datetime
import uuid

from .user import Base

class GenerationLog(Base):
    __tablename__ = "generation_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    keyword = Column(String, nullable=False)
    num_pages = Column(Integer)
    duration = Column(Float)
    status = Column(String)  # success, failed
    video_url = Column(String)
    credits_used = Column(Integer, default=1)
    donation_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Index for faster queries
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )