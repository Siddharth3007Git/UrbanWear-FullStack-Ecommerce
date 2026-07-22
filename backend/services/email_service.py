from backend.utils.email_sender import (
    send_welcome_email,
    send_order_confirmation,
    send_payment_success,
)


def welcome_new_user(email: str, username: str):
    """
    Send welcome email to newly registered user.
    """
    try:
        send_welcome_email(email, username)

        return {
            "success": True,
            "message": "Welcome email sent successfully."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def order_confirmation(email: str, order_id: int):
    """
    Send order confirmation email.
    """
    try:
        send_order_confirmation(email, order_id)

        return {
            "success": True,
            "message": "Order confirmation email sent."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def payment_confirmation(email: str, order_id: int):
    """
    Send payment success email.
    """
    try:
        send_payment_success(email, order_id)

        return {
            "success": True,
            "message": "Payment confirmation email sent."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }