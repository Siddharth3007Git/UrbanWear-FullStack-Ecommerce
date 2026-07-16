from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.models.customer import Customer
from backend.database.connection import get_db

# ---- config ----
SECRET_KEY = "your_secret_key_change_this"   # change this to any random long string
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def login_service(email, password, db):
    customer = db.query(Customer).filter(Customer.email == email).first()

    if not customer:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(password, customer.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": customer.email, "id": customer.id})

    return {"access_token": token, "token_type": "bearer"}


def get_current_customer(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    customer = db.query(Customer).filter(Customer.email == email).first()
    if customer is None:
        raise HTTPException(status_code=401, detail="Customer not found")

    return customer
