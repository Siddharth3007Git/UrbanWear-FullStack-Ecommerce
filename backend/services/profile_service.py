from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models.user import User
from backend.models.customer import Customer
from backend.schema.profile_schema import (
    UpdateProfileRequest,
    ChangePasswordRequest
)

from backend.auth.password import (
    hash_password,
    verify_password
)


# =====================================================
# GET PROFILE
# =====================================================

def get_profile(db: Session, user_id: int):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    customer = (
        db.query(Customer)
        .filter(Customer.user_id == user.id)
        .first()
    )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": customer.phone if customer else None,
        "gender": customer.gender if customer else None,
        "city": customer.city if customer else None,
        "state": customer.state if customer else None,
        "country": customer.country if customer else None,
        "pincode": customer.pincode if customer else None
    }


# =====================================================
# UPDATE PROFILE
# =====================================================

def update_profile(
    db: Session,
    user_id: int,
    profile: UpdateProfileRequest
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    customer = (
        db.query(Customer)
        .filter(Customer.user_id == user.id)
        .first()
    )

    if customer is None:

        customer = Customer(
            user_id=user.id
        )

        db.add(customer)

    user.name = profile.name

    customer.phone = profile.phone
    customer.gender = profile.gender
    customer.city = profile.city
    customer.state = profile.state
    customer.country = profile.country
    customer.pincode = profile.pincode

    db.commit()

    db.refresh(user)
    db.refresh(customer)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": customer.phone,
        "gender": customer.gender,
        "city": customer.city,
        "state": customer.state,
        "country": customer.country,
        "pincode": customer.pincode
    }


# =====================================================
# CHANGE PASSWORD
# =====================================================

def change_password(
    db: Session,
    user_id: int,
    password_data: ChangePasswordRequest
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if not verify_password(
        password_data.current_password,
        user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    user.password = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "success": True,
        "message": "Password updated successfully."
    }