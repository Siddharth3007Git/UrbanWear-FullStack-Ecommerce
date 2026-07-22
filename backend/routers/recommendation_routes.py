from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.auth.auth_bearer import get_current_user

from backend.services.recommendation_service import (
    get_personalized_recommendations,
    get_similar_products,
    get_products_by_category,
    search_products
)

router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"]
)


@router.get("/me")
def my_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Personalized recommendations based on
    user's purchase history.
    """

    try:
        return get_personalized_recommendations(
            db=db,
            user_id=current_user.id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/product/{product_id}")
def similar_products(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Similar products based on category.
    """

    try:
        products = get_similar_products(
            db=db,
            product_id=product_id
        )

        return {
            "count": len(products),
            "products": products
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.get("/category/{category}")
def category_products(
    category: str,
    db: Session = Depends(get_db)
):
    """
    Products from a specific category.
    """

    products = get_products_by_category(
        db=db,
        category=category
    )

    return {
        "category": category,
        "count": len(products),
        "products": products
    }


@router.get("/search")
def search(
    keyword: str,
    db: Session = Depends(get_db)
):
    """
    Search products by keyword.
    """

    products = search_products(
        db=db,
        keyword=keyword
    )

    return {
        "keyword": keyword,
        "count": len(products),
        "products": products
    }