from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from firebase_admin import firestore, storage
import uuid
import os
from datetime import datetime
from typing import Dict, Any
import aiofiles

router = APIRouter()

# Initialize Firestore
db = firestore.client()

@router.post("/upload")
async def upload_video(
    video: UploadFile = File(...),
    user_data: Dict[str, Any] = Depends(lambda: {})
):
    """
    Upload video to Google Cloud Storage and create processing job
    """
    try:
        # Validate file type
        if not video.content_type or not video.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload a video file.")
        
        # Check file size (max 3 minutes ~ 100MB)
        max_size = 100 * 1024 * 1024  # 100MB
        if video.size and video.size > max_size:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 100MB (3 minutes).")
        
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Create temp directory
        temp_dir = f"temp/{job_id}"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save file temporarily
        temp_file_path = f"{temp_dir}/{video.filename}"
        async with aiofiles.open(temp_file_path, 'wb') as f:
            content = await video.read()
            await f.write(content)
        
        # Get video duration (you'll need ffmpeg for this)
        duration = await get_video_duration(temp_file_path)
        
        # Calculate cost based on duration (30 seconds = $1)
        cost = max(1.0, (duration / 30.0))  # Minimum $1
        
        # Create job document in Firestore
        job_data = {
            "id": job_id,
            "filename": video.filename,
            "file_size": video.size,
            "duration": duration,
            "cost": cost,
            "status": "uploaded",
            "stage": "uploaded",
            "progress": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "user_id": user_data.get("uid", "anonymous"),
            "temp_file_path": temp_file_path
        }
        
        # Save to Firestore
        db.collection("jobs").document(job_id).set(job_data)
        
        return {
            "job_id": job_id,
            "filename": video.filename,
            "duration": duration,
            "cost": cost,
            "message": "Video uploaded successfully. Ready for processing."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/upload/status/{job_id}")
async def get_upload_status(job_id: str):
    """
    Get upload and processing status
    """
    try:
        job_ref = db.collection("jobs").document(job_id)
        job_doc = job_ref.get()
        
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_data = job_doc.to_dict()
        
        return {
            "job_id": job_id,
            "status": job_data.get("status"),
            "stage": job_data.get("stage"),
            "progress": job_data.get("progress", 0.0),
            "created_at": job_data.get("created_at"),
            "updated_at": job_data.get("updated_at"),
            "error_message": job_data.get("error_message"),
            "download_url": job_data.get("download_url")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

async def get_video_duration(file_path: str) -> float:
    """
    Get video duration using ffmpeg
    """
    try:
        import subprocess
        import json
        
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            file_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            duration = float(data['format']['duration'])
            return duration
        else:
            # Fallback duration if ffprobe fails
            return 30.0
            
    except Exception:
        # Default to 30 seconds if duration detection fails
        return 30.0