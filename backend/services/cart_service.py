from fastapi import HTTPException
from backend.models.cart import Cart
from backend.models.product import Product
from backend.models.user import User


# ==========================================
# GET MY CART
# ==========================================
def get_my_cart_service(user_id: int, db):

    cart_items = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .all()
    )

    total_price = 0
    data = []

    for item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if not product:
            continue

        subtotal = product.price * item.quantity
        total_price += subtotal

        data.append({
            "cart_id": item.id,
            "quantity": item.quantity,

            "product": {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "stock": product.stock,
                "image": product.image
            },

            "subtotal": subtotal
        })

    return {
        "success": True,
        "data": data,
        "total_items": len(data),
        "total_price": total_price
    }


# ==========================================
# ADD TO CART
# ==========================================
def add_to_cart_service(cart, user_id: int, db):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    product = (
        db.query(Product)
        .filter(Product.id == cart.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if product.stock <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product is out of stock"
        )

    existing = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == cart.product_id
        )
        .first()
    )

    if existing:

        if existing.quantity + cart.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail="Maximum stock reached"
            )

        existing.quantity += cart.quantity

        db.commit()
        db.refresh(existing)

        return {
            "success": True,
            "message": "Cart updated successfully"
        }

    new_item = Cart(
        user_id=user_id,
        product_id=cart.product_id,
        quantity=cart.quantity
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "success": True,
        "message": "Product added to cart successfully"
    }


# ==========================================
# UPDATE CART
# ==========================================
def update_cart_service(cart_id, quantity, user_id, db):

    cart_item = (
        db.query(Cart)
        .filter(
            Cart.id == cart_id,
            Cart.user_id == user_id
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    product = (
        db.query(Product)
        .filter(Product.id == cart_item.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart_item)

    return {
        "success": True,
        "message": "Cart updated successfully"
    }


# ==========================================
# DELETE ITEM
# ==========================================
def delete_cart_service(cart_id, user_id, db):

    cart_item = (
        db.query(Cart)
        .filter(
            Cart.id == cart_id,
            Cart.user_id == user_id
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {
        "success": True,
        "message": "Item removed successfully"
    }


# ==========================================
# CLEAR CART
# ==========================================
def clear_cart_service(user_id, db):

    (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .delete()
    )

    db.commit()

    return {
        "success": True,
        "message": "Cart cleared successfully"
    }