from backend.database.connection import Base, engine

# Import all models
from backend.models.product import Product
from backend.models.customer import Customer
from backend.models.order import Order
from backend.models.cart import Cart
from backend.models.transaction import Transaction

Base.metadata.create_all(bind=engine)

print("✅ All tables created successfully!")