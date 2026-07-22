from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from backend.models.customer import Customer
from backend.models.product import Product
from backend.models.order import Order
from backend.models.transaction import Transaction
from backend.models.order_item import OrderItem
from backend.models.user import User


# =====================================================
# DASHBOARD STATISTICS
# =====================================================

def get_dashboard_statistics(db: Session):
    """
    Returns complete dashboard statistics.
    """

    total_customers = (
        db.query(func.count(Customer.id))
        .scalar()
        or 0
    )

    total_products = (
        db.query(func.count(Product.id))
        .scalar()
        or 0
    )

    total_orders = (
        db.query(func.count(Order.id))
        .scalar()
        or 0
    )

    total_transactions = (
        db.query(func.count(Transaction.transaction_id))
        .scalar()
        or 0
    )

    total_revenue = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.status != "Cancelled")
        .scalar()
        or 0
    )

    pending_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status == "Placed")
        .scalar()
        or 0
    )

    cancelled_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status == "Cancelled")
        .scalar()
        or 0
    )

    completed_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status == "Delivered")
        .scalar()
        or 0
    )

    low_stock_products = (
        db.query(func.count(Product.id))
        .filter(Product.stock <= 5)
        .scalar()
        or 0
    )

    return {
        "total_customers": total_customers,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_transactions": total_transactions,
        "total_revenue": float(total_revenue),
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "low_stock_products": low_stock_products,
    }


# =====================================================
# REVENUE SUMMARY
# =====================================================

def get_revenue_summary(db: Session):
    """
    Returns revenue information.
    """

    total_revenue = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.status != "Cancelled")
        .scalar()
        or 0
    )

    total_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status != "Cancelled")
        .scalar()
        or 0
    )

    average_order_value = (
        round(float(total_revenue) / total_orders, 2)
        if total_orders
        else 0
    )

    highest_order = (
        db.query(func.max(Order.total_amount))
        .filter(Order.status != "Cancelled")
        .scalar()
        or 0
    )

    lowest_order = (
        db.query(func.min(Order.total_amount))
        .filter(Order.status != "Cancelled")
        .scalar()
        or 0
    )

    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "average_order_value": average_order_value,
        "highest_order": float(highest_order),
        "lowest_order": float(lowest_order),
    }
# =====================================================
# MONTHLY REVENUE ANALYTICS
# =====================================================

def get_monthly_revenue(db: Session):
    """
    Returns monthly revenue analytics for dashboard charts.
    """

    monthly_data = (
        db.query(
            extract("month", Order.created_at).label("month"),
            func.sum(Order.total_amount).label("revenue")
        )
        .filter(Order.status != "Cancelled")
        .group_by(extract("month", Order.created_at))
        .order_by(extract("month", Order.created_at))
        .all()
    )

    month_names = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ]

    revenue_map = {i: 0 for i in range(1, 13)}

    for row in monthly_data:
        revenue_map[int(row.month)] = float(row.revenue)

    return {
        "labels": month_names,
        "revenue": [
            revenue_map[1],
            revenue_map[2],
            revenue_map[3],
            revenue_map[4],
            revenue_map[5],
            revenue_map[6],
            revenue_map[7],
            revenue_map[8],
            revenue_map[9],
            revenue_map[10],
            revenue_map[11],
            revenue_map[12],
        ],
    }


# =====================================================
# MONTHLY ORDER ANALYTICS
# =====================================================

def get_monthly_orders(db: Session):
    """
    Returns monthly order count analytics.
    """

    monthly_orders = (
        db.query(
            extract("month", Order.created_at).label("month"),
            func.count(Order.id).label("orders")
        )
        .group_by(extract("month", Order.created_at))
        .order_by(extract("month", Order.created_at))
        .all()
    )

    month_names = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ]

    order_map = {i: 0 for i in range(1, 13)}

    for row in monthly_orders:
        order_map[int(row.month)] = int(row.orders)

    return {
        "labels": month_names,
        "orders": [
            order_map[1],
            order_map[2],
            order_map[3],
            order_map[4],
            order_map[5],
            order_map[6],
            order_map[7],
            order_map[8],
            order_map[9],
            order_map[10],
            order_map[11],
            order_map[12],
        ],
    }
# =====================================================
# RECENT ORDERS
# =====================================================

def get_recent_orders(db: Session, limit: int = 10):
    """
    Returns the most recent orders with customer information.
    """

    orders = (
        db.query(
            Order.id,
            User.name.label("customer_name"),
            Order.total_amount,
            Order.status,
            Order.created_at
        )
        .join(User, User.id == Order.user_id)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "order_id": order.id,
            "customer_name": order.customer_name,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": (
                order.created_at.strftime("%d-%m-%Y %H:%M")
                if order.created_at
                else None
            )
        }
        for order in orders
    ]


# =====================================================
# RECENT TRANSACTIONS
# =====================================================

def get_recent_transactions(db: Session, limit: int = 10):
    """
    Returns the latest transactions with customer information.
    """

    transactions = (
        db.query(
            Transaction.transaction_id,
            Transaction.amount,
            Transaction.payment_status,
            Transaction.transaction_date,
            Order.id.label("order_id"),
            User.name.label("customer_name")
        )
        .join(Order, Order.id == Transaction.order_id)
        .join(User, User.id == Order.user_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "transaction_id": transaction.transaction_id,
            "order_id": transaction.order_id,
            "customer_name": transaction.customer_name,
            "amount": float(transaction.amount),
            "payment_status": transaction.payment_status,
            "transaction_date": (
                transaction.transaction_date.strftime("%d-%m-%Y")
                if transaction.transaction_date
                else None
            )
        }
        for transaction in transactions
    ]
# =====================================================
# BEST SELLING PRODUCTS
# =====================================================

def get_best_selling_products(db: Session, limit: int = 10):
    """
    Returns the top-selling products based on total quantity sold.
    """

    products = (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            Product.category,
            Product.price,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("total_revenue")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(
            Product.id,
            Product.name,
            Product.category,
            Product.price
        )
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "category": product.category,
            "price": float(product.price),
            "total_sold": int(product.total_sold or 0),
            "total_revenue": float(product.total_revenue or 0),
        }
        for product in products
    ]


# =====================================================
# LOW STOCK PRODUCTS
# =====================================================

def get_low_stock_products(db: Session, threshold: int = 5):
    """
    Returns products with stock less than or equal to the threshold.
    """

    products = (
        db.query(Product)
        .filter(Product.stock <= threshold)
        .order_by(Product.stock.asc())
        .all()
    )

    result = []

    for product in products:

        if product.stock == 0:
            status = "Out of Stock"
        elif product.stock <= 2:
            status = "Critical"
        else:
            status = "Low"

        result.append(
            {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": float(product.price),
                "stock": product.stock,
                "status": status,
                "image": product.image,
            }
        )

    return result