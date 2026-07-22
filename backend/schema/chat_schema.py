from typing import List, Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    """
    User message sent to the AI shopping assistant.
    """
    message: str


class ProductResponse(BaseModel):
    """
    Product returned by the AI assistant.
    """
    id: int
    name: str
    category: str
    price: float
    stock: int
    image: Optional[str] = None


class ChatResponse(BaseModel):
    """
    AI shopping assistant response.
    """
    reply: str
    products: List[ProductResponse]