from google.cloud import storage
from google.auth import default
import os
from datetime import datetime, timedelta
from typing import Optional, Dict
import uuid
import mimetypes

class GCSService:
    """
    Service for handling Google Cloud Storage operations
    """
    
    def __init__(self):
        self.bucket_name = os.getenv("GCS_BUCKET_NAME", "rapid-video-storage")
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        
        try:
            # Initialize GCS client
            self.client = storage.Client(project=self.project_id)
            self.bucket = self.client.bucket(self.bucket_name)
        except Exception as e:
            print(f"Warning: GCS initialization failed: {e}")
            self.client = None
            self.bucket = None
    
    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        try:
            if not self.bucket.exists():
                self.bucket = self.client.create_bucket(self.bucket_name, location="US")
                print(f"Created bucket: {self.bucket_name}")
        except Exception as e:
            print(f"Bucket creation failed: {e}")
    
    async def upload_file(self, local_file_path: str, destination_path: str, content_type: Optional[str] = None) -> Dict:
        """
        Upload a file to Google Cloud Storage
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            self._ensure_bucket_exists()
            
            # Auto-detect content type if not provided
            if not content_type:
                content_type, _ = mimetypes.guess_type(local_file_path)
                if not content_type:
                    content_type = 'application/octet-stream'
            
            # Create blob
            blob = self.bucket.blob(destination_path)
            
            # Set metadata
            blob.metadata = {
                'uploaded_at': datetime.utcnow().isoformat(),
                'original_filename': os.path.basename(local_file_path)
            }
            
            # Upload file
            with open(local_file_path, 'rb') as file_obj:
                blob.upload_from_file(file_obj, content_type=content_type)
            
            # Get file info
            file_size = os.path.getsize(local_file_path)
            
            return {
                'success': True,
                'bucket': self.bucket_name,
                'path': destination_path,
                'size': file_size,
                'content_type': content_type,
                'public_url': f"https://storage.googleapis.com/{self.bucket_name}/{destination_path}",
                'uploaded_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def upload_video(self, local_file_path: str, job_id: str, video_type: str = "original") -> Dict:
        """
        Upload video file with organized path structure
        """
        try:
            # Generate organized path
            file_extension = os.path.splitext(local_file_path)[1]
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            destination_path = f"videos/{job_id}/{video_type}_{timestamp}{file_extension}"
            
            result = await self.upload_file(local_file_path, destination_path, "video/mp4")
            
            if result['success']:
                result['video_type'] = video_type
                result['job_id'] = job_id
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def download_file(self, source_path: str, local_file_path: str) -> Dict:
        """
        Download a file from Google Cloud Storage
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            blob = self.bucket.blob(source_path)
            
            if not blob.exists():
                raise Exception(f"File not found: {source_path}")
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
            
            # Download file
            blob.download_to_filename(local_file_path)
            
            return {
                'success': True,
                'local_path': local_file_path,
                'size': blob.size,
                'content_type': blob.content_type,
                'downloaded_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def generate_signed_url(self, file_path: str, expiration_hours: int = 24, method: str = "GET") -> Dict:
        """
        Generate a signed URL for secure file access
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            blob = self.bucket.blob(file_path)
            
            if not blob.exists():
                raise Exception(f"File not found: {file_path}")
            
            # Generate signed URL
            expiration = datetime.utcnow() + timedelta(hours=expiration_hours)
            
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=expiration,
                method=method
            )
            
            return {
                'success': True,
                'signed_url': signed_url,
                'expires_at': expiration.isoformat(),
                'method': method,
                'file_path': file_path
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def delete_file(self, file_path: str) -> Dict:
        """
        Delete a file from Google Cloud Storage
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            blob = self.bucket.blob(file_path)
            
            if blob.exists():
                blob.delete()
                return {
                    'success': True,
                    'message': f"File deleted: {file_path}"
                }
            else:
                return {
                    'success': False,
                    'error': f"File not found: {file_path}"
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def delete_job_files(self, job_id: str) -> Dict:
        """
        Delete all files associated with a job
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            # List all blobs with job_id prefix
            blobs = self.bucket.list_blobs(prefix=f"videos/{job_id}/")
            
            deleted_files = []
            for blob in blobs:
                blob.delete()
                deleted_files.append(blob.name)
            
            return {
                'success': True,
                'deleted_files': deleted_files,
                'count': len(deleted_files)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def list_files(self, prefix: str = "", limit: int = 100) -> Dict:
        """
        List files in the bucket with optional prefix filter
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            blobs = self.bucket.list_blobs(prefix=prefix, max_results=limit)
            
            files = []
            for blob in blobs:
                files.append({
                    'name': blob.name,
                    'size': blob.size,
                    'content_type': blob.content_type,
                    'created': blob.time_created.isoformat() if blob.time_created else None,
                    'updated': blob.updated.isoformat() if blob.updated else None,
                    'public_url': f"https://storage.googleapis.com/{self.bucket_name}/{blob.name}"
                })
            
            return {
                'success': True,
                'files': files,
                'count': len(files),
                'prefix': prefix
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_file_info(self, file_path: str) -> Dict:
        """
        Get information about a specific file
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            blob = self.bucket.blob(file_path)
            
            if not blob.exists():
                return {
                    'success': False,
                    'error': f"File not found: {file_path}"
                }
            
            # Reload to get latest metadata
            blob.reload()
            
            return {
                'success': True,
                'name': blob.name,
                'size': blob.size,
                'content_type': blob.content_type,
                'created': blob.time_created.isoformat() if blob.time_created else None,
                'updated': blob.updated.isoformat() if blob.updated else None,
                'metadata': blob.metadata or {},
                'public_url': f"https://storage.googleapis.com/{self.bucket_name}/{blob.name}",
                'etag': blob.etag
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def copy_file(self, source_path: str, destination_path: str) -> Dict:
        """
        Copy a file within the bucket
        """
        try:
            if not self.client:
                raise Exception("GCS client not initialized")
            
            source_blob = self.bucket.blob(source_path)
            
            if not source_blob.exists():
                raise Exception(f"Source file not found: {source_path}")
            
            # Copy the blob
            destination_blob = self.bucket.copy_blob(source_blob, self.bucket, destination_path)
            
            return {
                'success': True,
                'source_path': source_path,
                'destination_path': destination_path,
                'size': destination_blob.size,
                'copied_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_bucket_info(self) -> Dict:
        """
        Get information about the bucket
        """
        try:
            if not self.client:
                return {
                    'success': False,
                    'error': "GCS client not initialized"
                }
            
            if self.bucket.exists():
                return {
                    'success': True,
                    'bucket_name': self.bucket_name,
                    'location': self.bucket.location,
                    'storage_class': self.bucket.storage_class,
                    'created': self.bucket.time_created.isoformat() if self.bucket.time_created else None
                }
            else:
                return {
                    'success': False,
                    'error': f"Bucket does not exist: {self.bucket_name}"
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Global instance
gcs_service = GCSService()