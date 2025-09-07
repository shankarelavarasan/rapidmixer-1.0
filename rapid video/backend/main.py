from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from typing import Optional
import uvicorn

# Import API routes
from api.upload import router as upload_router
from api.scene_split import router as scene_split_router
from api.ai_conversion import router as ai_conversion_router
from api.merge import router as merge_router
from api.payment import router as payment_router

# Initialize Firebase Admin
if not firebase_admin._apps:
    # Use service account key or default credentials
    try:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
    except:
        # Fallback to default credentials for production
        firebase_admin.initialize_app()

app = FastAPI(
    title="Rapid Video API",
    description="AI-Powered 3D Animation Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Dependency to verify Firebase token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# Include API routes
app.include_router(upload_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(scene_split_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(ai_conversion_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(merge_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(payment_router, prefix="/api", dependencies=[Depends(verify_token)])



@app.get("/")
async def root():
    return {"message": "Rapid Video API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)