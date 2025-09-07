from fastapi import APIRouter, HTTPException
from firebase_admin import firestore, storage
import subprocess
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Dict
import json

router = APIRouter()
db = firestore.client()

@router.post("/merge")
async def merge_3d_scenes(job_id: str):
    """
    Merge all 3D scenes into final video with audio sync
    """
    try:
        # Get job from Firestore
        job_ref = db.collection("jobs").document(job_id)
        job_doc = job_ref.get()
        
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_data = job_doc.to_dict()
        
        if job_data.get("stage") != "ai_conversion_complete":
            raise HTTPException(status_code=400, detail="AI conversion must be completed first")
        
        scenes = job_data.get("scenes", [])
        completed_scenes = [s for s in scenes if s.get("ai_status") == "completed"]
        
        if not completed_scenes:
            raise HTTPException(status_code=400, detail="No completed scenes found for merging")
        
        # Update status
        job_ref.update({
            "stage": "merging",
            "progress": 75.0,
            "updated_at": datetime.utcnow()
        })
        
        # Create final output directory
        output_dir = f"temp/{job_id}/final"
        os.makedirs(output_dir, exist_ok=True)
        
        # Step 1: Merge video scenes
        merged_video = await merge_video_scenes(job_id, completed_scenes, output_dir)
        
        # Step 2: Extract and enhance original audio
        enhanced_audio = await process_original_audio(job_id, job_data, output_dir)
        
        # Step 3: Generate background music and effects
        background_audio = await generate_background_audio(job_id, completed_scenes, output_dir)
        
        # Step 4: Mix all audio tracks
        final_audio = await mix_audio_tracks(enhanced_audio, background_audio, output_dir)
        
        # Step 5: Combine video and audio
        final_video = await combine_video_audio(merged_video, final_audio, output_dir)
        
        # Step 6: Upload to Google Cloud Storage
        download_url = await upload_to_gcs(job_id, final_video)
        
        # Update job with final results
        job_ref.update({
            "status": "completed",
            "stage": "completed",
            "progress": 100.0,
            "final_video_path": final_video,
            "download_url": download_url,
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        return {
            "job_id": job_id,
            "download_url": download_url,
            "final_video_path": final_video,
            "total_scenes_merged": len(completed_scenes),
            "message": "Video processing completed successfully!"
        }
        
    except Exception as e:
        # Update job with error
        job_ref.update({
            "status": "error",
            "error_message": str(e),
            "updated_at": datetime.utcnow()
        })
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")

async def merge_video_scenes(job_id: str, scenes: List[Dict], output_dir: str) -> str:
    """
    Merge all 3D video scenes into one continuous video
    """
    try:
        # Create file list for ffmpeg concat
        concat_file = f"{output_dir}/concat_list.txt"
        
        with open(concat_file, 'w') as f:
            for scene in sorted(scenes, key=lambda x: x.get("start_time", 0)):
                output_file = scene.get("output_file")
                if output_file and os.path.exists(output_file):
                    f.write(f"file '{os.path.abspath(output_file)}'\n")
        
        # Output merged video
        merged_video = f"{output_dir}/merged_3d_video.mp4"
        
        # FFmpeg command to concatenate videos
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-y',
            merged_video
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Video merge failed: {result.stderr}")
        
        return merged_video
        
    except Exception as e:
        raise Exception(f"Video merging failed: {str(e)}")

async def process_original_audio(job_id: str, job_data: Dict, output_dir: str) -> str:
    """
    Extract and enhance original audio from the uploaded video
    """
    try:
        original_video = job_data.get("temp_file_path")
        enhanced_audio = f"{output_dir}/enhanced_audio.wav"
        
        # Extract audio with noise reduction and enhancement
        cmd = [
            'ffmpeg',
            '-i', original_video,
            '-vn',  # No video
            '-acodec', 'pcm_s16le',
            '-ar', '44100',
            '-ac', '2',
            '-af', 'highpass=f=80,lowpass=f=8000,volume=1.2',  # Audio filters
            '-y',
            enhanced_audio
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Audio extraction failed: {result.stderr}")
        
        return enhanced_audio
        
    except Exception as e:
        raise Exception(f"Audio processing failed: {str(e)}")

async def generate_background_audio(job_id: str, scenes: List[Dict], output_dir: str) -> str:
    """
    Generate background music and sound effects based on scene analysis
    """
    try:
        # Analyze scenes to determine appropriate background music
        scene_types = [s.get("scene_analysis", {}).get("scene_type", "general") for s in scenes]
        dominant_type = max(set(scene_types), key=scene_types.count)
        
        # Generate background audio based on scene type
        background_audio = f"{output_dir}/background_audio.wav"
        
        # For now, create a simple ambient background
        # In production, this would call AI music generation APIs
        duration = sum([s.get("duration", 8.0) for s in scenes])
        
        # Generate simple ambient tone (replace with AI-generated music)
        cmd = [
            'ffmpeg',
            '-f', 'lavfi',
            '-i', f'sine=frequency=220:duration={duration}',
            '-af', 'volume=0.1',
            '-y',
            background_audio
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Background audio generation failed: {result.stderr}")
        
        return background_audio
        
    except Exception as e:
        raise Exception(f"Background audio generation failed: {str(e)}")

async def mix_audio_tracks(enhanced_audio: str, background_audio: str, output_dir: str) -> str:
    """
    Mix original enhanced audio with background music
    """
    try:
        mixed_audio = f"{output_dir}/final_audio.wav"
        
        # Mix audio tracks with proper levels
        cmd = [
            'ffmpeg',
            '-i', enhanced_audio,
            '-i', background_audio,
            '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2[out]',
            '-map', '[out]',
            '-y',
            mixed_audio
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Audio mixing failed: {result.stderr}")
        
        return mixed_audio
        
    except Exception as e:
        raise Exception(f"Audio mixing failed: {str(e)}")

async def combine_video_audio(video_file: str, audio_file: str, output_dir: str) -> str:
    """
    Combine final video with mixed audio
    """
    try:
        final_video = f"{output_dir}/final_3d_video.mp4"
        
        # Combine video and audio
        cmd = [
            'ffmpeg',
            '-i', video_file,
            '-i', audio_file,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-y',
            final_video
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Video-audio combination failed: {result.stderr}")
        
        return final_video
        
    except Exception as e:
        raise Exception(f"Video-audio combination failed: {str(e)}")

async def upload_to_gcs(job_id: str, video_file: str) -> str:
    """
    Upload final video to Google Cloud Storage and return signed URL
    """
    try:
        # Initialize GCS client
        bucket_name = os.getenv("GCS_BUCKET_NAME", "rapid-video-storage")
        
        # Generate unique filename
        filename = f"final_videos/{job_id}/final_3d_video_{uuid.uuid4().hex[:8]}.mp4"
        
        # For now, return a mock URL (implement actual GCS upload)
        # In production, upload to GCS and generate signed URL
        
        # Mock signed URL (valid for 24 hours)
        signed_url = f"https://storage.googleapis.com/{bucket_name}/{filename}?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=...&X-Goog-Date=...&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&X-Goog-Signature=..."
        
        return signed_url
        
    except Exception as e:
        raise Exception(f"GCS upload failed: {str(e)}")

@router.get("/merge/status/{job_id}")
async def get_merge_status(job_id: str):
    """
    Get merge status
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
            "download_url": job_data.get("download_url"),
            "completed_at": job_data.get("completed_at"),
            "error_message": job_data.get("error_message")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@router.get("/download/{job_id}")
async def get_download_url(job_id: str):
    """
    Get download URL for completed video
    """
    try:
        job_ref = db.collection("jobs").document(job_id)
        job_doc = job_ref.get()
        
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_data = job_doc.to_dict()
        
        if job_data.get("status") != "completed":
            raise HTTPException(status_code=400, detail="Video processing not completed yet")
        
        download_url = job_data.get("download_url")
        if not download_url:
            raise HTTPException(status_code=404, detail="Download URL not available")
        
        return {
            "job_id": job_id,
            "download_url": download_url,
            "expires_at": datetime.utcnow() + timedelta(hours=24)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download URL retrieval failed: {str(e)}")