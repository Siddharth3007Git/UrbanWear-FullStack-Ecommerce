from fastapi import APIRouter

router = APIRouter(tags=["Authentication"])


@router.get("/")
def auth_home():
    return {
        "message": "Authentication API Working"
    }