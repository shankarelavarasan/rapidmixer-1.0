import os
import asyncio
import subprocess
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import json
import tempfile
from datetime import datetime

import ffmpeg
from moviepy.editor import VideoFileClip
from PIL import Image
import cv2
import numpy as np

from ..config import settings
from ..models.job import Job, ProcessingStage, update_job_progress

class VideoProcessor:
    """Service for video processing operations"""
    
    def __init__(self):
        self.ffmpeg_path = settings.FFMPEG_PATH
        self.ffprobe_path = settings.FFPROBE_PATH
        self.scene_duration = settings.SCENE_DURATION
        self.temp_dir = tempfile.mkdtemp(prefix="rapid_video_")
    
    async def analyze_video(self, file_path: str) -> Dict:
        """Analyze video file and extract metadata"""
        try:
            # Use ffprobe to get video information
            probe = ffmpeg.probe(file_path)
            video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
            audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            
            if not video_stream:
                raise ValueError("No video stream found in file")
            
            # Extract video metadata
            duration = float(video_stream.get('duration', 0))
            width = int(video_stream.get('width', 0))
            height = int(video_stream.get('height', 0))
            fps = eval(video_stream.get('r_frame_rate', '30/1'))
            
            # Check duration limit
            if duration > settings.MAX_VIDEO_DURATION:
                raise ValueError(f"Video duration ({duration:.1f}s) exceeds maximum allowed ({settings.MAX_VIDEO_DURATION}s)")
            
            return {
                'duration': duration,
                'width': width,
                'height': height,
                'fps': fps,
                'resolution': f"{width}x{height}",
                'has_audio': audio_stream is not None,
                'file_size': os.path.getsize(file_path),
                'format': probe['format']['format_name']
            }
            
        except Exception as e:
            raise Exception(f"Failed to analyze video: {str(e)}")
    
    async def split_into_scenes(self, job: Job, progress_callback=None) -> List[str]:
        """Split video into scenes based on duration"""
        try:
            # Update job progress
            job = update_job_progress(job, ProcessingStage.SPLITTING, 0.1)
            if progress_callback:
                await progress_callback(job)
            
            # Analyze video first
            video_info = await self.analyze_video(job.file_path)
            duration = video_info['duration']
            
            # Calculate number of scenes
            scene_count = int(np.ceil(duration / self.scene_duration))
            scene_paths = []
            
            # Create output directory for scenes
            scenes_dir = os.path.join(self.temp_dir, f"scenes_{job.id}")
            os.makedirs(scenes_dir, exist_ok=True)
            
            # Split video into scenes
            for i in range(scene_count):
                start_time = i * self.scene_duration
                end_time = min((i + 1) * self.scene_duration, duration)
                
                scene_filename = f"scene_{i+1:03d}.mp4"
                scene_path = os.path.join(scenes_dir, scene_filename)
                
                # Use ffmpeg to extract scene
                (
                    ffmpeg
                    .input(job.file_path, ss=start_time, t=end_time - start_time)
                    .output(
                        scene_path,
                        vcodec='libx264',
                        acodec='aac',
                        preset='fast',
                        crf=23
                    )
                    .overwrite_output()
                    .run(quiet=True)
                )
                
                scene_paths.append(scene_path)
                
                # Update progress
                progress = 0.1 + (0.8 * (i + 1) / scene_count)
                job = update_job_progress(job, ProcessingStage.SPLITTING, progress)
                if progress_callback:
                    await progress_callback(job)
            
            # Update job with scene information
            job = update_job_progress(
                job, 
                ProcessingStage.SPLITTING, 
                0.9,
                scene_count=scene_count,
                scene_urls=scene_paths
            )
            if progress_callback:
                await progress_callback(job)
            
            return scene_paths
            
        except Exception as e:
            raise Exception(f"Failed to split video into scenes: {str(e)}")
    
    async def extract_keyframes(self, scene_path: str, num_frames: int = 3) -> List[str]:
        """Extract keyframes from a scene for AI analysis"""
        try:
            # Get scene duration
            probe = ffmpeg.probe(scene_path)
            duration = float(probe['streams'][0]['duration'])
            
            keyframe_paths = []
            scene_dir = os.path.dirname(scene_path)
            scene_name = os.path.splitext(os.path.basename(scene_path))[0]
            
            # Extract frames at regular intervals
            for i in range(num_frames):
                timestamp = (duration / (num_frames + 1)) * (i + 1)
                frame_filename = f"{scene_name}_frame_{i+1}.jpg"
                frame_path = os.path.join(scene_dir, frame_filename)
                
                (
                    ffmpeg
                    .input(scene_path, ss=timestamp)
                    .output(frame_path, vframes=1, format='image2', vcodec='mjpeg')
                    .overwrite_output()
                    .run(quiet=True)
                )
                
                keyframe_paths.append(frame_path)
            
            return keyframe_paths
            
        except Exception as e:
            raise Exception(f"Failed to extract keyframes: {str(e)}")
    
    async def analyze_scene_content(self, scene_path: str) -> Dict:
        """Analyze scene content for AI processing"""
        try:
            # Extract keyframes
            keyframes = await self.extract_keyframes(scene_path)
            
            # Analyze video properties
            probe = ffmpeg.probe(scene_path)
            video_stream = probe['streams'][0]
            
            # Basic scene analysis
            scene_info = {
                'duration': float(video_stream.get('duration', 0)),
                'fps': eval(video_stream.get('r_frame_rate', '30/1')),
                'resolution': f"{video_stream.get('width')}x{video_stream.get('height')}",
                'keyframes': keyframes,
                'has_motion': await self._detect_motion(scene_path),
                'brightness': await self._analyze_brightness(keyframes[0] if keyframes else None),
                'dominant_colors': await self._extract_dominant_colors(keyframes[0] if keyframes else None)
            }
            
            return scene_info
            
        except Exception as e:
            raise Exception(f"Failed to analyze scene content: {str(e)}")
    
    async def _detect_motion(self, video_path: str) -> bool:
        """Detect if there's significant motion in the video"""
        try:
            cap = cv2.VideoCapture(video_path)
            
            # Read first frame
            ret, frame1 = cap.read()
            if not ret:
                return False
            
            # Convert to grayscale
            gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
            
            motion_detected = False
            frame_count = 0
            motion_threshold = 1000  # Adjust based on sensitivity needed
            
            while frame_count < 30:  # Check first 30 frames
                ret, frame2 = cap.read()
                if not ret:
                    break
                
                gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
                
                # Calculate frame difference
                diff = cv2.absdiff(gray1, gray2)
                motion_score = np.sum(diff)
                
                if motion_score > motion_threshold:
                    motion_detected = True
                    break
                
                gray1 = gray2
                frame_count += 1
            
            cap.release()
            return motion_detected
            
        except Exception:
            return True  # Assume motion if detection fails
    
    async def _analyze_brightness(self, image_path: Optional[str]) -> float:
        """Analyze average brightness of an image"""
        if not image_path or not os.path.exists(image_path):
            return 0.5  # Default brightness
        
        try:
            image = Image.open(image_path)
            # Convert to grayscale and calculate mean
            grayscale = image.convert('L')
            brightness = np.array(grayscale).mean() / 255.0
            return brightness
        except Exception:
            return 0.5
    
    async def _extract_dominant_colors(self, image_path: Optional[str], num_colors: int = 3) -> List[str]:
        """Extract dominant colors from an image"""
        if not image_path or not os.path.exists(image_path):
            return ['#808080']  # Default gray
        
        try:
            image = Image.open(image_path)
            image = image.convert('RGB')
            
            # Resize for faster processing
            image = image.resize((150, 150))
            
            # Convert to numpy array
            data = np.array(image)
            data = data.reshape((-1, 3))
            
            # Use k-means clustering to find dominant colors
            from sklearn.cluster import KMeans
            
            kmeans = KMeans(n_clusters=num_colors, random_state=42, n_init=10)
            kmeans.fit(data)
            
            # Convert colors to hex
            colors = []
            for color in kmeans.cluster_centers_:
                hex_color = '#{:02x}{:02x}{:02x}'.format(
                    int(color[0]), int(color[1]), int(color[2])
                )
                colors.append(hex_color)
            
            return colors
            
        except Exception:
            return ['#808080', '#606060', '#404040']  # Default colors
    
    async def merge_scenes(self, scene_paths: List[str], output_path: str, audio_path: Optional[str] = None) -> str:
        """Merge processed scenes into final video"""
        try:
            # Create a temporary file list for ffmpeg
            file_list_path = os.path.join(self.temp_dir, f"file_list_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
            
            with open(file_list_path, 'w') as f:
                for scene_path in scene_paths:
                    f.write(f"file '{scene_path}'\n")
            
            # Merge videos using ffmpeg
            input_args = {'f': 'concat', 'safe': 0}
            output_args = {
                'vcodec': settings.OUTPUT_VIDEO_CODEC,
                'b:v': settings.OUTPUT_VIDEO_BITRATE,
                'preset': 'medium',
                'crf': 23
            }
            
            # Add audio if provided
            if audio_path and os.path.exists(audio_path):
                output_args.update({
                    'acodec': settings.OUTPUT_AUDIO_CODEC,
                    'b:a': settings.OUTPUT_AUDIO_BITRATE
                })
            
            (
                ffmpeg
                .input(file_list_path, **input_args)
                .output(output_path, **output_args)
                .overwrite_output()
                .run(quiet=True)
            )
            
            # Clean up temporary file list
            os.remove(file_list_path)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Failed to merge scenes: {str(e)}")
    
    def cleanup_temp_files(self, job_id: str):
        """Clean up temporary files for a job"""
        try:
            scenes_dir = os.path.join(self.temp_dir, f"scenes_{job_id}")
            if os.path.exists(scenes_dir):
                import shutil
                shutil.rmtree(scenes_dir)
        except Exception as e:
            print(f"Warning: Failed to cleanup temp files for job {job_id}: {e}")
    
    def get_video_thumbnail(self, video_path: str, output_path: str, timestamp: float = 1.0) -> str:
        """Generate a thumbnail from video at specified timestamp"""
        try:
            (
                ffmpeg
                .input(video_path, ss=timestamp)
                .output(output_path, vframes=1, format='image2', vcodec='mjpeg')
                .overwrite_output()
                .run(quiet=True)
            )
            return output_path
        except Exception as e:
            raise Exception(f"Failed to generate thumbnail: {str(e)}")

# Global video processor instance
video_processor = VideoProcessor()