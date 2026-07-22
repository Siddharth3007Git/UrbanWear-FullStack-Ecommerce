from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.auth.auth_bearer import get_current_user
from backend.models.user import User

from backend.schema.profile_schema import (
    ProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    MessageResponse,
)

from backend.services.profile_service import (
    get_profile,
    update_profile,
    change_password,
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("", response_model=ProfileResponse)
def read_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_profile(db, current_user.id)


@router.put("", response_model=ProfileResponse)
def edit_profile(
    profile: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_profile(db, current_user.id, profile)


@router.put("/change-password", response_model=MessageResponse)
def update_password(
    password: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return change_password(db, current_user.id, password)