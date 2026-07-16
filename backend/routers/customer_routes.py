from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.services.customer_service import (
    get_customer_service,
    create_customer_service,
    update_customer_service,
    delete_customer_service
)

router = APIRouter()

class CustomerSchema(BaseModel):
    name:str
    email:str
    password:str   # changed int to str (password should be string)

@router.get("/customers")
def get_customer(db: Session = Depends(get_db)):
    return get_customer_service(db)

@router.post("/customers")
def create_customer(customer: CustomerSchema, db: Session = Depends(get_db)):

    new_customer = create_customer_service(customer, db)

    return {
        "message":"customer Added Successfully",
        "data":new_customer
    }

@router.put("/update_customer/{id}")
def update_customer(id:int, obj:CustomerSchema, db: Session = Depends(get_db)):

    customer = update_customer_service(id, obj, db)

    return {
        "message":"Customer Updated Successfully",
        "data":customer
    }

@router.delete("/delete_customer/{id}")
def delete_customer(id:int, db: Session = Depends(get_db)):

    delete_customer_service(id, db)

    return {
        "message":"Deleted Successfully"
    }
