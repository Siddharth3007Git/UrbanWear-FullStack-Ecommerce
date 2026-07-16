from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.services.product_service import (
    get_product_service,
    create_product_service,
    update_product_service,
    delete_product_service
)

router = APIRouter()

class ProductSchema(BaseModel):
    name:str
    price:int
    category:str
    stock:int
    image:str


@router.get("/products")
def get_product(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    name: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    page: Optional[int] = 1,        # page number (default page 1)
    limit: Optional[int] = 10       # how many products per page (default 10)
):

    return get_product_service(db, category, name, min_price, max_price, page, limit)


@router.post("/products")
def create_product(product: ProductSchema, db: Session = Depends(get_db)):

    new_product = create_product_service(product, db)

    return {
        "message":"Product Added Successfully",
        "data":new_product
    }


@router.put("/update_product/{id}")
def update_product(id:int, obj:ProductSchema, db: Session = Depends(get_db)):

    product = update_product_service(id, obj, db)

    return {
        "message":"Product Updated Successfully",
        "data":product
    }


@router.delete("/delete_product/{id}")
def delete_product(id:int, db: Session = Depends(get_db)):

    delete_product_service(id, db)

    return {
        "message":"Product Deleted Successfully"
    }
