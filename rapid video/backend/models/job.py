from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Float, Text, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()

class JobStatus(str, Enum):
    """Job processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ProcessingStage(str, Enum):
    """Current processing stage"""
    UPLOADING = "uploading"
    SPLITTING = "splitting"
    AI_PROCESSING = "ai_processing"
    RENDERING = "rendering"
    MERGING = "merging"
    COMPLETED = "completed"

class Job(BaseModel):
    """Pydantic model for job data"""
    id: str
    filename: str
    file_path: str
    status: JobStatus = JobStatus.PENDING
    stage: ProcessingStage = ProcessingStage.UPLOADING
    progress: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # File information
    file_size: Optional[int] = None
    video_duration: Optional[float] = None
    video_resolution: Optional[str] = None
    video_fps: Optional[float] = None
    
    # Processing results
    scene_count: Optional[int] = None
    scene_urls: Optional[List[str]] = None
    output_path: Optional[str] = None
    output_url: Optional[str] = None
    
    # Error handling
    error_message: Optional[str] = None
    retry_count: int = 0
    
    # AI processing metadata
    ai_prompts: Optional[List[str]] = None
    processing_time: Optional[float] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class JobDB(Base):
    """SQLAlchemy model for job persistence"""
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING, nullable=False)
    stage = Column(SQLEnum(ProcessingStage), default=ProcessingStage.UPLOADING, nullable=False)
    progress = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # File information
    file_size = Column(Float)
    video_duration = Column(Float)
    video_resolution = Column(String)
    video_fps = Column(Float)
    
    # Processing results
    scene_count = Column(Float)
    scene_urls = Column(JSON)
    output_path = Column(String)
    output_url = Column(String)
    
    # Error handling
    error_message = Column(Text)
    retry_count = Column(Float, default=0)
    
    # AI processing metadata
    ai_prompts = Column(JSON)
    processing_time = Column(Float)

class JobCreate(BaseModel):
    """Model for creating a new job"""
    filename: str
    file_path: str
    file_size: Optional[int] = None

class JobUpdate(BaseModel):
    """Model for updating job status"""
    status: Optional[JobStatus] = None
    stage: Optional[ProcessingStage] = None
    progress: Optional[float] = None
    scene_count: Optional[int] = None
    scene_urls: Optional[List[str]] = None
    output_path: Optional[str] = None
    output_url: Optional[str] = None
    error_message: Optional[str] = None
    ai_prompts: Optional[List[str]] = None
    processing_time: Optional[float] = None

class JobResponse(BaseModel):
    """Model for job API responses"""
    job_id: str
    filename: str
    status: JobStatus
    stage: ProcessingStage
    progress: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Optional fields based on status
    scene_urls: Optional[List[str]] = None
    download_url: Optional[str] = None
    error_message: Optional[str] = None
    
    # Video metadata
    video_duration: Optional[float] = None
    scene_count: Optional[int] = None
    processing_time: Optional[float] = None

class JobListResponse(BaseModel):
    """Model for job list API responses"""
    jobs: List[JobResponse]
    total: int
    limit: int
    offset: int

class ProcessingStats(BaseModel):
    """Model for processing statistics"""
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    processing_jobs: int
    average_processing_time: Optional[float] = None
    success_rate: float

# Helper functions
def create_job_from_upload(filename: str, file_path: str, file_size: Optional[int] = None) -> Job:
    """Create a new job from upload data"""
    return Job(
        id=str(uuid.uuid4()),
        filename=filename,
        file_path=file_path,
        file_size=file_size,
        status=JobStatus.PENDING,
        stage=ProcessingStage.UPLOADING,
        progress=0.0,
        created_at=datetime.utcnow()
    )

def update_job_progress(job: Job, stage: ProcessingStage, progress: float, **kwargs) -> Job:
    """Update job progress and stage"""
    job.stage = stage
    job.progress = progress
    job.updated_at = datetime.utcnow()
    
    # Update any additional fields
    for key, value in kwargs.items():
        if hasattr(job, key):
            setattr(job, key, value)
    
    return job

def complete_job(job: Job, output_path: str, output_url: Optional[str] = None) -> Job:
    """Mark job as completed"""
    job.status = JobStatus.COMPLETED
    job.stage = ProcessingStage.COMPLETED
    job.progress = 1.0
    job.output_path = output_path
    job.output_url = output_url
    job.completed_at = datetime.utcnow()
    job.updated_at = datetime.utcnow()
    
    return job

def fail_job(job: Job, error_message: str) -> Job:
    """Mark job as failed"""
    job.status = JobStatus.FAILED
    job.error_message = error_message
    job.updated_at = datetime.utcnow()
    
    return job

def get_stage_description(stage: ProcessingStage) -> str:
    """Get human-readable description for processing stage"""
    descriptions = {
        ProcessingStage.UPLOADING: "Uploading video file",
        ProcessingStage.SPLITTING: "Splitting video into scenes",
        ProcessingStage.AI_PROCESSING: "AI analyzing and generating prompts",
        ProcessingStage.RENDERING: "Generating 3D animations",
        ProcessingStage.MERGING: "Merging final video with audio",
        ProcessingStage.COMPLETED: "Processing completed successfully"
    }
    return descriptions.get(stage, "Processing...")

def get_estimated_time(stage: ProcessingStage, video_duration: Optional[float] = None) -> Optional[int]:
    """Get estimated processing time in seconds for each stage"""
    if not video_duration:
        video_duration = 60  # Default 1 minute
    
    # Base estimates per minute of video
    estimates = {
        ProcessingStage.UPLOADING: 10,
        ProcessingStage.SPLITTING: 15,
        ProcessingStage.AI_PROCESSING: 30,
        ProcessingStage.RENDERING: 120,  # Most time-consuming
        ProcessingStage.MERGING: 20
    }
    
    base_time = estimates.get(stage, 30)
    return int(base_time * (video_duration / 60))