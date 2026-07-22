from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.models.product import Product
from backend.ai.shopping_ai import extract_product_filters


def chat_with_ai(db: Session, message: str):
    """
    UrbanWear AI Shopping Assistant
    """
    print("===== NEW CHAT SERVICE LOADED =====")
    filters = extract_product_filters(message)

    print("Filters:", filters)

    search_text = message.lower()

    category = (filters.get("category") or "").lower()
    brand = (filters.get("brand") or "").lower()
    color = (filters.get("color") or "").lower()
    gender = (filters.get("gender") or "").lower()
    keywords = (filters.get("keywords") or "").lower()

    min_price = filters.get("min_price")
    max_price = filters.get("max_price")

    query = db.query(Product)

    # -----------------------------
    # PRICE FILTER
    # -----------------------------

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # -----------------------------
    # SMART SEARCH
    # -----------------------------

    words = set()

    for text in [
        search_text,
        category,
        brand,
        color,
        gender,
        keywords,
    ]:

        if text:
            words.update(text.split())

    conditions = []

    for word in words:

        if len(word) < 2:
            continue

        conditions.append(
            Product.name.ilike(f"%{word}%")
        )

        conditions.append(
            Product.category.ilike(f"%{word}%")
        )

        if hasattr(Product, "brand"):
            conditions.append(
                Product.brand.ilike(f"%{word}%")
            )

        if hasattr(Product, "color"):
            conditions.append(
                Product.color.ilike(f"%{word}%")
            )

        if hasattr(Product, "gender"):
            conditions.append(
                Product.gender.ilike(f"%{word}%")
            )

    if conditions:
        query = query.filter(or_(*conditions))

    products = query.limit(10).all()

    # -----------------------------
    # FALLBACK
    # -----------------------------

    if not products:

        products = (
            db.query(Product)
            .filter(
                or_(
                    Product.name.ilike(f"%{search_text}%"),
                    Product.category.ilike(f"%{search_text}%")
                )
            )
            .limit(10)
            .all()
        )

    # -----------------------------
    # NO RESULT
    # -----------------------------

    if not products:

        all_products = db.query(Product).limit(5).all()

        if all_products:

            product_list = []

            for p in all_products:

                product_list.append({
                    "id": p.id,
                    "name": p.name,
                    "category": p.category,
                    "price": p.price,
                    "stock": p.stock,
                    "image": p.image
                })

            return {
                "reply": "I couldn't find an exact match, but here are some popular products you may like.",
                "products": product_list
            }

        return {
            "reply": "No products are available right now.",
            "products": []
        }

    # -----------------------------
    # RESPONSE
    # -----------------------------

    product_list = []

    for p in products:

        product_list.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "image": p.image
        })

    names = ", ".join(
        p["name"] for p in product_list[:3]
    )

    return {
        "reply": f"I found {len(product_list)} product(s). Top recommendations: {names}.",
        "products": product_list
    }