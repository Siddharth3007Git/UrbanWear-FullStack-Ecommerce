from fastapi import HTTPException
from backend.models.order import Order


def get_order_service(db):

    orders = db.query(Order).all()

    return orders


def create_order_service(order, db):

    new_order = Order(
        customer_id=order.customer_id,
        product_id=order.product_id,
        quantity=order.quantity,
        status=order.status
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


def update_order_service(id, obj, db):

    order = db.query(Order).filter(Order.order_id == id).first()

    # ERROR HANDLING - order not found
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.customer_id = obj.customer_id
    order.product_id = obj.product_id
    order.quantity = obj.quantity
    order.status = obj.status

    db.commit()
    db.refresh(order)

    return order


def delete_order_service(id, db):

    order = db.query(Order).filter(Order.order_id == id).first()

    # ERROR HANDLING - order not found
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
