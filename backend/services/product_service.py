from fastapi import HTTPException
from backend.models.product import Product


def get_product_service(db, category=None, name=None, min_price=None, max_price=None, page=1, limit=10):

    query = db.query(Product)

    # filter by category
    if category:
        query = query.filter(Product.category == category)

    # filter by name (search)
    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))

    # filter by min price
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    # filter by max price
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # pagination
    total = query.count()                   # total products found
    skip = (page - 1) * limit              # how many to skip
    products = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": products
    }


def create_product_service(product, db):

    new_product = Product(
        name=product.name,
        price=product.price,
        category=product.category,
        stock=product.stock,
        image=product.image
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


def update_product_service(id, obj, db):

    product = db.query(Product).filter(Product.id == id).first()

    # ERROR HANDLING - product not found
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = obj.name
    product.price = obj.price
    product.category = obj.category
    product.stock = obj.stock
    product.image = obj.image

    db.commit()
    db.refresh(product)

    return product


def delete_product_service(id, db):

    product = db.query(Product).filter(Product.id == id).first()

    # ERROR HANDLING - product not found
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
