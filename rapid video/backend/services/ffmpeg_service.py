import subprocess
import os
import json
from typing import Dict, List, Optional
import asyncio
from datetime import datetime

class FFmpegService:
    """
    Service for handling video processing with FFmpeg
    """
    
    def __init__(self):
        self.ffmpeg_path = self._find_ffmpeg()
        self.ffprobe_path = self._find_ffprobe()
    
    def _find_ffmpeg(self) -> str:
        """Find FFmpeg executable"""
        try:
            result = subprocess.run(['where', 'ffmpeg'], capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                return 'ffmpeg'
        except:
            pass
        
        # Common installation paths
        common_paths = [
            'ffmpeg',
            'C:\\ffmpeg\\bin\\ffmpeg.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
            '/usr/bin/ffmpeg',
            '/usr/local/bin/ffmpeg'
        ]
        
        for path in common_paths:
            try:
                subprocess.run([path, '-version'], capture_output=True, check=True)
                return path
            except:
                continue
        
        raise Exception("FFmpeg not found. Please install FFmpeg.")
    
    def _find_ffprobe(self) -> str:
        """Find FFprobe executable"""
        try:
            result = subprocess.run(['where', 'ffprobe'], capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                return 'ffprobe'
        except:
            pass
        
        # Common installation paths
        common_paths = [
            'ffprobe',
            'C:\\ffmpeg\\bin\\ffprobe.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
            '/usr/bin/ffprobe',
            '/usr/local/bin/ffprobe'
        ]
        
        for path in common_paths:
            try:
                subprocess.run([path, '-version'], capture_output=True, check=True)
                return path
            except:
                continue
        
        raise Exception("FFprobe not found. Please install FFmpeg.")
    
    async def get_video_info(self, video_path: str) -> Dict:
        """
        Get comprehensive video information
        """
        try:
            cmd = [
                self.ffprobe_path,
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"FFprobe failed: {result.stderr}")
            
            data = json.loads(result.stdout)
            
            # Extract video stream info
            video_stream = None
            audio_stream = None
            
            for stream in data.get('streams', []):
                if stream.get('codec_type') == 'video' and not video_stream:
                    video_stream = stream
                elif stream.get('codec_type') == 'audio' and not audio_stream:
                    audio_stream = stream
            
            format_info = data.get('format', {})
            
            return {
                'duration': float(format_info.get('duration', 0)),
                'size': int(format_info.get('size', 0)),
                'bitrate': int(format_info.get('bit_rate', 0)),
                'format_name': format_info.get('format_name', ''),
                'video': {
                    'codec': video_stream.get('codec_name', '') if video_stream else '',
                    'width': int(video_stream.get('width', 0)) if video_stream else 0,
                    'height': int(video_stream.get('height', 0)) if video_stream else 0,
                    'fps': eval(video_stream.get('r_frame_rate', '0/1')) if video_stream else 0,
                    'bitrate': int(video_stream.get('bit_rate', 0)) if video_stream else 0
                },
                'audio': {
                    'codec': audio_stream.get('codec_name', '') if audio_stream else '',
                    'sample_rate': int(audio_stream.get('sample_rate', 0)) if audio_stream else 0,
                    'channels': int(audio_stream.get('channels', 0)) if audio_stream else 0,
                    'bitrate': int(audio_stream.get('bit_rate', 0)) if audio_stream else 0
                } if audio_stream else None
            }
            
        except Exception as e:
            raise Exception(f"Failed to get video info: {str(e)}")
    
    async def split_video(self, input_path: str, output_dir: str, segment_duration: float = 8.0) -> List[Dict]:
        """
        Split video into segments
        """
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            # Get video duration first
            video_info = await self.get_video_info(input_path)
            total_duration = video_info['duration']
            
            segments = []
            segment_count = 0
            
            current_time = 0.0
            while current_time < total_duration:
                segment_duration_actual = min(segment_duration, total_duration - current_time)
                output_file = os.path.join(output_dir, f"segment_{segment_count:03d}.mp4")
                
                cmd = [
                    self.ffmpeg_path,
                    '-i', input_path,
                    '-ss', str(current_time),
                    '-t', str(segment_duration_actual),
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    '-preset', 'fast',
                    '-crf', '23',
                    '-y',
                    output_file
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode != 0:
                    raise Exception(f"Segment {segment_count} failed: {result.stderr}")
                
                # Verify segment was created
                if os.path.exists(output_file):
                    segment_info = await self.get_video_info(output_file)
                    
                    segments.append({
                        'index': segment_count,
                        'file_path': output_file,
                        'start_time': current_time,
                        'duration': segment_info['duration'],
                        'size': segment_info['size']
                    })
                
                current_time += segment_duration
                segment_count += 1
            
            return segments
            
        except Exception as e:
            raise Exception(f"Video splitting failed: {str(e)}")
    
    async def merge_videos(self, video_files: List[str], output_path: str) -> str:
        """
        Merge multiple video files into one
        """
        try:
            # Create concat file
            concat_file = output_path.replace('.mp4', '_concat.txt')
            
            with open(concat_file, 'w') as f:
                for video_file in video_files:
                    if os.path.exists(video_file):
                        f.write(f"file '{os.path.abspath(video_file)}'\n")
            
            cmd = [
                self.ffmpeg_path,
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_file,
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-preset', 'medium',
                '-crf', '23',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Video merge failed: {result.stderr}")
            
            # Clean up concat file
            if os.path.exists(concat_file):
                os.remove(concat_file)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Video merging failed: {str(e)}")
    
    async def extract_audio(self, video_path: str, output_path: str, format: str = 'wav') -> str:
        """
        Extract audio from video
        """
        try:
            cmd = [
                self.ffmpeg_path,
                '-i', video_path,
                '-vn',  # No video
                '-acodec', 'pcm_s16le' if format == 'wav' else 'aac',
                '-ar', '44100',
                '-ac', '2',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Audio extraction failed: {result.stderr}")
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Audio extraction failed: {str(e)}")
    
    async def combine_video_audio(self, video_path: str, audio_path: str, output_path: str) -> str:
        """
        Combine video and audio files
        """
        try:
            cmd = [
                self.ffmpeg_path,
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Video-audio combination failed: {result.stderr}")
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Video-audio combination failed: {str(e)}")
    
    async def resize_video(self, input_path: str, output_path: str, width: int, height: int) -> str:
        """
        Resize video to specified dimensions
        """
        try:
            cmd = [
                self.ffmpeg_path,
                '-i', input_path,
                '-vf', f'scale={width}:{height}',
                '-c:a', 'copy',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Video resize failed: {result.stderr}")
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Video resize failed: {str(e)}")
    
    async def create_thumbnail(self, video_path: str, output_path: str, timestamp: float = 1.0) -> str:
        """
        Create thumbnail from video at specified timestamp
        """
        try:
            cmd = [
                self.ffmpeg_path,
                '-i', video_path,
                '-ss', str(timestamp),
                '-vframes', '1',
                '-q:v', '2',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Thumbnail creation failed: {result.stderr}")
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Thumbnail creation failed: {str(e)}")
    
    async def compress_video(self, input_path: str, output_path: str, crf: int = 28) -> str:
        """
        Compress video with specified quality
        """
        try:
            cmd = [
                self.ffmpeg_path,
                '-i', input_path,
                '-c:v', 'libx264',
                '-crf', str(crf),
                '-preset', 'medium',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Video compression failed: {result.stderr}")
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Video compression failed: {str(e)}")

# Global instance
ffmpeg_service = FFmpegService()