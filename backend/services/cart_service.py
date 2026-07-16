from fastapi import HTTPException
from backend.models.cart import Cart


def get_cart_service(db):

    cart_items = db.query(Cart).all()

    return cart_items


def get_cart_by_customer_service(customer_id, db):

    cart_items = db.query(Cart).filter(Cart.customer_id == customer_id).all()

    return cart_items


def add_to_cart_service(cart, db):

    new_cart = Cart(
        customer_id=cart.customer_id,
        product_id=cart.product_id,
        quantity=cart.quantity
    )

    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)

    return new_cart


def update_cart_service(cart_id, obj, db):

    cart_item = db.query(Cart).filter(Cart.cart_id == cart_id).first()

    # ERROR HANDLING - cart item not found
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.quantity = obj.quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


def delete_cart_service(cart_id, db):

    cart_item = db.query(Cart).filter(Cart.cart_id == cart_id).first()

    # ERROR HANDLING - cart item not found
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
