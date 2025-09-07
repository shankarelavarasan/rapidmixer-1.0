import os
import asyncio
import aiohttp
import logging
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class BananaService:
    """Service for interacting with Banana.dev GPU infrastructure for AI video processing"""
    
    def __init__(self):
        self.api_key = os.getenv('BANANA_API_KEY')
        self.model_key = os.getenv('BANANA_MODEL_KEY')
        self.base_url = "https://api.banana.dev"
        self.max_retries = 3
        self.timeout = 600  # 10 minutes for GPU processing
        
        if not self.api_key:
            logger.warning("BANANA_API_KEY not found in environment variables")
        if not self.model_key:
            logger.warning("BANANA_MODEL_KEY not found in environment variables")
    
    async def process_video_2d_to_3d(
        self,
        input_video_path: str,
        output_video_path: str,
        model_type: str = "depth_estimation",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process 2D video to 3D using Banana.dev GPU infrastructure
        
        Args:
            input_video_path: Path to input 2D video
            output_video_path: Path where 3D video will be saved
            model_type: Type of AI model to use (depth_estimation, stereo_conversion, neural_3d)
            parameters: Additional model parameters
            
        Returns:
            Dict containing processing results and metadata
        """
        try:
            logger.info(f"Starting Banana.dev 2D to 3D processing for {input_video_path}")
            
            # Read and encode video file
            video_data = await self._encode_video_file(input_video_path)
            if not video_data:
                return {
                    'success': False,
                    'error': 'Failed to read input video file'
                }
            
            # Prepare model parameters
            model_params = {
                'model_type': model_type,
                'output_format': 'mp4',
                'quality': 'high',
                'depth_strength': 0.8,
                'stereo_separation': 0.1,
                **(parameters or {})
            }
            
            # Prepare request payload
            payload = {
                'id': f"job_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                'created': int(datetime.utcnow().timestamp()),
                'input': {
                    'video_data': video_data,
                    'parameters': model_params
                },
                'webhook': None  # Can be set for async processing
            }
            
            # Make API request
            result = await self._make_api_request(
                endpoint="/start/v4",
                payload=payload
            )
            
            if result.get('success'):
                # Process the result
                output_data = result.get('data', {}).get('output')
                if output_data and 'video_data' in output_data:
                    # Decode and save output video
                    success = await self._decode_and_save_video(
                        output_data['video_data'],
                        output_video_path
                    )
                    
                    if success:
                        logger.info(f"Banana.dev processing completed successfully")
                        return {
                            'success': True,
                            'output_path': output_video_path,
                            'job_id': result.get('job_id'),
                            'processing_time': result.get('processing_time'),
                            'model_used': model_type,
                            'metadata': output_data.get('metadata', {})
                        }
                    else:
                        return {
                            'success': False,
                            'error': 'Failed to save output video'
                        }
                else:
                    return {
                        'success': False,
                        'error': 'No video data in response'
                    }
            else:
                logger.error(f"Banana.dev processing failed: {result.get('error')}")
                return {
                    'success': False,
                    'error': result.get('error', 'Unknown error occurred')
                }
                
        except Exception as e:
            logger.error(f"Error in Banana.dev processing: {str(e)}")
            return {
                'success': False,
                'error': f"Banana.dev processing failed: {str(e)}"
            }
    
    async def batch_process_scenes(
        self,
        scene_paths: List[str],
        output_dir: str,
        model_type: str = "depth_estimation",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process multiple 2D video scenes to 3D in batch using GPU
        
        Args:
            scene_paths: List of paths to input 2D video scenes
            output_dir: Directory where 3D videos will be saved
            model_type: Type of AI model to use
            parameters: Additional model parameters
            
        Returns:
            Dict containing batch processing results
        """
        try:
            logger.info(f"Starting batch Banana.dev processing for {len(scene_paths)} scenes")
            
            results = []
            failed_scenes = []
            
            # Process scenes with rate limiting (GPU resources are limited)
            semaphore = asyncio.Semaphore(2)  # Limit concurrent GPU requests
            
            async def process_scene(scene_path: str, index: int):
                async with semaphore:
                    output_path = os.path.join(output_dir, f"scene_{index:03d}_3d.mp4")
                    result = await self.process_video_2d_to_3d(
                        input_video_path=scene_path,
                        output_video_path=output_path,
                        model_type=model_type,
                        parameters=parameters
                    )
                    
                    if result.get('success'):
                        results.append({
                            'scene_index': index,
                            'input_path': scene_path,
                            'output_path': output_path,
                            'processing_time': result.get('processing_time'),
                            'model_used': result.get('model_used')
                        })
                    else:
                        failed_scenes.append({
                            'scene_index': index,
                            'input_path': scene_path,
                            'error': result.get('error')
                        })
                    
                    # Add delay between GPU requests
                    await asyncio.sleep(2)
            
            # Execute batch processing
            tasks = [
                process_scene(scene_path, i) 
                for i, scene_path in enumerate(scene_paths)
            ]
            await asyncio.gather(*tasks, return_exceptions=True)
            
            success_rate = len(results) / len(scene_paths) if scene_paths else 0
            
            logger.info(f"Batch processing completed. Success rate: {success_rate:.2%}")
            
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
            logger.error(f"Error in batch Banana.dev processing: {str(e)}")
            return {
                'success': False,
                'error': f"Batch processing failed: {str(e)}"
            }
    
    async def enhance_video_quality(
        self,
        input_video_path: str,
        output_video_path: str,
        enhancement_type: str = "upscale",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Enhance video quality using GPU-accelerated AI models
        
        Args:
            input_video_path: Path to input video
            output_video_path: Path where enhanced video will be saved
            enhancement_type: Type of enhancement (upscale, denoise, stabilize)
            parameters: Additional enhancement parameters
            
        Returns:
            Dict containing enhancement results
        """
        try:
            logger.info(f"Starting video enhancement with Banana.dev: {enhancement_type}")
            
            # Read and encode video file
            video_data = await self._encode_video_file(input_video_path)
            if not video_data:
                return {
                    'success': False,
                    'error': 'Failed to read input video file'
                }
            
            # Prepare enhancement parameters
            enhance_params = {
                'enhancement_type': enhancement_type,
                'scale_factor': 2.0,
                'noise_reduction': 0.5,
                'stabilization_strength': 0.7,
                **(parameters or {})
            }
            
            # Prepare request payload
            payload = {
                'id': f"enhance_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                'created': int(datetime.utcnow().timestamp()),
                'input': {
                    'video_data': video_data,
                    'task': 'video_enhancement',
                    'parameters': enhance_params
                }
            }
            
            # Make API request
            result = await self._make_api_request(
                endpoint="/start/v4",
                payload=payload
            )
            
            if result.get('success'):
                output_data = result.get('data', {}).get('output')
                if output_data and 'video_data' in output_data:
                    success = await self._decode_and_save_video(
                        output_data['video_data'],
                        output_video_path
                    )
                    
                    if success:
                        return {
                            'success': True,
                            'output_path': output_video_path,
                            'enhancement_type': enhancement_type,
                            'processing_time': result.get('processing_time')
                        }
                
                return {
                    'success': False,
                    'error': 'Failed to process enhancement result'
                }
            else:
                return {
                    'success': False,
                    'error': result.get('error', 'Enhancement failed')
                }
                
        except Exception as e:
            logger.error(f"Error in video enhancement: {str(e)}")
            return {
                'success': False,
                'error': f"Video enhancement failed: {str(e)}"
            }
    
    async def _encode_video_file(self, file_path: str) -> Optional[str]:
        """
        Encode video file to base64 for API transmission
        
        Args:
            file_path: Path to video file
            
        Returns:
            Base64 encoded video data or None if failed
        """
        try:
            with open(file_path, 'rb') as f:
                video_bytes = f.read()
                return base64.b64encode(video_bytes).decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to encode video file {file_path}: {str(e)}")
            return None
    
    async def _decode_and_save_video(self, video_data: str, output_path: str) -> bool:
        """
        Decode base64 video data and save to file
        
        Args:
            video_data: Base64 encoded video data
            output_path: Path where video will be saved
            
        Returns:
            True if successful, False otherwise
        """
        try:
            video_bytes = base64.b64decode(video_data)
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'wb') as f:
                f.write(video_bytes)
            
            return True
        except Exception as e:
            logger.error(f"Failed to decode and save video to {output_path}: {str(e)}")
            return False
    
    async def _make_api_request(
        self,
        endpoint: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Make an API request to Banana.dev service
        
        Args:
            endpoint: API endpoint
            payload: Request payload
            
        Returns:
            Dict containing API response
        """
        if not self.api_key or not self.model_key:
            return {
                'success': False,
                'error': 'Banana.dev API credentials not configured'
            }
        
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        # Add model key to payload
        payload['modelKey'] = self.model_key
        
        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                    async with session.post(url, json=payload, headers=headers) as response:
                        response_data = await response.json()
                    
                    if response.status == 200:
                        return {
                            'success': True,
                            'data': response_data,
                            'job_id': response_data.get('id'),
                            'processing_time': response_data.get('delayTime', 0)
                        }
                    else:
                        error_msg = response_data.get('message', f'HTTP {response.status}')
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
                        'error': 'Request timeout - GPU processing took too long'
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
        Check if Banana.dev service is available and configured
        
        Returns:
            True if service is available, False otherwise
        """
        return bool(self.api_key and self.model_key)
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the Banana.dev service
        
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
            payload = {
                'id': 'health_check',
                'created': int(datetime.utcnow().timestamp()),
                'input': {'test': True}
            }
            
            result = await self._make_api_request(
                endpoint="/check/v4",
                payload=payload
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
    
    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about available models
        
        Returns:
            Dict containing model information
        """
        try:
            payload = {
                'modelKey': self.model_key
            }
            
            result = await self._make_api_request(
                endpoint="/info/v4",
                payload=payload
            )
            
            if result.get('success'):
                return {
                    'success': True,
                    'model_info': result.get('data', {})
                }
            else:
                return {
                    'success': False,
                    'error': result.get('error', 'Failed to get model info')
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get model info: {str(e)}"
            }

# Global instance
banana_service = BananaService()