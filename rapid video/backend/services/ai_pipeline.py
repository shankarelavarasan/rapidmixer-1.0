import asyncio
import json
from typing import List, Dict, Optional, Any
from datetime import datetime
import base64
import io
from PIL import Image

import google.generativeai as genai
from google.cloud import aiplatform
from google.oauth2 import service_account
import requests

from ..config import settings
from ..models.job import Job, ProcessingStage, update_job_progress
from .video_processor import video_processor

class AIPipeline:
    """Service for AI processing pipeline"""
    
    def __init__(self):
        self.gemini_model = None
        self.vertex_client = None
        self.veo_client = None
        self.banana_client = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AI service clients"""
        try:
            # Initialize Gemini
            if settings.GEMINI_API_KEY:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            # Initialize Vertex AI
            if settings.VERTEX_AI_PROJECT:
                aiplatform.init(
                    project=settings.VERTEX_AI_PROJECT,
                    location=settings.VERTEX_AI_LOCATION
                )
                self.vertex_client = aiplatform
            
            # Initialize Veo 3 client
            if settings.VEO_API_KEY:
                self.veo_client = {
                    'api_key': settings.VEO_API_KEY,
                    'base_url': settings.VEO_API_URL
                }
            
            # Initialize Banana.dev client
            if settings.BANANA_API_KEY:
                self.banana_client = {
                    'api_key': settings.BANANA_API_KEY,
                    'model_key': settings.BANANA_MODEL_KEY
                }
                
        except Exception as e:
            print(f"Warning: Failed to initialize some AI clients: {e}")
    
    async def process_scenes_with_ai(self, job: Job, scene_paths: List[str], progress_callback=None) -> List[Dict]:
        """Process all scenes with AI pipeline"""
        try:
            # Update job progress
            job = update_job_progress(job, ProcessingStage.AI_PROCESSING, 0.1)
            if progress_callback:
                await progress_callback(job)
            
            processed_scenes = []
            total_scenes = len(scene_paths)
            
            for i, scene_path in enumerate(scene_paths):
                # Analyze scene content
                scene_info = await video_processor.analyze_scene_content(scene_path)
                
                # Generate AI prompts for the scene
                ai_prompts = await self.generate_scene_prompts(scene_path, scene_info)
                
                # Process with AI models
                processed_scene = {
                    'scene_index': i + 1,
                    'scene_path': scene_path,
                    'scene_info': scene_info,
                    'ai_prompts': ai_prompts,
                    'generated_content': None
                }
                
                # Generate 3D content if models are available
                if self.veo_client or self.banana_client:
                    generated_content = await self.generate_3d_content(ai_prompts, scene_info)
                    processed_scene['generated_content'] = generated_content
                
                processed_scenes.append(processed_scene)
                
                # Update progress
                progress = 0.1 + (0.8 * (i + 1) / total_scenes)
                job = update_job_progress(job, ProcessingStage.AI_PROCESSING, progress)
                if progress_callback:
                    await progress_callback(job)
            
            # Update job with AI processing results
            job = update_job_progress(
                job,
                ProcessingStage.AI_PROCESSING,
                0.9,
                ai_prompts=[scene['ai_prompts'] for scene in processed_scenes]
            )
            if progress_callback:
                await progress_callback(job)
            
            return processed_scenes
            
        except Exception as e:
            raise Exception(f"Failed to process scenes with AI: {str(e)}")
    
    async def generate_scene_prompts(self, scene_path: str, scene_info: Dict) -> Dict[str, str]:
        """Generate AI prompts for scene understanding and 3D conversion"""
        try:
            if not self.gemini_model:
                return self._generate_fallback_prompts(scene_info)
            
            # Prepare scene analysis prompt
            analysis_prompt = self._create_scene_analysis_prompt(scene_info)
            
            # Analyze keyframes with Gemini Vision
            keyframe_analysis = []
            for keyframe_path in scene_info.get('keyframes', []):
                analysis = await self._analyze_keyframe_with_gemini(keyframe_path)
                keyframe_analysis.append(analysis)
            
            # Generate comprehensive scene understanding
            scene_understanding = await self._generate_scene_understanding(
                analysis_prompt, keyframe_analysis, scene_info
            )
            
            # Generate 3D conversion prompts
            prompts = {
                'scene_description': scene_understanding.get('description', ''),
                'style_prompt': scene_understanding.get('style', ''),
                'animation_prompt': scene_understanding.get('animation', ''),
                'lighting_prompt': scene_understanding.get('lighting', ''),
                'camera_prompt': scene_understanding.get('camera', ''),
                'effects_prompt': scene_understanding.get('effects', ''),
                'audio_prompt': scene_understanding.get('audio', '')
            }
            
            return prompts
            
        except Exception as e:
            print(f"Warning: Failed to generate AI prompts, using fallback: {e}")
            return self._generate_fallback_prompts(scene_info)
    
    def _create_scene_analysis_prompt(self, scene_info: Dict) -> str:
        """Create a comprehensive prompt for scene analysis"""
        return f"""
