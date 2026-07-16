from sqlalchemy import Column, Integer
from backend.database.connection import Base

class Cart(Base):
    __tablename__ = "cart"

    cart_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer)
    product_id = Column(Integer)
    quantity = Column(Integer)
