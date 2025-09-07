from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class VideoStatus(str, Enum):
    """Video processing status enumeration"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    SCENE_SPLITTING = "scene_splitting"
    SCENE_SPLIT_COMPLETE = "scene_split_complete"
    AI_CONVERSION = "ai_conversion"
    AI_CONVERSION_COMPLETE = "ai_conversion_complete"
    MERGING = "merging"
    COMPLETED = "completed"
    ERROR = "error"
    CANCELLED = "cancelled"

class AIStatus(str, Enum):
    """AI processing status for individual scenes"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class SceneAnalysis(BaseModel):
    """AI analysis results for a video scene"""
    scene_type: str = Field(description="Type of scene (indoor, outdoor, etc.)")
    objects: List[str] = Field(default=[], description="Detected objects in the scene")
    lighting: str = Field(description="Lighting conditions")
    camera_movement: str = Field(description="Camera movement type")
    depth_complexity: str = Field(description="Complexity of depth in the scene")
    recommended_3d_style: str = Field(description="Recommended 3D conversion style")
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0, description="AI confidence score")

class VideoScene(BaseModel):
    """Individual video scene data"""
    scene_id: str = Field(description="Unique scene identifier")
    file_path: str = Field(description="Path to the scene file")
    start_time: float = Field(ge=0.0, description="Start time in original video")
    duration: float = Field(gt=0.0, description="Duration of the scene")
    status: str = Field(default="ready_for_ai", description="Scene processing status")
    ai_status: AIStatus = Field(default=AIStatus.PENDING, description="AI processing status")
    output_file: Optional[str] = Field(None, description="Path to processed 3D scene")
    scene_analysis: Optional[SceneAnalysis] = Field(None, description="AI analysis results")
    processing_time: Optional[datetime] = Field(None, description="When AI processing completed")
    ai_services_used: List[str] = Field(default=[], description="List of AI services used")
    error_message: Optional[str] = Field(None, description="Error message if processing failed")

class VideoInfo(BaseModel):
    """Video file information"""
    duration: float = Field(gt=0.0, description="Video duration in seconds")
    size: int = Field(gt=0, description="File size in bytes")
    bitrate: int = Field(ge=0, description="Video bitrate")
    format_name: str = Field(description="Video format")
    width: int = Field(gt=0, description="Video width")
    height: int = Field(gt=0, description="Video height")
    fps: float = Field(gt=0.0, description="Frames per second")
    has_audio: bool = Field(description="Whether video has audio track")
    audio_codec: Optional[str] = Field(None, description="Audio codec if present")

class VideoJob(BaseModel):
    """Main video processing job model"""
    id: str = Field(description="Unique job identifier")
    user_id: str = Field(description="User who created the job")
    filename: str = Field(description="Original filename")
    file_size: int = Field(gt=0, description="File size in bytes")
    duration: float = Field(gt=0.0, description="Video duration in seconds")
    cost: float = Field(ge=0.0, description="Processing cost in USD")
    status: VideoStatus = Field(default=VideoStatus.UPLOADED, description="Overall job status")
    stage: str = Field(description="Current processing stage")
    progress: float = Field(default=0.0, ge=0.0, le=100.0, description="Progress percentage")
    created_at: datetime = Field(description="Job creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")
    completed_at: Optional[datetime] = Field(None, description="Job completion timestamp")
    temp_file_path: str = Field(description="Temporary file path")
    scenes: List[VideoScene] = Field(default=[], description="List of video scenes")
    total_scenes: int = Field(default=0, ge=0, description="Total number of scenes")
    final_video_path: Optional[str] = Field(None, description="Path to final processed video")
    download_url: Optional[str] = Field(None, description="Signed download URL")
    error_message: Optional[str] = Field(None, description="Error message if job failed")
    video_info: Optional[VideoInfo] = Field(None, description="Video file information")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserQuota(BaseModel):
    """User quota and payment information"""
    user_id: str = Field(description="Unique user identifier")
    first_video_used: bool = Field(default=False, description="Whether user used free first video")
    videos_created: int = Field(default=0, ge=0, description="Total videos created")
    balance_paid: float = Field(default=0.0, ge=0.0, description="Total amount paid")
    subscription_active: bool = Field(default=False, description="Whether user has active subscription")
    created_at: datetime = Field(description="User creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")
    last_payment_at: Optional[datetime] = Field(None, description="Last payment timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PaymentTransaction(BaseModel):
    """Payment transaction record"""
    id: Optional[str] = Field(None, description="Transaction ID")
    user_id: str = Field(description="User who made the payment")
    payment_intent_id: str = Field(description="Stripe payment intent ID")
    amount: float = Field(gt=0.0, description="Payment amount in USD")
    currency: str = Field(default="usd", description="Payment currency")
    video_duration: float = Field(gt=0.0, description="Duration of video being paid for")
    status: PaymentStatus = Field(description="Payment status")
    created_at: datetime = Field(description="Transaction creation timestamp")
    stripe_data: Optional[Dict[str, Any]] = Field(None, description="Additional Stripe data")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UploadRequest(BaseModel):
    """Video upload request"""
    user_id: Optional[str] = Field(None, description="User ID (optional for anonymous uploads)")
    filename: str = Field(description="Original filename")
    content_type: str = Field(description="File content type")
    file_size: int = Field(gt=0, description="File size in bytes")

class UploadResponse(BaseModel):
    """Video upload response"""
    job_id: str = Field(description="Created job ID")
    filename: str = Field(description="Original filename")
    duration: float = Field(description="Video duration")
    cost: float = Field(description="Processing cost")
    message: str = Field(description="Response message")

class ProcessingStatusResponse(BaseModel):
    """Processing status response"""
    job_id: str = Field(description="Job ID")
    status: VideoStatus = Field(description="Current status")
    stage: str = Field(description="Current processing stage")
    progress: float = Field(description="Progress percentage")
    created_at: datetime = Field(description="Job creation time")
    updated_at: datetime = Field(description="Last update time")
    error_message: Optional[str] = Field(None, description="Error message if any")
    download_url: Optional[str] = Field(None, description="Download URL if completed")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SceneSplitResponse(BaseModel):
    """Scene splitting response"""
    job_id: str = Field(description="Job ID")
    total_scenes: int = Field(description="Total number of scenes created")
    scenes: List[VideoScene] = Field(description="List of created scenes")
    message: str = Field(description="Response message")

class AIConversionResponse(BaseModel):
    """AI conversion response"""
    job_id: str = Field(description="Job ID")
    converted_scenes: int = Field(description="Number of successfully converted scenes")
    total_scenes: int = Field(description="Total number of scenes")
    message: str = Field(description="Response message")

class MergeResponse(BaseModel):
    """Video merge response"""
    job_id: str = Field(description="Job ID")
    download_url: str = Field(description="Download URL for final video")
    final_video_path: str = Field(description="Path to final video")
    total_scenes_merged: int = Field(description="Number of scenes merged")
    message: str = Field(description="Response message")

class QuotaResponse(BaseModel):
    """User quota response"""
    user_id: str = Field(description="User ID")
    first_video_used: bool = Field(description="Whether first free video was used")
    videos_created: int = Field(description="Total videos created")
    balance_paid: float = Field(description="Total amount paid")
    subscription_active: bool = Field(description="Subscription status")
    can_create_free_video: bool = Field(description="Whether user can create free video")
    can_create_paid_video: bool = Field(description="Whether user can create paid video")
    last_payment_at: Optional[datetime] = Field(None, description="Last payment timestamp")
    created_at: Optional[datetime] = Field(None, description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str = Field(description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    code: Optional[str] = Field(None, description="Error code")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }