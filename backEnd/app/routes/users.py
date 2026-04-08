from fastapi import APIRouter, HTTPException, status
from app.models import UserCreate, UserUpdate, User, SuccessResponse
from app.config import users_table
from datetime import datetime
import uuid
from botocore.exceptions import ClientError

router = APIRouter()

def user_to_dict(item):
    """Convert DynamoDB item to dict"""
    if not item:
        return None
    return {
        "userId": item.get("userId"),
        "firstName": item.get("firstName"),
        "middleName": item.get("middleName"),
        "lastName": item.get("lastName"),
        "email": item.get("email"),
        "dob": item.get("dob"),
        "avatar": item.get("avatar"),
        "createdAt": item.get("createdAt"),
        "updatedAt": item.get("updatedAt")
    }

@router.post("/", response_model=SuccessResponse)
async def create_user(user: UserCreate):
    """Create a new user profile or return existing user if already exists (by Google Sub)"""
    try:
        # Use Google's unique subject identifier for lookup (not email)
        # This ensures users are identified by their Google account, not email
        google_sub = user.googleSub
        
        # Try to query by googleSub using GSI if available
        existing_user = None
        try:
            response = users_table.query(
                IndexName="googleSubIndex",
                KeyConditionExpression="googleSub = :sub",
                ExpressionAttributeValues={":sub": google_sub}
            )
            if response.get("Items") and len(response["Items"]) > 0:
                existing_user = response["Items"][0]
                print(f"✓ User found via GSI (googleSub): {existing_user.get('userId')}")
        except ClientError as e:
            # GSI doesn't exist yet, fall back to scan
            print(f"GSI not available, falling back to scan: {e}")
            response = users_table.scan(
                FilterExpression="attribute_exists(googleSub) AND googleSub = :sub",
                ExpressionAttributeValues={":sub": google_sub}
            )
            if response.get("Items") and len(response["Items"]) > 0:
                existing_user = response["Items"][0]
                print(f"✓ User found via scan (googleSub): {existing_user.get('userId')}")
        
        # If user exists, return existing user
        if existing_user:
            return SuccessResponse(
                success=True,
                message="User already exists",
                data=user_to_dict(existing_user)
            )
        
        # Create new user
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        user_item = {
            "userId": user_id,
            "googleSub": google_sub,
            "email": user.email.lower().strip(),
            "firstName": user.firstName,
            "middleName": user.middleName or "",
            "lastName": user.lastName,
            "dob": user.dob or "",
            "avatar": user.avatar or "",
            "createdAt": now,
            "updatedAt": now
        }
        
        users_table.put_item(Item=user_item)
        print(f"✓ New user created: {user_id} (googleSub: {google_sub})")
        
        return SuccessResponse(
            success=True,
            message="User created successfully",
            data=user_to_dict(user_item)
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.get("/{user_id}", response_model=SuccessResponse)
async def get_user(user_id: str):
    """Get user profile by ID"""
    try:
        response = users_table.get_item(Key={"userId": user_id})
        
        if "Item" not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return SuccessResponse(
            success=True,
            message="User retrieved successfully",
            data=user_to_dict(response["Item"])
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.put("/{user_id}", response_model=SuccessResponse)
async def update_user(user_id: str, user_update: UserUpdate):
    """Update user profile"""
    try:
        # Check if user exists
        response = users_table.get_item(Key={"userId": user_id})
        if "Item" not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build update expression
        update_parts = []
        expr_attr_vals = {}
        now = datetime.utcnow().isoformat()
        
        if user_update.firstName is not None:
            update_parts.append("firstName = :fn")
            expr_attr_vals[":fn"] = user_update.firstName
        if user_update.middleName is not None:
            update_parts.append("middleName = :mn")
            expr_attr_vals[":mn"] = user_update.middleName
        if user_update.lastName is not None:
            update_parts.append("lastName = :ln")
            expr_attr_vals[":ln"] = user_update.lastName
        if user_update.dob is not None:
            update_parts.append("dob = :dob")
            expr_attr_vals[":dob"] = user_update.dob
        if user_update.avatar is not None:
            update_parts.append("avatar = :avatar")
            expr_attr_vals[":avatar"] = user_update.avatar
        
        update_parts.append("updatedAt = :updated")
        expr_attr_vals[":updated"] = now
        
        update_expression = "SET " + ", ".join(update_parts)
        
        response = users_table.update_item(
            Key={"userId": user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_vals,
            ReturnValues="ALL_NEW"
        )
        
        return SuccessResponse(
            success=True,
            message="User updated successfully",
            data=user_to_dict(response["Attributes"])
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.delete("/{user_id}", response_model=SuccessResponse)
async def delete_user(user_id: str):
    """Delete user profile"""
    try:
        # Check if user exists
        response = users_table.get_item(Key={"userId": user_id})
        if "Item" not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        users_table.delete_item(Key={"userId": user_id})
        
        return SuccessResponse(
            success=True,
            message="User deleted successfully"
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )
