from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.auth.auth_bearer import get_current_user
from backend.models.user import User

from backend.services.product_service import (
    get_product_service,
    get_product_by_id_service,
    create_product_service,
    update_product_service,
    delete_product_service
)

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


class ProductSchema(BaseModel):
    name: str
    price: float
    category: str
    stock: int
    image: str


# Get All Products
@router.get("/")
def get_products(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = 1,
    limit: int = 10
):

    return get_product_service(
        db,
        category,
        name,
        min_price,
        max_price,
        page,
        limit
    )


# Get Product By ID
@router.get("/{id}")
def get_product(
    id: int,
    db: Session = Depends(get_db)
):

    return get_product_by_id_service(
        id,
        db
    )


# Create Product
@router.post("/")
def create_product(
    product: ProductSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return create_product_service(
        product,
        db
    )


# Update Product
@router.put("/{id}")
def update_product(
    id: int,
    product: ProductSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return update_product_service(
        id,
        product,
        db
    )


# Delete Product
@router.delete("/{id}")
def delete_product(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return delete_product_service(
        id,
        db
    )