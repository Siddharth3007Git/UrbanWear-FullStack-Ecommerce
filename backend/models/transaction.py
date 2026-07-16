from sqlalchemy import Column, Integer, Float, String, Date
from backend.database.connection import Base

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer)
    amount = Column(Float)
    transaction_date = Column(Date)
    payment_status = Column(String(20))