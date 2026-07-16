from sqlalchemy import Column,Integer,String
from backend.database.connection import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String(100))
    email = Column(String(100))
    password = Column(String(100))