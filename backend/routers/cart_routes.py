from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.auth.auth_bearer import get_current_user
from backend.models.user import User

from backend.services.cart_service import (
    get_my_cart_service,
    add_to_cart_service,
    update_cart_service,
    delete_cart_service,
    clear_cart_service
)

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


class CartSchema(BaseModel):
    product_id: int
    quantity: int


class CartUpdateSchema(BaseModel):
    quantity: int


# ===========================
# Get Logged-in User Cart
# ===========================
@router.get("/")
def get_my_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return get_my_cart_service(
        current_user.id,
        db
    )


# ===========================
# Add Product To Cart
# ===========================
@router.post("/")
def add_to_cart(
    cart: CartSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return add_to_cart_service(
        cart,
        current_user.id,
        db
    )


# ===========================
# Update Quantity
# ===========================
@router.put("/{cart_id}")
def update_cart(
    cart_id: int,
    cart: CartUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return update_cart_service(
        cart_id,
        cart.quantity,
        current_user.id,
        db
    )


# ===========================
# Delete Item
# ===========================
@router.delete("/{cart_id}")
def delete_cart(
    cart_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return delete_cart_service(
        cart_id,
        current_user.id,
        db
    )


# ===========================
# Clear Cart
# ===========================
@router.delete("/clear")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return clear_cart_service(
        current_user.id,
        db
    )