Analyze this video scene for 3D animation conversion:

Scene Properties:
- Duration: {scene_info.get('duration', 0):.1f} seconds
- Resolution: {scene_info.get('resolution', 'unknown')}
- Has Motion: {scene_info.get('has_motion', False)}
- Brightness: {scene_info.get('brightness', 0.5):.2f}
- Dominant Colors: {', '.join(scene_info.get('dominant_colors', []))}

Please provide a detailed analysis including:
1. Scene description (objects, characters, environment)
2. Visual style and mood
3. Animation requirements (movement, transitions)
4. Lighting setup and atmosphere
5. Camera angles and movements
6. Special effects needed
7. Audio/sound effects suggestions

Format your response as JSON with keys: description, style, animation, lighting, camera, effects, audio
"""
    
    async def _analyze_keyframe_with_gemini(self, keyframe_path: str) -> str:
        """Analyze a keyframe image with Gemini Vision"""
        try:
            # Load and encode image
            with open(keyframe_path, 'rb') as f:
                image_data = f.read()
            
            # Create image part for Gemini
            image = Image.open(io.BytesIO(image_data))
            
            prompt = """
Analyze this video frame for 3D animation conversion. Describe:
1. Main objects and characters
2. Scene composition and layout
3. Visual style and artistic elements
4. Lighting and shadows
5. Colors and mood
6. Any motion or action visible

Be specific and detailed for 3D recreation.
"""
            
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                [prompt, image]
            )
            
            return response.text
            
        except Exception as e:
            return f"Frame analysis failed: {str(e)}"
    
    async def _generate_scene_understanding(self, analysis_prompt: str, keyframe_analysis: List[str], scene_info: Dict) -> Dict:
        """Generate comprehensive scene understanding using Gemini"""
        try:
            # Combine all analysis data
            combined_prompt = f"""
{analysis_prompt}

Keyframe Analysis:
{chr(10).join([f"Frame {i+1}: {analysis}" for i, analysis in enumerate(keyframe_analysis)])}

