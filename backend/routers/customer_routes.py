from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.auth.auth_bearer import get_current_user
from backend.models.user import User

from backend.services.customer_service import (
    get_customer_service,
    get_my_profile_service,
    create_customer_service,
    update_my_profile_service,
    delete_my_profile_service
)

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


class CustomerSchema(BaseModel):
    phone: str
    gender: str
    city: str
    state: str
    country: str
    pincode: str


# Get Logged-in Profile
@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return get_my_profile_service(
        current_user.id,
        db
    )


# Get All Customers
@router.get("/")
def get_customers(
    db: Session = Depends(get_db)
):
    return get_customer_service(db)


# Create Profile
@router.post("/")
def create_customer(
    customer: CustomerSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return create_customer_service(
        customer,
        current_user.id,
        db
    )


# Update Logged-in Profile
@router.put("/me")
def update_my_profile(
    customer: CustomerSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return update_my_profile_service(
        customer,
        current_user.id,
        db
    )


# Delete Logged-in Profile
@router.delete("/me")
def delete_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return delete_my_profile_service(
        current_user.id,
        db
    )