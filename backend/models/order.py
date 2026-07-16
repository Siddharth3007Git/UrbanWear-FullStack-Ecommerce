from sqlalchemy import Column,Integer,String
from backend.database.connection import Base

class Order(Base):
    __tablename__="orders"
    order_id = Column(Integer,primary_key=True,index=True)
    customer_id = Column(Integer)
    product_id = Column(Integer)
    quantity = Column(Integer)
    status = Column(String(50))