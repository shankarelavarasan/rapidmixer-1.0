from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
import stripe
import os
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter()
db = firestore.client()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentRequest(BaseModel):
    user_id: str
    payment_intent_id: str
    amount: float
    currency: str = "usd"

class CreatePaymentIntentRequest(BaseModel):
    user_id: str
    amount: float
    currency: str = "usd"
    video_duration: float

@router.post("/payment/create-intent")
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """
    Create Stripe payment intent for video processing
    """
    try:
        # Check user quota first
        user_ref = db.collection("users").document(request.user_id)
        user_doc = user_ref.get()
        
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Check if user gets free first video
        first_video_used = user_data.get("first_video_used", False)
        
        if not first_video_used and request.video_duration <= 30.0:
            # Free first video (30 seconds or less)
            user_ref.set({
                "first_video_used": True,
                "videos_created": user_data.get("videos_created", 0),
                "balance_paid": user_data.get("balance_paid", 0.0),
                "subscription_active": user_data.get("subscription_active", False),
                "created_at": user_data.get("created_at", datetime.utcnow()),
                "updated_at": datetime.utcnow()
            }, merge=True)
            
            return {
                "free_video": True,
                "message": "First 30-second video is free!",
                "user_id": request.user_id
            }
        
        # Calculate cost (minimum $1, then $1 per 30 seconds)
        cost = max(1.0, (request.video_duration / 30.0))
        amount_cents = int(cost * 100)  # Convert to cents for Stripe
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=request.currency,
            metadata={
                "user_id": request.user_id,
                "video_duration": request.video_duration,
                "cost_usd": cost
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": cost,
            "currency": request.currency,
            "video_duration": request.video_duration
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")

@router.post("/payment/verify")
async def verify_payment(request: PaymentRequest):
    """
    Verify Stripe payment and update user quota in Firestore
    """
    try:
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if intent.status != "succeeded":
            raise HTTPException(status_code=400, detail="Payment not successful")
        
        # Verify amount matches
        paid_amount = intent.amount / 100.0  # Convert from cents
        if abs(paid_amount - request.amount) > 0.01:  # Allow 1 cent tolerance
            raise HTTPException(status_code=400, detail="Payment amount mismatch")
        
        # Get user metadata from payment
        user_id = intent.metadata.get("user_id")
        video_duration = float(intent.metadata.get("video_duration", 30.0))
        cost_usd = float(intent.metadata.get("cost_usd", 1.0))
        
        if user_id != request.user_id:
            raise HTTPException(status_code=400, detail="User ID mismatch")
        
        # Update user balance and quota in Firestore
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Update user data
        updated_data = {
            "first_video_used": user_data.get("first_video_used", True),
            "videos_created": user_data.get("videos_created", 0) + 1,
            "balance_paid": user_data.get("balance_paid", 0.0) + cost_usd,
            "subscription_active": user_data.get("subscription_active", False),
            "last_payment_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if not user_doc.exists:
            updated_data["created_at"] = datetime.utcnow()
        
        user_ref.set(updated_data, merge=True)
        
        # Record payment transaction
        transaction_ref = db.collection("transactions").document()
        transaction_ref.set({
            "user_id": user_id,
            "payment_intent_id": request.payment_intent_id,
            "amount": cost_usd,
            "currency": request.currency,
            "video_duration": video_duration,
            "status": "completed",
            "created_at": datetime.utcnow(),
            "stripe_data": {
                "payment_method": intent.payment_method,
                "receipt_email": intent.receipt_email
            }
        })
        
        return {
            "status": "success",
            "user_id": user_id,
            "amount_paid": cost_usd,
            "new_balance": updated_data["balance_paid"],
            "videos_created": updated_data["videos_created"],
            "transaction_id": transaction_ref.id,
            "message": "Payment verified and quota updated successfully"
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@router.get("/payment/quota/{user_id}")
async def get_user_quota(user_id: str):
    """
    Get user's current quota and payment status
    """
    try:
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            # New user - eligible for free first video
            return {
                "user_id": user_id,
                "first_video_used": False,
                "videos_created": 0,
                "balance_paid": 0.0,
                "subscription_active": False,
                "can_create_free_video": True,
                "message": "New user - first 30-second video is free!"
            }
        
        user_data = user_doc.to_dict()
        
        first_video_used = user_data.get("first_video_used", False)
        balance_paid = user_data.get("balance_paid", 0.0)
        subscription_active = user_data.get("subscription_active", False)
        
        # Determine if user can create a free video
        can_create_free_video = not first_video_used
        
        # Determine if user can create paid video
        can_create_paid_video = subscription_active or balance_paid > 0
        
        return {
            "user_id": user_id,
            "first_video_used": first_video_used,
            "videos_created": user_data.get("videos_created", 0),
            "balance_paid": balance_paid,
            "subscription_active": subscription_active,
            "can_create_free_video": can_create_free_video,
            "can_create_paid_video": can_create_paid_video,
            "last_payment_at": user_data.get("last_payment_at"),
            "created_at": user_data.get("created_at"),
            "updated_at": user_data.get("updated_at")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quota check failed: {str(e)}")

@router.get("/payment/transactions/{user_id}")
async def get_user_transactions(user_id: str, limit: int = 10):
    """
    Get user's payment transaction history
    """
    try:
        transactions_ref = db.collection("transactions")
        query = transactions_ref.where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
        
        transactions = []
        for doc in query.stream():
            transaction_data = doc.to_dict()
            transaction_data["id"] = doc.id
            transactions.append(transaction_data)
        
        return {
            "user_id": user_id,
            "transactions": transactions,
            "total_transactions": len(transactions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transaction history retrieval failed: {str(e)}")

@router.post("/payment/webhook")
async def stripe_webhook(request: Dict[str, Any]):
    """
    Handle Stripe webhooks for payment events
    """
    try:
        # Verify webhook signature (implement in production)
        event_type = request.get("type")
        
        if event_type == "payment_intent.succeeded":
            payment_intent = request["data"]["object"]
            
            # Log successful payment
            webhook_ref = db.collection("webhook_logs").document()
            webhook_ref.set({
                "event_type": event_type,
                "payment_intent_id": payment_intent["id"],
                "amount": payment_intent["amount"] / 100.0,
                "currency": payment_intent["currency"],
                "user_id": payment_intent["metadata"].get("user_id"),
                "processed_at": datetime.utcnow()
            })
        
        elif event_type == "payment_intent.payment_failed":
            payment_intent = request["data"]["object"]
            
            # Log failed payment
            webhook_ref = db.collection("webhook_logs").document()
            webhook_ref.set({
                "event_type": event_type,
                "payment_intent_id": payment_intent["id"],
                "user_id": payment_intent["metadata"].get("user_id"),
                "failure_reason": payment_intent.get("last_payment_error", {}).get("message"),
                "processed_at": datetime.utcnow()
            })
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")