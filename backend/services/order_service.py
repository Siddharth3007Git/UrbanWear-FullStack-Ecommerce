from sqlalchemy.orm import Session
from fastapi import BackgroundTasks

from backend.models.cart import Cart
from backend.models.order import Order
from backend.models.order_item import OrderItem
from backend.models.product import Product
from backend.models.customer import Customer

from backend.email.email_service import EmailService
from backend.email.email_templates import EmailTemplates


# =====================================================
# Place Order
# =====================================================

def place_order_service(
    db: Session,
    user_id: int,
    background_tasks: BackgroundTasks
):
    """
    Create an order from the user's cart.
    """

    cart_items = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .all()
    )

    if not cart_items:
        raise ValueError("Your cart is empty.")

    total_amount = 0

    # Validate Stock
    for item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if not product:
            raise ValueError(
                f"Product {item.product_id} not found."
            )

        if product.stock < item.quantity:
            raise ValueError(
                f"Not enough stock for {product.name}"
            )

        total_amount += product.price * item.quantity

    # Create Order

    order = Order(
        user_id=user_id,
        total_amount=total_amount,
        status="Placed"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Save Order Items

    for item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(order_item)

        # Reduce Stock
        product.stock -= item.quantity

    # Clear Cart

    (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .delete()
    )

    db.commit()

    # ==========================================
    # Send Order Confirmation Email
    # ==========================================

    customer = (
        db.query(Customer)
        .filter(Customer.id == user_id)
        .first()
    )

    if customer:

        background_tasks.add_task(

            EmailService.send_email,

            customer.email,

            "Order Confirmation - UrbanWear",

            EmailTemplates.order_confirmation(

                customer.name,

                order.id,

                total_amount

            )

        )

    return {

        "message": "Order placed successfully.",

        "order_id": order.id,

        "total_amount": total_amount,

        "status": order.status

    }


# =====================================================
# Get My Orders
# =====================================================

def get_my_orders_service(
    db: Session,
    user_id: int
):
    """
    Get all orders for the logged-in user.
    """

    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.id.desc())
        .all()
    )

    result = []

    for order in orders:

        order_items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id)
            .all()
        )

        products = []

        for item in order_items:

            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            products.append({

                "product_id": item.product_id,

                "product_name": (
                    product.name
                    if product
                    else "Deleted Product"
                ),

                "quantity": item.quantity,

                "price": item.price,

                "subtotal": item.quantity * item.price

            })

        result.append({

            "order_id": order.id,

            "status": order.status,

            "total_amount": order.total_amount,

            "created_at": order.created_at,

            "products": products

        })

    return result
# =====================================================
# Get Order By ID
# =====================================================

def get_order_by_id_service(
    db: Session,
    user_id: int,
    order_id: int
):
    """
    Get a single order by ID.
    """

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not order:
        raise ValueError("Order not found.")

    order_items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    products = []

    for item in order_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        products.append({

            "product_id": item.product_id,

            "product_name": (
                product.name
                if product
                else "Deleted Product"
            ),

            "quantity": item.quantity,

            "price": item.price,

            "subtotal": item.quantity * item.price

        })

    return {

        "order_id": order.id,

        "status": order.status,

        "total_amount": order.total_amount,

        "created_at": order.created_at,

        "products": products

    }


# =====================================================
# Cancel Order
# =====================================================

def cancel_order_service(
    db: Session,
    user_id: int,
    order_id: int
):
    """
    Cancel an order and restore product stock.
    """

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not order:
        raise ValueError("Order not found.")

    if order.status == "Cancelled":
        raise ValueError("Order is already cancelled.")

    order_items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    # Restore Stock
    for item in order_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product:
            product.stock += item.quantity

    order.status = "Cancelled"

    db.commit()
    db.refresh(order)

    return {

        "message": "Order cancelled successfully.",

        "order_id": order.id,

        "status": order.status

    }