import os
import asyncio
import aiohttp
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class Veo3Service:
    """Service for interacting with Google's Veo 3 API for video generation"""
    
    def __init__(self):
        self.api_key = os.getenv('VEO3_API_KEY')
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
        self.base_url = "https://aiplatform.googleapis.com/v1"
        self.model_name = "veo-3"
        self.max_retries = 3
        self.timeout = 300  # 5 minutes
        
        if not self.api_key:
            logger.warning("VEO3_API_KEY not found in environment variables")
        if not self.project_id:
            logger.warning("GOOGLE_CLOUD_PROJECT_ID not found in environment variables")
    
    async def convert_2d_to_3d(
        self,
        input_video_path: str,
        output_video_path: str,
        prompt: Optional[str] = None,
        style: str = "realistic",
        quality: str = "high"
    ) -> Dict[str, Any]:
        """
        Convert 2D video to 3D using Veo 3
        
        Args:
            input_video_path: Path to input 2D video
            output_video_path: Path where 3D video will be saved
            prompt: Optional text prompt for style guidance
            style: Style of 3D conversion (realistic, artistic, cartoon)
            quality: Quality setting (low, medium, high)
            
        Returns:
            Dict containing conversion results and metadata
        """
        try:
            logger.info(f"Starting Veo 3 conversion for {input_video_path}")
            
            # Prepare request payload
            payload = {
                "instances": [{
                    "video_input": {
                        "gcs_uri": input_video_path if input_video_path.startswith('gs://') else None,
                        "local_path": input_video_path if not input_video_path.startswith('gs://') else None
                    },
                    "parameters": {
                        "style": style,
                        "quality": quality,
                        "prompt": prompt or "Convert this 2D video to realistic 3D with depth and dimension",
                        "output_format": "mp4",
                        "frame_rate": 30,
                        "resolution": "1920x1080"
                    }
                }],
                "parameters": {
                    "model_version": "latest"
                }
            }
            
            # Make API request
            result = await self._make_api_request(
                endpoint=f"/projects/{self.project_id}/locations/us-central1/publishers/google/models/{self.model_name}:predict",
                payload=payload
            )
            
            if result.get('success'):
                logger.info(f"Veo 3 conversion completed successfully")
                return {
                    'success': True,
                    'output_path': output_video_path,
                    'job_id': result.get('job_id'),
                    'processing_time': result.get('processing_time'),
                    'metadata': result.get('metadata', {})
                }
            else:
                logger.error(f"Veo 3 conversion failed: {result.get('error')}")
                return {
                    'success': False,
                    'error': result.get('error', 'Unknown error occurred')
                }
                
        except Exception as e:
            logger.error(f"Error in Veo 3 conversion: {str(e)}")
            return {
                'success': False,
                'error': f"Veo 3 conversion failed: {str(e)}"
            }
    
    async def batch_convert_scenes(
        self,
        scene_paths: List[str],
        output_dir: str,
        prompt: Optional[str] = None,
        style: str = "realistic",
        quality: str = "high"
    ) -> Dict[str, Any]:
        """
        Convert multiple 2D video scenes to 3D in batch
        
        Args:
            scene_paths: List of paths to input 2D video scenes
            output_dir: Directory where 3D videos will be saved
            prompt: Optional text prompt for style guidance
            style: Style of 3D conversion
            quality: Quality setting
            
        Returns:
            Dict containing batch conversion results
        """
        try:
            logger.info(f"Starting batch Veo 3 conversion for {len(scene_paths)} scenes")
            
            results = []
            failed_scenes = []
            
            # Process scenes with rate limiting
            semaphore = asyncio.Semaphore(3)  # Limit concurrent requests
            
            async def convert_scene(scene_path: str, index: int):
                async with semaphore:
                    output_path = os.path.join(output_dir, f"scene_{index:03d}_3d.mp4")
                    result = await self.convert_2d_to_3d(
                        input_video_path=scene_path,
                        output_video_path=output_path,
                        prompt=prompt,
                        style=style,
                        quality=quality
                    )
                    
                    if result.get('success'):
                        results.append({
                            'scene_index': index,
                            'input_path': scene_path,
                            'output_path': output_path,
                            'processing_time': result.get('processing_time')
                        })
                    else:
                        failed_scenes.append({
                            'scene_index': index,
                            'input_path': scene_path,
                            'error': result.get('error')
                        })
                    
                    # Add delay between requests
                    await asyncio.sleep(1)
            
            # Execute batch conversion
            tasks = [
                convert_scene(scene_path, i) 
                for i, scene_path in enumerate(scene_paths)
            ]
            await asyncio.gather(*tasks, return_exceptions=True)
            
            success_rate = len(results) / len(scene_paths) if scene_paths else 0
            
            logger.info(f"Batch conversion completed. Success rate: {success_rate:.2%}")
            
            return {
                'success': True,
                'total_scenes': len(scene_paths),
                'successful_conversions': len(results),
                'failed_conversions': len(failed_scenes),
                'success_rate': success_rate,
                'results': results,
                'failed_scenes': failed_scenes
            }
            
        except Exception as e:
            logger.error(f"Error in batch Veo 3 conversion: {str(e)}")
            return {
                'success': False,
                'error': f"Batch conversion failed: {str(e)}"
            }
    
    async def get_conversion_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get the status of a Veo 3 conversion job
        
        Args:
            job_id: ID of the conversion job
            
        Returns:
            Dict containing job status and progress
        """
        try:
            result = await self._make_api_request(
                endpoint=f"/projects/{self.project_id}/locations/us-central1/operations/{job_id}",
                method="GET"
            )
            
            if result.get('success'):
                operation = result.get('data', {})
                
                status = "unknown"
                if operation.get('done'):
                    if 'error' in operation:
                        status = "failed"
                    else:
                        status = "completed"
                else:
                    status = "processing"
                
                return {
                    'success': True,
                    'status': status,
                    'progress': operation.get('metadata', {}).get('progressPercentage', 0),
                    'job_id': job_id,
                    'error': operation.get('error', {}).get('message') if status == "failed" else None
                }
            else:
                return {
                    'success': False,
                    'error': result.get('error', 'Failed to get job status')
                }
                
        except Exception as e:
            logger.error(f"Error getting Veo 3 job status: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to get job status: {str(e)}"
            }
    
    async def _make_api_request(
        self,
        endpoint: str,
        payload: Optional[Dict[str, Any]] = None,
        method: str = "POST"
    ) -> Dict[str, Any]:
        """
        Make an API request to Veo 3 service
        
        Args:
            endpoint: API endpoint
            payload: Request payload
            method: HTTP method
            
        Returns:
            Dict containing API response
        """
        if not self.api_key:
            return {
                'success': False,
                'error': 'Veo 3 API key not configured'
            }
        
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                    if method.upper() == "POST":
                        async with session.post(url, json=payload, headers=headers) as response:
                            response_data = await response.json()
                    else:
                        async with session.get(url, headers=headers) as response:
                            response_data = await response.json()
                    
                    if response.status == 200:
                        return {
                            'success': True,
                            'data': response_data,
                            'job_id': response_data.get('name', '').split('/')[-1] if 'name' in response_data else None
                        }
                    else:
                        error_msg = response_data.get('error', {}).get('message', f'HTTP {response.status}')
                        if attempt == self.max_retries - 1:
                            return {
                                'success': False,
                                'error': f'API request failed: {error_msg}'
                            }
                        
                        # Wait before retry
                        await asyncio.sleep(2 ** attempt)
                        
            except asyncio.TimeoutError:
                if attempt == self.max_retries - 1:
                    return {
                        'success': False,
                        'error': 'Request timeout'
                    }
                await asyncio.sleep(2 ** attempt)
                
            except Exception as e:
                if attempt == self.max_retries - 1:
                    return {
                        'success': False,
                        'error': f'Request failed: {str(e)}'
                    }
                await asyncio.sleep(2 ** attempt)
        
        return {
            'success': False,
            'error': 'Max retries exceeded'
        }
    
    def is_available(self) -> bool:
        """
        Check if Veo 3 service is available and configured
        
        Returns:
            True if service is available, False otherwise
        """
        return bool(self.api_key and self.project_id)
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the Veo 3 service
        
        Returns:
            Dict containing health status
        """
        try:
            if not self.is_available():
                return {
                    'healthy': False,
                    'error': 'Service not configured properly'
                }
            
            # Simple API call to check service health
            result = await self._make_api_request(
                endpoint=f"/projects/{self.project_id}/locations/us-central1/publishers/google/models",
                method="GET"
            )
            
            return {
                'healthy': result.get('success', False),
                'error': result.get('error') if not result.get('success') else None,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'healthy': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

# Global instance
veo3_service = Veo3Service()