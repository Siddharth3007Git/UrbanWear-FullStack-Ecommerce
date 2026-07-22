from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    BackgroundTasks
)

from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.auth.auth_bearer import get_current_user

from backend.services.order_service import (
    place_order_service,
    get_my_orders_service,
    get_order_by_id_service,
    cancel_order_service,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

# ======================================================
# Place Order
# ======================================================

@router.post("/")
def place_order(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return place_order_service(

            db=db,

            user_id=current_user.id,

            background_tasks=background_tasks

        )

    except ValueError as e:

        raise HTTPException(

            status_code=400,

            detail=str(e)

        )


# ======================================================
# Get My Orders
# ======================================================

@router.get("/")
def get_my_orders(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    try:

        return get_my_orders_service(

            db=db,

            user_id=current_user.id

        )

    except ValueError as e:

        raise HTTPException(

            status_code=404,

            detail=str(e)

        )
    
# ======================================================
# Get Order By ID
# ======================================================

@router.get("/{order_id}")
def get_order_by_id(

    order_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    try:

        return get_order_by_id_service(

            db=db,

            user_id=current_user.id,

            order_id=order_id

        )

    except ValueError as e:

        raise HTTPException(

            status_code=404,

            detail=str(e)

        )


# ======================================================
# Cancel Order
# ======================================================

@router.put("/{order_id}/cancel")
def cancel_order(

    order_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    try:

        return cancel_order_service(

            db=db,

            user_id=current_user.id,

            order_id=order_id

        )

    except ValueError as e:

        raise HTTPException(

            status_code=400,

            detail=str(e)

        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )