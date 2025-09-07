from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
import subprocess
import os
import json
from datetime import datetime
from typing import List, Dict

router = APIRouter()
db = firestore.client()

@router.post("/scene-split")
async def split_video_scenes(job_id: str):
    """
    Split video into 8-second chunks for AI processing
    """
    try:
        # Get job from Firestore
        job_ref = db.collection("jobs").document(job_id)
        job_doc = job_ref.get()
        
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_data = job_doc.to_dict()
        
        if job_data.get("status") != "uploaded":
            raise HTTPException(status_code=400, detail="Video must be uploaded first")
        
        # Update status
        job_ref.update({
            "status": "processing",
            "stage": "scene_splitting",
            "progress": 10.0,
            "updated_at": datetime.utcnow()
        })
        
        input_file = job_data.get("temp_file_path")
        duration = job_data.get("duration", 30.0)
        
        # Create output directory for scenes
        scenes_dir = f"temp/{job_id}/scenes"
        os.makedirs(scenes_dir, exist_ok=True)
        
        # Split video into 8-second chunks
        scenes = await split_video_into_chunks(input_file, scenes_dir, duration)
        
        # Update job with scene information
        job_ref.update({
            "scenes": scenes,
            "total_scenes": len(scenes),
            "stage": "scene_split_complete",
            "progress": 25.0,
            "updated_at": datetime.utcnow()
        })
        
        return {
            "job_id": job_id,
            "total_scenes": len(scenes),
            "scenes": scenes,
            "message": "Video successfully split into scenes"
        }
        
    except Exception as e:
        # Update job with error
        job_ref.update({
            "status": "error",
            "error_message": str(e),
            "updated_at": datetime.utcnow()
        })
        raise HTTPException(status_code=500, detail=f"Scene splitting failed: {str(e)}")

async def split_video_into_chunks(input_file: str, output_dir: str, duration: float) -> List[Dict]:
    """
    Split video into 8-second chunks using ffmpeg
    """
    chunk_duration = 8.0  # 8 seconds per chunk
    scenes = []
    
    try:
        # Calculate number of chunks
        num_chunks = int(duration / chunk_duration) + (1 if duration % chunk_duration > 0 else 0)
        
        for i in range(num_chunks):
            start_time = i * chunk_duration
            output_file = f"{output_dir}/scene_{i:03d}.mp4"
            
            # FFmpeg command to extract chunk
            cmd = [
                'ffmpeg',
                '-i', input_file,
                '-ss', str(start_time),
                '-t', str(chunk_duration),
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-y',  # Overwrite output files
                output_file
            ]
            
            # Run ffmpeg
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Get actual duration of the chunk
                actual_duration = await get_chunk_duration(output_file)
                
                scene_info = {
                    "scene_id": f"scene_{i:03d}",
                    "file_path": output_file,
                    "start_time": start_time,
                    "duration": actual_duration,
                    "status": "ready_for_ai",
                    "ai_status": "pending"
                }
                
                scenes.append(scene_info)
            else:
                raise Exception(f"FFmpeg failed for chunk {i}: {result.stderr}")
        
        return scenes
        
    except Exception as e:
        raise Exception(f"Video splitting failed: {str(e)}")

async def get_chunk_duration(file_path: str) -> float:
    """
    Get actual duration of a video chunk
    """
    try:
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
            return float(data['format']['duration'])
        else:
            return 8.0  # Default fallback
            
    except Exception:
        return 8.0  # Default fallback

@router.get("/scene-split/status/{job_id}")
async def get_scene_split_status(job_id: str):
    """
    Get scene splitting status
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
            "total_scenes": job_data.get("total_scenes", 0),
            "scenes": job_data.get("scenes", []),
            "error_message": job_data.get("error_message")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")