from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.services.email_service import (
    welcome_new_user,
    order_confirmation,
    payment_confirmation,
)

router = APIRouter(
    prefix="/email",
    tags=["Email Notifications"]
)


class WelcomeEmailRequest(BaseModel):
    email: str
    username: str


class OrderEmailRequest(BaseModel):
    email: str
    order_id: int


class PaymentEmailRequest(BaseModel):
    email: str
    order_id: int


@router.post("/welcome")
def send_welcome(request: WelcomeEmailRequest):
    try:
        return welcome_new_user(
            email=request.email,
            username=request.username
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/order")
def send_order(request: OrderEmailRequest):
    try:
        return order_confirmation(
            email=request.email,
            order_id=request.order_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/payment")
def send_payment(request: PaymentEmailRequest):
    try:
        return payment_confirmation(
            email=request.email,
            order_id=request.order_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))