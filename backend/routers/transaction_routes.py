from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from backend.database.connection import get_db
from backend.services.transaction_service import (
    get_transaction_service,
    create_transaction_service,
    update_transaction_service
)

router = APIRouter()


class TransactionSchema(BaseModel):
    order_id:int
    amount:float
    transaction_date:date
    payment_status:str


@router.get("/transactions")
def get_transaction(db: Session = Depends(get_db)):

    return get_transaction_service(db)


@router.post("/transactions")
def create_transaction(transaction: TransactionSchema, db: Session = Depends(get_db)):

    new_transaction = create_transaction_service(transaction, db)

    return {
        "message":"Add transaction successfully",
        "data":new_transaction
    }


@router.put("/update_transaction/{id}")
def update_transaction(id:int, obj:TransactionSchema, db: Session = Depends(get_db)):

    transaction = update_transaction_service(id, obj, db)

    return {
        "message":"Update Successfully",
        "data":transaction
    }
