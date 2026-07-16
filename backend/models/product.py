from sqlalchemy import Column, Integer, String, Float
from backend.database.connection import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    price = Column(Float)
    category = Column(String(50))
    stock = Column(Integer)
    image = Column(String(255))