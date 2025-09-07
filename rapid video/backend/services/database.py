import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from sqlalchemy import create_engine, select, update, delete, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

from ..config import settings
from ..models.job import Job, JobDB, JobCreate, JobUpdate, JobStatus, ProcessingStage, Base

class DatabaseService:
    """Service for database operations"""
    
    def __init__(self):
        self.database_url = settings.DATABASE_URL
        self.engine = None
        self.async_engine = None
        self.session_factory = None
        self.async_session_factory = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database connections and create tables"""
        try:
            # Create synchronous engine for initial setup
            self.engine = create_engine(
                self.database_url,
                echo=settings.DEBUG,
                pool_pre_ping=True
            )
            
            # Create async engine for main operations
            async_url = self.database_url.replace('sqlite:///', 'sqlite+aiosqlite:///')
            self.async_engine = create_async_engine(
                async_url,
                echo=settings.DEBUG,
                pool_pre_ping=True
            )
            
            # Create session factories
            self.session_factory = sessionmaker(bind=self.engine)
            self.async_session_factory = async_sessionmaker(
                bind=self.async_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Create tables
            self._create_tables()
            
        except Exception as e:
            print(f"Warning: Failed to initialize database: {e}")
            raise
    
    def _create_tables(self):
        """Create database tables"""
        try:
            Base.metadata.create_all(bind=self.engine)
        except Exception as e:
            print(f"Warning: Failed to create tables: {e}")
    
    @asynccontextmanager
    async def get_session(self):
        """Get async database session"""
        async with self.async_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def create_job(self, job_data: JobCreate) -> Job:
        """Create a new job"""
        try:
            async with self.get_session() as session:
                # Create JobDB instance
                job_db = JobDB(
                    filename=job_data.filename,
                    file_path=job_data.file_path,
                    file_size=job_data.file_size,
                    status=JobStatus.PENDING,
                    stage=ProcessingStage.UPLOADING,
                    progress=0.0,
                    created_at=datetime.utcnow()
                )
                
                session.add(job_db)
                await session.flush()  # Get the ID
                
                # Convert to Pydantic model
                job = Job.from_orm(job_db)
                return job
                
        except SQLAlchemyError as e:
            raise Exception(f"Failed to create job: {str(e)}")
    
    async def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID"""
        try:
            async with self.get_session() as session:
                result = await session.execute(
                    select(JobDB).where(JobDB.id == job_id)
                )
                job_db = result.scalar_one_or_none()
                
                if job_db:
                    return Job.from_orm(job_db)
                return None
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to get job {job_id}: {e}")
            return None
    
    async def update_job(self, job_id: str, job_update: JobUpdate) -> Optional[Job]:
        """Update job with new data"""
        try:
            async with self.get_session() as session:
                # Get existing job
                result = await session.execute(
                    select(JobDB).where(JobDB.id == job_id)
                )
                job_db = result.scalar_one_or_none()
                
                if not job_db:
                    return None
                
                # Update fields
                update_data = job_update.dict(exclude_unset=True)
                for field, value in update_data.items():
                    if hasattr(job_db, field):
                        setattr(job_db, field, value)
                
                # Update timestamp
                job_db.updated_at = datetime.utcnow()
                
                # Mark as completed if status is completed
                if job_update.status == JobStatus.COMPLETED and not job_db.completed_at:
                    job_db.completed_at = datetime.utcnow()
                
                await session.flush()
                
                # Return updated job
                return Job.from_orm(job_db)
                
        except SQLAlchemyError as e:
            raise Exception(f"Failed to update job {job_id}: {str(e)}")
    
    async def delete_job(self, job_id: str) -> bool:
        """Delete job by ID"""
        try:
            async with self.get_session() as session:
                result = await session.execute(
                    delete(JobDB).where(JobDB.id == job_id)
                )
                
                return result.rowcount > 0
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to delete job {job_id}: {e}")
            return False
    
    async def list_jobs(
        self, 
        limit: int = 50, 
        offset: int = 0, 
        status: Optional[JobStatus] = None,
        stage: Optional[ProcessingStage] = None
    ) -> List[Job]:
        """List jobs with optional filtering"""
        try:
            async with self.get_session() as session:
                query = select(JobDB).order_by(JobDB.created_at.desc())
                
                # Apply filters
                if status:
                    query = query.where(JobDB.status == status)
                if stage:
                    query = query.where(JobDB.stage == stage)
                
                # Apply pagination
                query = query.offset(offset).limit(limit)
                
                result = await session.execute(query)
                jobs_db = result.scalars().all()
                
                # Convert to Pydantic models
                jobs = [Job.from_orm(job_db) for job_db in jobs_db]
                return jobs
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to list jobs: {e}")
            return []
    
    async def get_job_count(
        self, 
        status: Optional[JobStatus] = None,
        stage: Optional[ProcessingStage] = None
    ) -> int:
        """Get total count of jobs with optional filtering"""
        try:
            async with self.get_session() as session:
                query = select(func.count(JobDB.id))
                
                # Apply filters
                if status:
                    query = query.where(JobDB.status == status)
                if stage:
                    query = query.where(JobDB.stage == stage)
                
                result = await session.execute(query)
                count = result.scalar()
                
                return count or 0
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to get job count: {e}")
            return 0
    
    async def get_jobs_by_status(self, status: JobStatus) -> List[Job]:
        """Get all jobs with specific status"""
        return await self.list_jobs(status=status, limit=1000)
    
    async def get_processing_jobs(self) -> List[Job]:
        """Get all jobs currently being processed"""
        try:
            async with self.get_session() as session:
                query = select(JobDB).where(
                    JobDB.status.in_([JobStatus.PENDING, JobStatus.PROCESSING])
                ).order_by(JobDB.created_at)
                
                result = await session.execute(query)
                jobs_db = result.scalars().all()
                
                return [Job.from_orm(job_db) for job_db in jobs_db]
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to get processing jobs: {e}")
            return []
    
    async def get_failed_jobs(self, hours: int = 24) -> List[Job]:
        """Get jobs that failed within the last N hours"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            async with self.get_session() as session:
                query = select(JobDB).where(
                    JobDB.status == JobStatus.FAILED,
                    JobDB.updated_at >= cutoff_time
                ).order_by(JobDB.updated_at.desc())
                
                result = await session.execute(query)
                jobs_db = result.scalars().all()
                
                return [Job.from_orm(job_db) for job_db in jobs_db]
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to get failed jobs: {e}")
            return []
    
    async def cleanup_old_jobs(self, days: int = 30) -> int:
        """Clean up completed jobs older than specified days"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            async with self.get_session() as session:
                result = await session.execute(
                    delete(JobDB).where(
                        JobDB.status == JobStatus.COMPLETED,
                        JobDB.completed_at < cutoff_date
                    )
                )
                
                return result.rowcount
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to cleanup old jobs: {e}")
            return 0
    
    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        try:
            async with self.get_session() as session:
                # Get counts by status
                status_counts = {}
                for status in JobStatus:
                    result = await session.execute(
                        select(func.count(JobDB.id)).where(JobDB.status == status)
                    )
                    status_counts[status.value] = result.scalar() or 0
                
                # Get average processing time for completed jobs
                result = await session.execute(
                    select(func.avg(JobDB.processing_time)).where(
                        JobDB.status == JobStatus.COMPLETED,
                        JobDB.processing_time.isnot(None)
                    )
                )
                avg_processing_time = result.scalar()
                
                # Calculate success rate
                total_finished = status_counts[JobStatus.COMPLETED.value] + status_counts[JobStatus.FAILED.value]
                success_rate = (
                    status_counts[JobStatus.COMPLETED.value] / total_finished 
                    if total_finished > 0 else 0
                )
                
                # Get recent activity (last 24 hours)
                recent_cutoff = datetime.utcnow() - timedelta(hours=24)
                result = await session.execute(
                    select(func.count(JobDB.id)).where(JobDB.created_at >= recent_cutoff)
                )
                recent_jobs = result.scalar() or 0
                
                return {
                    'total_jobs': sum(status_counts.values()),
                    'status_counts': status_counts,
                    'success_rate': round(success_rate * 100, 2),
                    'average_processing_time': round(avg_processing_time or 0, 2),
                    'recent_jobs_24h': recent_jobs
                }
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to get processing stats: {e}")
            return {
                'total_jobs': 0,
                'status_counts': {},
                'success_rate': 0,
                'average_processing_time': 0,
                'recent_jobs_24h': 0,
                'error': str(e)
            }
    
    async def search_jobs(self, query: str, limit: int = 20) -> List[Job]:
        """Search jobs by filename or job ID"""
        try:
            async with self.get_session() as session:
                search_query = select(JobDB).where(
                    (JobDB.filename.contains(query)) |
                    (JobDB.id.contains(query))
                ).order_by(JobDB.created_at.desc()).limit(limit)
                
                result = await session.execute(search_query)
                jobs_db = result.scalars().all()
                
                return [Job.from_orm(job_db) for job_db in jobs_db]
                
        except SQLAlchemyError as e:
            print(f"Warning: Failed to search jobs: {e}")
            return []
    
    async def update_job_progress(self, job_id: str, stage: ProcessingStage, progress: float, **kwargs) -> Optional[Job]:
        """Update job progress and stage"""
        update_data = {
            'stage': stage,
            'progress': progress,
            'status': JobStatus.PROCESSING if progress < 1.0 else JobStatus.COMPLETED
        }
        
        # Add any additional fields
        update_data.update(kwargs)
        
        job_update = JobUpdate(**update_data)
        return await self.update_job(job_id, job_update)
    
    async def mark_job_failed(self, job_id: str, error_message: str) -> Optional[Job]:
        """Mark job as failed with error message"""
        job_update = JobUpdate(
            status=JobStatus.FAILED,
            error_message=error_message
        )
        return await self.update_job(job_id, job_update)
    
    async def mark_job_completed(self, job_id: str, output_path: str, output_url: Optional[str] = None) -> Optional[Job]:
        """Mark job as completed"""
        job_update = JobUpdate(
            status=JobStatus.COMPLETED,
            stage=ProcessingStage.COMPLETED,
            progress=1.0,
            output_path=output_path,
            output_url=output_url
        )
        return await self.update_job(job_id, job_update)
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            async with self.get_session() as session:
                # Simple query to test connection
                result = await session.execute(select(func.count(JobDB.id)))
                total_jobs = result.scalar()
                
                return {
                    'status': 'healthy',
                    'total_jobs': total_jobs,
                    'database_url': self.database_url.split('@')[0] + '@***',  # Hide credentials
                    'timestamp': datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    async def close(self):
        """Close database connections"""
        try:
            if self.async_engine:
                await self.async_engine.dispose()
            if self.engine:
                self.engine.dispose()
        except Exception as e:
            print(f"Warning: Error closing database connections: {e}")

# Global database service instance
database_service = DatabaseService()