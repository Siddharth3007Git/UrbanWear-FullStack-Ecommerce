from fastapi import HTTPException
from backend.models.customer import Customer
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_customer_service(db):
    return db.query(Customer).all()


def create_customer_service(customer, db):

    # ERROR HANDLING - email already exists
    existing = db.query(Customer).filter(Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(customer.password)

    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        password=hashed_password
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


def update_customer_service(id, obj, db):

    customer = db.query(Customer).filter(Customer.id == id).first()

    # ERROR HANDLING - customer not found
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.name = obj.name
    customer.email = obj.email
    customer.password = pwd_context.hash(obj.password)

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer_service(id, db):

    customer = db.query(Customer).filter(Customer.id == id).first()

    # ERROR HANDLING - customer not found
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()
