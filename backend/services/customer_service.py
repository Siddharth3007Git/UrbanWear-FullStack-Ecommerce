from fastapi import HTTPException

from backend.models.customer import Customer
from backend.models.user import User


def get_customer_service(db):
    return db.query(Customer).all()


def get_my_profile_service(user_id, db):

    customer = db.query(Customer).filter(
        Customer.user_id == user_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found"
        )

    return customer


def create_customer_service(customer, user_id, db):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_profile = db.query(Customer).filter(
        Customer.user_id == user_id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Customer profile already exists"
        )

    new_customer = Customer(
        user_id=user_id,
        phone=customer.phone,
        gender=customer.gender,
        city=customer.city,
        state=customer.state,
        country=customer.country,
        pincode=customer.pincode
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


def update_my_profile_service(customer, user_id, db):

    existing_customer = db.query(Customer).filter(
        Customer.user_id == user_id
    ).first()

    if not existing_customer:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found"
        )

    existing_customer.phone = customer.phone
    existing_customer.gender = customer.gender
    existing_customer.city = customer.city
    existing_customer.state = customer.state
    existing_customer.country = customer.country
    existing_customer.pincode = customer.pincode

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


def delete_my_profile_service(user_id, db):

    customer = db.query(Customer).filter(
        Customer.user_id == user_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found"
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer profile deleted successfully"
    }