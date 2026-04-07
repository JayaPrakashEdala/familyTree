from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint for EC2 load balancer"""
    return {
        "status": "healthy",
        "service": "Family Tree API",
        "region": os.getenv("AWS_REGION", "us-east-1")
    }

@router.get("/ready")
async def readiness_check():
    """Readiness probe - checks if service is fully initialized"""
    try:
        from app.config import users_table, relations_table
        # Try to describe tables to verify DynamoDB connection
        users_table.table_status
        relations_table.table_status
        return {"status": "ready", "message": "Service initialized and ready"}
    except Exception as e:
        return {"status": "not-ready", "error": str(e)}
