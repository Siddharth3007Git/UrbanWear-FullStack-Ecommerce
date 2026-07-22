from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_customers: int
    total_products: int
    total_orders: int
    total_transactions: int

    total_revenue: float

    pending_orders: int
    cancelled_orders: int

    low_stock_products: int