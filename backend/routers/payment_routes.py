from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.schema.payment_schema import (
    PaymentOrderRequest,
    VerifyPaymentRequest,
)

from backend.services.payment_service import (
    create_payment_order,
    verify_payment,
    payment_history,
)

router = APIRouter(
    prefix="/payment",
    tags=["Payment"]
)


# =====================================================
# Create Razorpay Order
# =====================================================

@router.post("/create-order")
def create_order(
    request: PaymentOrderRequest,
    db: Session = Depends(get_db)
):
    try:
        return create_payment_order(
            db=db,
            order_id=request.order_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =====================================================
# Verify Payment
# =====================================================

@router.post("/verify")
def verify(
    request: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        return verify_payment(
            db=db,
            order_id=request.order_id,
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature,
            background_tasks=background_tasks,
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =====================================================
# Payment History
# =====================================================

@router.get("/history")
def history(
    db: Session = Depends(get_db)
):
    try:
        return payment_history(db)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )