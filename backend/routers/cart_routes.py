from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.services.auth_service import get_current_customer
from backend.services.cart_service import (
    get_cart_service,
    get_cart_by_customer_service,
    add_to_cart_service,
    update_cart_service,
    delete_cart_service
)

router = APIRouter()


class CartSchema(BaseModel):
    customer_id: int
    product_id: int
    quantity: int


class CartUpdateSchema(BaseModel):
    quantity: int


@router.get("/cart")
def get_cart(db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):

    return get_cart_service(db)


@router.get("/cart/{customer_id}")
def get_cart_by_customer(customer_id: int, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):

    return get_cart_by_customer_service(customer_id, db)


@router.post("/cart")
def add_to_cart(cart: CartSchema, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):

    new_item = add_to_cart_service(cart, db)

    return {
        "message": "Item Added to Cart",
        "data": new_item
    }


@router.put("/cart/{cart_id}")
def update_cart(cart_id: int, obj: CartUpdateSchema, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):

    cart_item = update_cart_service(cart_id, obj, db)

    return {
        "message": "Cart Updated",
        "data": cart_item
    }


@router.delete("/cart/{cart_id}")
def delete_cart(cart_id: int, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):

    delete_cart_service(cart_id, db)

    return {
        "message": "Item Removed from Cart"
    }
