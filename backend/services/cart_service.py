from fastapi import HTTPException

from backend.models.cart import Cart
from backend.models.product import Product
from backend.models.user import User


# ============================
# Get Logged-in User Cart
# ============================
def get_my_cart_service(user_id, db):

    cart_items = db.query(Cart).filter(
        Cart.user_id == user_id
    ).all()

    total_price = 0
    items = []

    for item in cart_items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if product:

            subtotal = product.price * item.quantity
            total_price += subtotal

            items.append({
                "cart_id": item.id,
                "product_id": product.id,
                "product_name": product.name,
                "price": product.price,
                "quantity": item.quantity,
                "subtotal": subtotal
            })

    return {
        "total_items": len(items),
        "total_price": total_price,
        "items": items
    }


# ============================
# Add Product To Cart
# ============================
def add_to_cart_service(cart, user_id, db):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    product = db.query(Product).filter(
        Product.id == cart.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if product.stock < cart.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    existing_item = db.query(Cart).filter(
        Cart.user_id == user_id,
        Cart.product_id == cart.product_id
    ).first()

    if existing_item:

        existing_item.quantity += cart.quantity

        db.commit()
        db.refresh(existing_item)

        return existing_item

    new_item = Cart(
        user_id=user_id,
        product_id=cart.product_id,
        quantity=cart.quantity
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


# ============================
# Update Quantity
# ============================
def update_cart_service(cart_id, quantity, user_id, db):

    cart_item = db.query(Cart).filter(
        Cart.id == cart_id,
        Cart.user_id == user_id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    product = db.query(Product).filter(
        Product.id == cart_item.product_id
    ).first()

    if quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


# ============================
# Delete Item
# ============================
def delete_cart_service(cart_id, user_id, db):

    cart_item = db.query(Cart).filter(
        Cart.id == cart_id,
        Cart.user_id == user_id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Item removed from cart"
    }


# ============================
# Clear Cart
# ============================
def clear_cart_service(user_id, db):

    cart_items = db.query(Cart).filter(
        Cart.user_id == user_id
    ).all()

    for item in cart_items:
        db.delete(item)

    db.commit()

    return {
        "message": "Cart cleared successfully"
    }