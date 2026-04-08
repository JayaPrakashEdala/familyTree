from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

# User Models
class UserProfile(BaseModel):
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    email: EmailStr
    dob: Optional[str] = None
    avatar: Optional[str] = None

class User(UserProfile):
    userId: str
    createdAt: str
    updatedAt: str

class UserCreate(UserProfile):
    pass

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    lastName: Optional[str] = None
    dob: Optional[str] = None
    avatar: Optional[str] = None

# Relation Models
class RelationCreate(BaseModel):
    name: Optional[str] = None
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    email: Optional[str] = None
    type: str  # Father, Mother, Spouse, Son, Daughter, Brother, Sister
    linkedParent: Optional[str] = None

class Relation(RelationCreate):
    relationId: str
    userId: str
    createdAt: str
    updatedAt: str

class RelationUpdate(BaseModel):
    name: Optional[str] = None
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    type: Optional[str] = None

# Response Models
class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool
    error: str
    details: Optional[dict] = None
