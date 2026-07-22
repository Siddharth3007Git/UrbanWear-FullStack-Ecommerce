from pydantic import BaseModel, EmailStr
from typing import Optional


# ==========================================
# Profile Response
# ==========================================

class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


# ==========================================
# Update Profile
# ==========================================

class UpdateProfileRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None


# ==========================================
# Change Password
# ==========================================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ==========================================
# Common Response
# ==========================================

class MessageResponse(BaseModel):
    success: bool
    message: str