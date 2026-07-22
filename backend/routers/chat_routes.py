from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.schema.chat_schema import ChatRequest, ChatResponse
from backend.services.chat_service import chat_with_ai

router = APIRouter(
    prefix="/chat",
    tags=["AI Shopping Assistant"]
)


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    AI Shopping Assistant

    Example:
    - Show me black shoes under ₹3000
    - Recommend jackets
    - Find shirts below ₹1500
    """

    result = chat_with_ai(
        db=db,
        message=request.message
    )

    return result