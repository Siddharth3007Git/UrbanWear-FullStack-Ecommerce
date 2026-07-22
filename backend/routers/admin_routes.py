from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.services.admin_service import (
    get_dashboard_statistics,
    get_revenue_summary,
    get_monthly_revenue,
    get_monthly_orders,
    get_recent_orders,
    get_recent_transactions,
    get_low_stock_products,
    get_best_selling_products,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"]
)


# =====================================================
# DASHBOARD
# =====================================================

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """
    Dashboard statistics
    """
    return get_dashboard_statistics(db)


# =====================================================
# REVENUE SUMMARY
# =====================================================

@router.get("/revenue")
def revenue(db: Session = Depends(get_db)):
    """
    Revenue summary
    """
    return get_revenue_summary(db)


# =====================================================
# MONTHLY REVENUE
# =====================================================

@router.get("/monthly-revenue")
def monthly_revenue(db: Session = Depends(get_db)):
    """
    Monthly revenue analytics.
    """
    return get_monthly_revenue(db)


# =====================================================
# MONTHLY ORDERS
# =====================================================

@router.get("/monthly-orders")
def monthly_orders(db: Session = Depends(get_db)):
    """
    Monthly order analytics.
    """
    return get_monthly_orders(db)


# =====================================================
# RECENT ORDERS
# =====================================================

@router.get("/recent-orders")
def recent_orders(db: Session = Depends(get_db)):
    """
    Latest orders.
    """
    orders = get_recent_orders(db)

    return {
        "count": len(orders),
        "orders": orders,
    }


# =====================================================
# RECENT TRANSACTIONS
# =====================================================

@router.get("/recent-transactions")
def recent_transactions(db: Session = Depends(get_db)):
    """
    Latest transactions.
    """
    transactions = get_recent_transactions(db)

    return {
        "count": len(transactions),
        "transactions": transactions,
    }


# =====================================================
# LOW STOCK PRODUCTS
# =====================================================

@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db)):
    """
    Products with low stock.
    """
    products = get_low_stock_products(db)

    return {
        "count": len(products),
        "products": products,
    }


# =====================================================
# BEST SELLING PRODUCTS
# =====================================================

@router.get("/best-selling")
def best_selling(db: Session = Depends(get_db)):
    """
    Best selling products.
    """
    products = get_best_selling_products(db)

    return {
        "count": len(products),
        "products": products,
    }