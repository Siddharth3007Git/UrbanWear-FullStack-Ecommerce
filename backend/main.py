from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# ---------------- API Routers ---------------- #

from backend.routers.product_routes import router as product_router
from backend.routers.customer_routes import router as customer_router
from backend.routers.order_routes import router as order_router
from backend.routers.transaction_routes import router as transaction_router
from backend.routers.auth_routes import router as auth_router
from backend.routers.cart_routes import router as cart_router

# ---------------- FastAPI App ---------------- #

app = FastAPI(
    title="UrbanWear API",
    description="UrbanWear E-Commerce Backend",
    version="1.0.0"
)

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Static Files ---------------- #

app.mount(
    "/static",
    StaticFiles(directory="frontend/static"),
    name="static"
)

# ---------------- Templates ---------------- #

templates = Jinja2Templates(directory="frontend/templates")

# ---------------- API Routers ---------------- #

app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)
app.include_router(transaction_router)
app.include_router(auth_router)
app.include_router(cart_router)

# =====================================================
#                   WEBSITE ROUTES
# =====================================================

@app.get("/", include_in_schema=False)
def root(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="home.html"
    )


@app.get("/home", include_in_schema=False)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="home.html"
    )


@app.get("/products-page", include_in_schema=False)
def products_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="products.html"
    )


@app.get("/product-details", include_in_schema=False)
def product_details(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="product_details.html"
    )


@app.get("/login-page", include_in_schema=False)
def login_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="login.html"
    )


@app.get("/register-page", include_in_schema=False)
def register_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="register.html"
    )


@app.get("/cart-page", include_in_schema=False)
def cart_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="cart.html"
    )


@app.get("/checkout-page", include_in_schema=False)
def checkout_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="checkout.html"
    )

# =====================================================
#      Compatibility Routes (Old Frontend Support)
# =====================================================

@app.get("/home.html", include_in_schema=False)
def home_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="home.html"
    )


@app.get("/products.html", include_in_schema=False)
def products_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="products.html"
    )


@app.get("/product_details.html", include_in_schema=False)
def product_details_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="product_details.html"
    )


@app.get("/login.html", include_in_schema=False)
def login_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="login.html"
    )


@app.get("/register.html", include_in_schema=False)
def register_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="register.html"
    )


@app.get("/cart.html", include_in_schema=False)
def cart_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="cart.html"
    )


@app.get("/checkout.html", include_in_schema=False)
def checkout_html(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="checkout.html"
    )