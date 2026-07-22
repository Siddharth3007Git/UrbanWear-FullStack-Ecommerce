from datetime import date

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from backend.models.order import Order
from backend.models.transaction import Transaction
from backend.models.customer import Customer

from backend.utils.razorpay_client import get_client

from backend.email.email_service import EmailService
from backend.email.email_templates import EmailTemplates


# =====================================================
# Create Razorpay Order
# =====================================================

def create_payment_order(
    db: Session,
    order_id: int
):
    """
    Create Razorpay Order
    """

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise ValueError("Order not found.")

    if order.status == "Cancelled":
        raise ValueError("Cancelled orders cannot be paid.")

    if order.status == "Paid":
        raise ValueError("Order is already paid.")

    client = get_client()

    razorpay_order = client.order.create(
        {
            "amount": int(order.total_amount * 100),
            "currency": "INR",
            "receipt": f"ORDER_{order.id}"
        }
    )

    return {
        "success": True,
        "order_id": order.id,
        "amount": order.total_amount,
        "currency": "INR",
        "razorpay_order_id": razorpay_order["id"],
        "key": client.auth[0]
    }


# =====================================================
# Verify Payment
# =====================================================

def verify_payment(
    db: Session,
    order_id: int,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    background_tasks: BackgroundTasks
):

    client = get_client()

    params = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": razorpay_signature,
    }

    # Verify Razorpay Signature
    client.utility.verify_payment_signature(params)

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise ValueError("Order not found.")
    # Update Order Status
    order.status = "Paid"

    # Create Transaction
    transaction = Transaction(
        order_id=order.id,
        amount=order.total_amount,
        transaction_date=date.today(),
        payment_status="Success"
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Get Customer Details
    customer = (
        db.query(Customer)
        .filter(Customer.id == order.user_id)
        .first()
    )

    # Send Payment Success Email
    if customer:
        background_tasks.add_task(
            EmailService.send_email,
            customer.email,
            "Payment Successful - UrbanWear",
            EmailTemplates.payment_success(
                customer.name,
                order.id,
                razorpay_payment_id,
                order.total_amount
            )
        )

    return {
        "success": True,
        "message": "Payment verified successfully.",
        "order_id": order.id,
        "payment_id": razorpay_payment_id,
        "transaction_id": transaction.transaction_id,
        "amount": order.total_amount,
        "payment_status": transaction.payment_status
    }


# =====================================================
# Payment History
# =====================================================

def payment_history(
    db: Session
):
    """
    Get all payment transactions.
    """

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.transaction_id.desc())
        .all()
    )

    return transactions