import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

EMAIL = os.getenv("EMAIL_ADDRESS")
PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_email(receiver_email: str, subject: str, body: str):
    """
    Send an email using Gmail SMTP.
    """

    message = MIMEMultipart()

    message["From"] = EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(message)

    return True


def send_welcome_email(receiver_email: str, username: str):
    subject = "Welcome to UrbanWear"

    body = f"""
Hello {username},

Welcome to UrbanWear!

Your account has been created successfully.

Happy Shopping!

UrbanWear Team
"""

    return send_email(receiver_email, subject, body)


def send_order_confirmation(receiver_email: str, order_id: int):
    subject = "Order Confirmed"

    body = f"""
Thank you for shopping with UrbanWear.

Your Order #{order_id} has been placed successfully.

Thank you!
"""

    return send_email(receiver_email, subject, body)


def send_payment_success(receiver_email: str, order_id: int):
    subject = "Payment Successful"

    body = f"""
Your payment for Order #{order_id} has been received successfully.

Thank you for shopping with UrbanWear.
"""

    return send_email(receiver_email, subject, body)