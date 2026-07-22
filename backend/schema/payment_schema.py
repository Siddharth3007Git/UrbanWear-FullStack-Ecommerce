from pydantic import BaseModel


class PaymentOrderRequest(BaseModel):
    order_id: int


class VerifyPaymentRequest(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    success: bool
    message: str