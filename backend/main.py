from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import time

from backend.database.connection import Base, engine

# ==========================
# Models
# ==========================
from backend.models.product import Product
from backend.models.customer import Customer
from backend.models.order import Order
from backend.models.cart import Cart
from backend.models.transaction import Transaction
from backend.models.user import User
from backend.models.order_item import OrderItem
from backend.routers.chat_routes import router as chat_router

# ==========================
# Routers
# ==========================
from backend.routers.product_routes import router as product_router
from backend.routers.customer_routes import router as customer_router
from backend.routers.order_routes import router as order_router
from backend.routers.cart_routes import router as cart_router
from backend.routers.transaction_routes import router as transaction_router
from backend.routers.auth_routes import router as auth_router
from backend.routers.recommendation_routes import router as recommendation_router
from backend.routers.admin_routes import router as admin_router
from backend.routers.email_routes import router as email_router
from backend.utils.exception_handler import register_exception_handlers
from backend.routers.profile_routes import router as profile_router
from backend.routers.payment_routes import router as payment_router


app = FastAPI(
    title="UrbanWear API",
    description="UrbanWear E-Commerce Backend",
    version="1.0.0"
)

register_exception_handlers(app)

# ==========================
# CORS
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Create Tables
# ==========================
@app.on_event("startup")
def startup():
    print("Waiting for MySQL...")

    for i in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            print("Database connected successfully!")
            return
        except OperationalError:
            print(f"MySQL not ready... retry {i + 1}/30")
            time.sleep(2)

    raise RuntimeError("Could not connect to MySQL.")

# ==========================
# Register Routers
# ==========================
app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(transaction_router)
app.include_router(recommendation_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(email_router)
app.include_router(profile_router)
app.include_router(payment_router)

# ==========================
# Home
# ==========================
@app.get("/")
def home():
    return {
        "message": "UrbanWear API Running Successfully 🚀"
    }