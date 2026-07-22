from collections import Counter
from sqlalchemy.orm import Session

from backend.models.order import Order
from backend.models.order_item import OrderItem
from backend.models.product import Product


def get_personalized_recommendations(db: Session, user_id: int):
    """
    Recommend products based on the user's purchase history.
    """

    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .all()
    )

    if not orders:
        return {
            "message": "No purchase history found.",
            "recommendations": []
        }

    order_ids = [order.id for order in orders]

    order_items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id.in_(order_ids))
        .all()
    )

    if not order_items:
        return {
            "message": "No purchased products found.",
            "recommendations": []
        }

    purchased_product_ids = []
    category_counter = Counter()

    for item in order_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product:
            purchased_product_ids.append(product.id)
            category_counter[product.category] += item.quantity

    if not category_counter:
        return {
            "message": "No recommendations available.",
            "recommendations": []
        }

    favorite_category = category_counter.most_common(1)[0][0]

    recommendations = (
        db.query(Product)
        .filter(
            Product.category == favorite_category,
            Product.stock > 0
        )
        .all()
    )

    result = []

    for product in recommendations:

        if product.id in purchased_product_ids:
            continue

        result.append({
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "stock": product.stock,
            "image": product.image
        })

    return {
        "favorite_category": favorite_category,
        "recommendations": result
    }


def get_similar_products(db: Session, product_id: int):
    """
    Recommend products similar to a selected product.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError("Product not found.")

    products = (
        db.query(Product)
        .filter(
            Product.category == product.category,
            Product.id != product.id,
            Product.stock > 0
        )
        .order_by(Product.price)
        .limit(5)
        .all()
    )

    return products


def get_products_by_category(db: Session, category: str):

    products = (
        db.query(Product)
        .filter(
            Product.category == category,
            Product.stock > 0
        )
        .all()
    )

    return products


def search_products(db: Session, keyword: str):

    return (
        db.query(Product)
        .filter(Product.name.ilike(f"%{keyword}%"))
        .all()
    )