from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.services.auth_service import get_current_customer   # NEW
from backend.services.order_service import (
    get_order_service,
    create_order_service,
    update_order_service,
    delete_order_service
)

router = APIRouter()

class OrderSchema(BaseModel):
    customer_id:int
    product_id:int
    quantity:int
    status:str


@router.get("/orders")
def get_order(db: Session = Depends(get_db)):

    return get_order_service(db)


@router.post("/orders")
def create_order(order: OrderSchema, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):   # NEW - login required

    new_order = create_order_service(order, db)

    return {
        "message":"Order Confirmed",
        "data":new_order
    }


@router.put("/update_order/{id}")
def update_order(id:int, obj:OrderSchema, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):   # NEW - login required

    order = update_order_service(id, obj, db)

    return {
        "message":"Order Updated",
        "data":order
    }


@router.delete("/delete_order/{id}")
def delete_order(id:int, db: Session = Depends(get_db), current_customer = Depends(get_current_customer)):   # NEW - login required

    delete_order_service(id, db)

    return {
        "message":"Order Deleted Successfully"
    }
