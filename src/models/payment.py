from sqlalchemy import Column, String, DateTime, Float
from datetime import datetime
import uuid

from .user import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(String)  # pending, completed, failed, refunded
    stripe_payment_id = Column(String)
    plan = Column(String)  # monthly, yearly
    donation_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)