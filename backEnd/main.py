from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routes
from app.routes import users, relations, health

# Create FastAPI app
app = FastAPI(
    title="Family Tree API",
    description="AWS-powered Family Tree API using DynamoDB",
    version="1.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(relations.router, prefix="/api/relations", tags=["relations"])

@app.get("/")
async def root():
    return {
        "message": "Family Tree API",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("DEBUG", "False") == "True"
    )
