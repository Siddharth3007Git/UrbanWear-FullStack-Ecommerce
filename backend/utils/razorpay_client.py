import os

import razorpay
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Razorpay Credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise ValueError(
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in the .env file."
    )

# Create Razorpay Client
client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


def get_client():
    """
    Returns the configured Razorpay client.
    """
    return client