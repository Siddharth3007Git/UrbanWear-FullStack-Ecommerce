from fastapi import HTTPException
from backend.models.transaction import Transaction


def get_transaction_service(db):

    transactions = db.query(Transaction).all()

    return transactions


def create_transaction_service(transaction, db):

    new_transaction = Transaction(
        order_id=transaction.order_id,
        amount=transaction.amount,
        transaction_date=transaction.transaction_date,
        payment_status=transaction.payment_status
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


def update_transaction_service(id, obj, db):

    transaction = db.query(Transaction).filter(Transaction.transaction_id == id).first()

    # ERROR HANDLING - transaction not found
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.order_id = obj.order_id
    transaction.amount = obj.amount
    transaction.transaction_date = obj.transaction_date
    transaction.payment_status = obj.payment_status

    db.commit()
    db.refresh(transaction)

    return transaction
