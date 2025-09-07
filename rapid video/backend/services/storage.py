import os
import asyncio
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from pathlib import Path
import tempfile
import shutil
from urllib.parse import urlparse

from google.cloud import storage
from google.oauth2 import service_account
import aiofiles

from ..config import settings

class StorageService:
    """Service for file storage operations"""
    
    def __init__(self):
        self.use_cloud_storage = settings.USE_CLOUD_STORAGE
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.local_storage_path = os.path.join(os.getcwd(), "storage")
        self.temp_storage_path = tempfile.mkdtemp(prefix="rapid_video_storage_")
        
        # Initialize cloud storage client if enabled
        self.gcs_client = None
        self.bucket = None
        
        if self.use_cloud_storage:
            self._initialize_gcs_client()
        
        # Ensure local storage directories exist
        os.makedirs(self.local_storage_path, exist_ok=True)
        os.makedirs(os.path.join(self.local_storage_path, "uploads"), exist_ok=True)
        os.makedirs(os.path.join(self.local_storage_path, "outputs"), exist_ok=True)
        os.makedirs(os.path.join(self.local_storage_path, "temp"), exist_ok=True)
    
    def _initialize_gcs_client(self):
        """Initialize Google Cloud Storage client"""
        try:
            if settings.GOOGLE_APPLICATION_CREDENTIALS:
                # Use service account credentials
                credentials = service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_APPLICATION_CREDENTIALS
                )
                self.gcs_client = storage.Client(
                    project=settings.GOOGLE_CLOUD_PROJECT,
                    credentials=credentials
                )
            else:
                # Use default credentials (for Cloud Run, etc.)
                self.gcs_client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
            
            if self.bucket_name:
                self.bucket = self.gcs_client.bucket(self.bucket_name)
                
        except Exception as e:
            print(f"Warning: Failed to initialize Google Cloud Storage: {e}")
            self.use_cloud_storage = False
    
    async def save_uploaded_file(self, file_content: bytes, filename: str, job_id: str) -> str:
        """Save uploaded file to storage"""
        try:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = self._sanitize_filename(filename)
            unique_filename = f"{job_id}_{timestamp}_{safe_filename}"
            
            if self.use_cloud_storage and self.bucket:
                # Save to Google Cloud Storage
                blob_path = f"uploads/{unique_filename}"
                blob = self.bucket.blob(blob_path)
                
                # Upload file
                await asyncio.to_thread(blob.upload_from_string, file_content)
                
                # Return GCS path
                return f"gs://{self.bucket_name}/{blob_path}"
            else:
                # Save to local storage
                local_path = os.path.join(self.local_storage_path, "uploads", unique_filename)
                
                async with aiofiles.open(local_path, 'wb') as f:
                    await f.write(file_content)
                
                return local_path
                
        except Exception as e:
            raise Exception(f"Failed to save uploaded file: {str(e)}")
    
    async def save_output_file(self, source_path: str, job_id: str, filename: Optional[str] = None) -> str:
        """Save output file to storage"""
        try:
            if not filename:
                filename = f"output_{job_id}.mp4"
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = self._sanitize_filename(filename)
            unique_filename = f"{job_id}_{timestamp}_{safe_filename}"
            
            if self.use_cloud_storage and self.bucket:
                # Save to Google Cloud Storage
                blob_path = f"outputs/{unique_filename}"
                blob = self.bucket.blob(blob_path)
                
                # Upload file
                await asyncio.to_thread(blob.upload_from_filename, source_path)
                
                # Return GCS path
                return f"gs://{self.bucket_name}/{blob_path}"
            else:
                # Save to local storage
                local_path = os.path.join(self.local_storage_path, "outputs", unique_filename)
                
                # Copy file
                await asyncio.to_thread(shutil.copy2, source_path, local_path)
                
                return local_path
                
        except Exception as e:
            raise Exception(f"Failed to save output file: {str(e)}")
    
    async def get_file_url(self, file_path: str, expiration_hours: int = 24) -> str:
        """Get a signed URL for file access"""
        try:
            if file_path.startswith('gs://'):
                # Google Cloud Storage file
                if not self.bucket:
                    raise Exception("GCS bucket not initialized")
                
                # Extract blob path from GCS URL
                blob_path = file_path.replace(f"gs://{self.bucket_name}/", "")
                blob = self.bucket.blob(blob_path)
                
                # Generate signed URL
                expiration = datetime.utcnow() + timedelta(hours=expiration_hours)
                signed_url = await asyncio.to_thread(
                    blob.generate_signed_url,
                    expiration=expiration,
                    method='GET'
                )
                
                return signed_url
            else:
                # Local file - return relative path for serving
                relative_path = os.path.relpath(file_path, self.local_storage_path)
                return f"/storage/{relative_path.replace(os.sep, '/')}"
                
        except Exception as e:
            raise Exception(f"Failed to get file URL: {str(e)}")
    
    async def get_file_content(self, file_path: str) -> bytes:
        """Get file content as bytes"""
        try:
            if file_path.startswith('gs://'):
                # Google Cloud Storage file
                if not self.bucket:
                    raise Exception("GCS bucket not initialized")
                
                blob_path = file_path.replace(f"gs://{self.bucket_name}/", "")
                blob = self.bucket.blob(blob_path)
                
                # Download content
                content = await asyncio.to_thread(blob.download_as_bytes)
                return content
            else:
                # Local file
                async with aiofiles.open(file_path, 'rb') as f:
                    content = await f.read()
                return content
                
        except Exception as e:
            raise Exception(f"Failed to get file content: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        try:
            if file_path.startswith('gs://'):
                # Google Cloud Storage file
                if not self.bucket:
                    return False
                
                blob_path = file_path.replace(f"gs://{self.bucket_name}/", "")
                blob = self.bucket.blob(blob_path)
                
                # Delete blob
                await asyncio.to_thread(blob.delete)
                return True
            else:
                # Local file
                if os.path.exists(file_path):
                    await asyncio.to_thread(os.remove, file_path)
                    return True
                return False
                
        except Exception as e:
            print(f"Warning: Failed to delete file {file_path}: {e}")
            return False
    
    async def list_files(self, prefix: str = "", limit: int = 100) -> List[Dict]:
        """List files in storage"""
        try:
            files = []
            
            if self.use_cloud_storage and self.bucket:
                # List GCS files
                blobs = await asyncio.to_thread(
                    list,
                    self.bucket.list_blobs(prefix=prefix, max_results=limit)
                )
                
                for blob in blobs:
                    files.append({
                        'name': blob.name,
                        'path': f"gs://{self.bucket_name}/{blob.name}",
                        'size': blob.size,
                        'created': blob.time_created.isoformat() if blob.time_created else None,
                        'updated': blob.updated.isoformat() if blob.updated else None,
                        'content_type': blob.content_type
                    })
            else:
                # List local files
                search_path = os.path.join(self.local_storage_path, prefix) if prefix else self.local_storage_path
                
                if os.path.exists(search_path):
                    for root, dirs, filenames in os.walk(search_path):
                        for filename in filenames[:limit]:
                            file_path = os.path.join(root, filename)
                            stat = os.stat(file_path)
                            
                            files.append({
                                'name': filename,
                                'path': file_path,
                                'size': stat.st_size,
                                'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                                'updated': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                'content_type': self._get_content_type(filename)
                            })
            
            return files
            
        except Exception as e:
            print(f"Warning: Failed to list files: {e}")
            return []
    
    async def get_file_info(self, file_path: str) -> Optional[Dict]:
        """Get file information"""
        try:
            if file_path.startswith('gs://'):
                # Google Cloud Storage file
                if not self.bucket:
                    return None
                
                blob_path = file_path.replace(f"gs://{self.bucket_name}/", "")
                blob = self.bucket.blob(blob_path)
                
                # Reload blob to get latest metadata
                await asyncio.to_thread(blob.reload)
                
                return {
                    'name': blob.name,
                    'path': file_path,
                    'size': blob.size,
                    'created': blob.time_created.isoformat() if blob.time_created else None,
                    'updated': blob.updated.isoformat() if blob.updated else None,
                    'content_type': blob.content_type,
                    'exists': blob.exists()
                }
            else:
                # Local file
                if not os.path.exists(file_path):
                    return None
                
                stat = os.stat(file_path)
                filename = os.path.basename(file_path)
                
                return {
                    'name': filename,
                    'path': file_path,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'updated': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'content_type': self._get_content_type(filename),
                    'exists': True
                }
                
        except Exception as e:
            print(f"Warning: Failed to get file info for {file_path}: {e}")
            return None
    
    async def cleanup_old_files(self, days: int = 7) -> int:
        """Clean up files older than specified days"""
        try:
            deleted_count = 0
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            if self.use_cloud_storage and self.bucket:
                # Clean up GCS files
                blobs = await asyncio.to_thread(list, self.bucket.list_blobs())
                
                for blob in blobs:
                    if blob.time_created and blob.time_created < cutoff_date:
                        await asyncio.to_thread(blob.delete)
                        deleted_count += 1
            else:
                # Clean up local files
                for root, dirs, files in os.walk(self.local_storage_path):
                    for filename in files:
                        file_path = os.path.join(root, filename)
                        stat = os.stat(file_path)
                        file_date = datetime.fromtimestamp(stat.st_ctime)
                        
                        if file_date < cutoff_date:
                            await asyncio.to_thread(os.remove, file_path)
                            deleted_count += 1
            
            return deleted_count
            
        except Exception as e:
            print(f"Warning: Failed to cleanup old files: {e}")
            return 0
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove or replace unsafe characters
        unsafe_chars = '<>:"/\\|?*'
        for char in unsafe_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        name, ext = os.path.splitext(filename)
        if len(name) > 100:
            name = name[:100]
        
        return f"{name}{ext}"
    
    def _get_content_type(self, filename: str) -> str:
        """Get content type based on file extension"""
        ext = os.path.splitext(filename)[1].lower()
        
        content_types = {
            '.mp4': 'video/mp4',
            '.avi': 'video/avi',
            '.mov': 'video/quicktime',
            '.mkv': 'video/x-matroska',
            '.webm': 'video/webm',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.json': 'application/json',
            '.txt': 'text/plain'
        }
        
        return content_types.get(ext, 'application/octet-stream')
    
    def get_storage_stats(self) -> Dict:
        """Get storage usage statistics"""
        try:
            stats = {
                'storage_type': 'cloud' if self.use_cloud_storage else 'local',
                'total_files': 0,
                'total_size': 0,
                'uploads_count': 0,
                'outputs_count': 0
            }
            
            if self.use_cloud_storage and self.bucket:
                # Get GCS stats
                blobs = list(self.bucket.list_blobs())
                stats['total_files'] = len(blobs)
                stats['total_size'] = sum(blob.size or 0 for blob in blobs)
                stats['uploads_count'] = len([b for b in blobs if b.name.startswith('uploads/')])
                stats['outputs_count'] = len([b for b in blobs if b.name.startswith('outputs/')])
            else:
                # Get local stats
                for root, dirs, files in os.walk(self.local_storage_path):
                    for filename in files:
                        file_path = os.path.join(root, filename)
                        stats['total_files'] += 1
                        stats['total_size'] += os.path.getsize(file_path)
                        
                        if 'uploads' in root:
                            stats['uploads_count'] += 1
                        elif 'outputs' in root:
                            stats['outputs_count'] += 1
            
            return stats
            
        except Exception as e:
            print(f"Warning: Failed to get storage stats: {e}")
            return {
                'storage_type': 'unknown',
                'total_files': 0,
                'total_size': 0,
                'uploads_count': 0,
                'outputs_count': 0,
                'error': str(e)
            }

# Global storage service instance
storage_service = StorageService()