Based on this analysis, provide a comprehensive JSON response for 3D animation conversion.
"""
            
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                combined_prompt
            )
            
            # Try to parse JSON response
            try:
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                # Fallback: extract information from text response
                return self._extract_prompts_from_text(response.text)
            
        except Exception as e:
            print(f"Scene understanding generation failed: {e}")
            return self._generate_fallback_prompts(scene_info)
    
    def _extract_prompts_from_text(self, text: str) -> Dict:
        """Extract prompt information from text response"""
        # Simple extraction logic - can be improved
        lines = text.split('\n')
        prompts = {
            'description': '',
            'style': 'realistic 3D animation',
            'animation': 'smooth transitions',
            'lighting': 'natural lighting',
            'camera': 'cinematic angles',
            'effects': 'subtle effects',
            'audio': 'ambient sound'
        }
        
        current_key = None
        for line in lines:
            line = line.strip()
            if any(key in line.lower() for key in prompts.keys()):
                for key in prompts.keys():
                    if key in line.lower():
                        current_key = key
                        break
            elif current_key and line:
                prompts[current_key] += line + ' '
        
        # Clean up prompts
        for key in prompts:
            prompts[key] = prompts[key].strip()[:500]  # Limit length
        
        return prompts
    
    def _generate_fallback_prompts(self, scene_info: Dict) -> Dict[str, str]:
        """Generate fallback prompts when AI services are unavailable"""
        duration = scene_info.get('duration', 8)
        has_motion = scene_info.get('has_motion', True)
        brightness = scene_info.get('brightness', 0.5)
        colors = scene_info.get('dominant_colors', ['#808080'])
        
        # Generate basic prompts based on scene properties
        style = "bright, colorful 3D animation" if brightness > 0.6 else "moody, cinematic 3D animation"
        animation = "dynamic movement and transitions" if has_motion else "gentle, subtle animations"
        
        return {
            'scene_description': f"A {duration:.1f}-second scene with dynamic visual elements",
            'style_prompt': f"{style} with dominant colors {', '.join(colors[:3])}",
            'animation_prompt': f"{animation} over {duration:.1f} seconds",
            'lighting_prompt': "cinematic lighting with soft shadows",
            'camera_prompt': "smooth camera movements with cinematic framing",
            'effects_prompt': "subtle particle effects and atmospheric elements",
            'audio_prompt': "ambient soundscape with appropriate sound effects"
        }
    
    async def generate_3d_content(self, prompts: Dict[str, str], scene_info: Dict) -> Optional[Dict]:
        """Generate 3D content using Veo 3 and Banana.dev"""
        try:
            generated_content = {
                'veo_result': None,
                'banana_result': None,
                'status': 'pending'
            }
            
            # Try Veo 3 first
            if self.veo_client:
                veo_result = await self._generate_with_veo3(prompts, scene_info)
                generated_content['veo_result'] = veo_result
            
            # Try Banana.dev for additional processing
            if self.banana_client:
                banana_result = await self._generate_with_banana(prompts, scene_info)
                generated_content['banana_result'] = banana_result
            
            generated_content['status'] = 'completed'
            return generated_content
            
        except Exception as e:
            print(f"3D content generation failed: {e}")
            return {
                'veo_result': None,
                'banana_result': None,
                'status': 'failed',
                'error': str(e)
            }
    
    async def _generate_with_veo3(self, prompts: Dict[str, str], scene_info: Dict) -> Optional[Dict]:
        """Generate content using Veo 3 API"""
        try:
            # Prepare Veo 3 request
            payload = {
                'prompt': prompts['scene_description'],
                'style': prompts['style_prompt'],
                'duration': scene_info.get('duration', 8),
                'resolution': scene_info.get('resolution', '1280x720'),
                'fps': min(scene_info.get('fps', 30), 30),
                'seed': hash(prompts['scene_description']) % 1000000
            }
            
            headers = {
                'Authorization': f"Bearer {self.veo_client['api_key']}",
                'Content-Type': 'application/json'
            }
            
            # Make API request
            response = await asyncio.to_thread(
                requests.post,
                f"{self.veo_client['base_url']}/generate",
                json=payload,
                headers=headers,
                timeout=300
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Veo 3 API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Veo 3 generation failed: {e}")
            return None
    
    async def _generate_with_banana(self, prompts: Dict[str, str], scene_info: Dict) -> Optional[Dict]:
        """Generate content using Banana.dev API"""
        try:
            # Prepare Banana.dev request
            payload = {
                'modelKey': self.banana_client['model_key'],
                'modelInputs': {
                    'prompt': prompts['scene_description'],
                    'style': prompts['style_prompt'],
                    'animation': prompts['animation_prompt'],
                    'lighting': prompts['lighting_prompt'],
                    'duration': scene_info.get('duration', 8),
                    'resolution': scene_info.get('resolution', '1280x720')
                }
            }
            
            headers = {
                'Authorization': f"Bearer {self.banana_client['api_key']}",
                'Content-Type': 'application/json'
            }
            
            # Make API request
            response = await asyncio.to_thread(
                requests.post,
                "https://api.banana.dev/start/v4/",
                json=payload,
                headers=headers,
                timeout=300
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Banana.dev API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Banana.dev generation failed: {e}")
            return None
    
    async def enhance_audio(self, audio_path: str, scene_prompts: List[Dict]) -> str:
        """Enhance audio with AI-generated sound effects"""
        try:
            # For now, return original audio path
            # In production, this would integrate with audio AI services
            return audio_path
            
        except Exception as e:
            print(f"Audio enhancement failed: {e}")
            return audio_path
    
    def get_processing_estimate(self, scene_count: int, total_duration: float) -> Dict[str, int]:
        """Get estimated processing times for AI pipeline"""
        # Base estimates in seconds
        base_times = {
            'analysis': 10,
            'prompt_generation': 15,
            'veo_generation': 60,
            'banana_processing': 45,
            'audio_enhancement': 20
        }
        
        # Scale by scene count and duration
        scale_factor = max(1, scene_count * (total_duration / 60))
        
        estimates = {}
        for stage, base_time in base_times.items():
            estimates[stage] = int(base_time * scale_factor)
        
        estimates['total'] = sum(estimates.values())
        return estimates

# Global AI pipeline instance
ai_pipeline = AIPipeline()