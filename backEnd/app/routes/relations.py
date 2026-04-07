from fastapi import APIRouter, HTTPException, status
from app.models import RelationCreate, RelationUpdate, SuccessResponse
from app.config import relations_table, users_table
from datetime import datetime
import uuid
from botocore.exceptions import ClientError

router = APIRouter()

def relation_to_dict(item):
    """Convert DynamoDB item to dict"""
    if not item:
        return None
    return {
        "relationId": item.get("relationId"),
        "userId": item.get("userId"),
        "name": item.get("name"),
        "firstName": item.get("firstName"),
        "middleName": item.get("middleName"),
        "lastName": item.get("lastName"),
        "email": item.get("email"),
        "type": item.get("type"),
        "linkedParent": item.get("linkedParent"),
        "createdAt": item.get("createdAt"),
        "updatedAt": item.get("updatedAt")
    }

@router.post("/{user_id}", response_model=SuccessResponse)
async def add_relation(user_id: str, relation: RelationCreate):
    """Add a relation to user's family tree"""
    try:
        # Verify user exists
        user_response = users_table.get_item(Key={"userId": user_id})
        if "Item" not in user_response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        relation_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        relation_item = {
            "relationId": relation_id,
            "userId": user_id,
            "name": relation.name or f"{relation.firstName} {relation.lastName}".strip(),
            "firstName": relation.firstName,
            "middleName": relation.middleName or "",
            "lastName": relation.lastName,
            "email": relation.email or "",
            "type": relation.type,
            "linkedParent": relation.linkedParent or "",
            "createdAt": now,
            "updatedAt": now
        }
        
        relations_table.put_item(Item=relation_item)
        
        return SuccessResponse(
            success=True,
            message="Relation added successfully",
            data=relation_to_dict(relation_item)
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.get("/{user_id}", response_model=SuccessResponse)
async def get_relations(user_id: str):
    """Get all relations for a user"""
    try:
        # Verify user exists
        user_response = users_table.get_item(Key={"userId": user_id})
        if "Item" not in user_response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Query relations by userId (requires GSI setup)
        response = relations_table.scan(
            FilterExpression="userId = :uid",
            ExpressionAttributeValues={":uid": user_id}
        )
        
        relations = [relation_to_dict(item) for item in response.get("Items", [])]
        
        return SuccessResponse(
            success=True,
            message="Relations retrieved successfully",
            data={"relations": relations, "count": len(relations)}
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.get("/{user_id}/{relation_id}", response_model=SuccessResponse)
async def get_relation(user_id: str, relation_id: str):
    """Get a specific relation"""
    try:
        response = relations_table.get_item(Key={"relationId": relation_id})
        
        if "Item" not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relation not found"
            )
        
        item = response["Item"]
        if item.get("userId") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized"
            )
        
        return SuccessResponse(
            success=True,
            message="Relation retrieved successfully",
            data=relation_to_dict(item)
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.put("/{user_id}/{relation_id}", response_model=SuccessResponse)
async def update_relation(user_id: str, relation_id: str, relation_update: RelationUpdate):
    """Update a relation"""
    try:
        # Get existing relation
        response = relations_table.get_item(Key={"relationId": relation_id})
        
        if "Item" not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relation not found"
            )
        
        item = response["Item"]
        if item.get("userId") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized"
            )
        
        # Build update expression
        update_parts = []
        expr_attr_vals = {}
        now = datetime.utcnow().isoformat()
        
        if relation_update.name is not None:
            update_parts.append("name = :name")
            expr_attr_vals[":name"] = relation_update.name
        if relation_update.firstName is not None:
            update_parts.append("firstName = :fn")
            expr_attr_vals[":fn"] = relation_update.firstName
        if relation_update.middleName is not None:
            update_parts.append("middleName = :mn")
            expr_attr_vals[":mn"] = relation_update.middleName
        if relation_update.lastName is not None:
            update_parts.append("lastName = :ln")
            expr_attr_vals[":ln"] = relation_update.lastName
        if relation_update.email is not None:
            update_parts.append("email = :email")
            expr_attr_vals[":email"] = relation_update.email
        if relation_update.type is not None:
            update_parts.append("type = :type")
            expr_attr_vals[":type"] = relation_update.type
        
        update_parts.append("updatedAt = :updated")
        expr_attr_vals[":updated"] = now
        
        update_expression = "SET " + ", ".join(update_parts)
        
        response = relations_table.update_item(
            Key={"relationId": relation_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_vals,
            ReturnValues="ALL_NEW"
        )
        
        return SuccessResponse(
            success=True,
            message="Relation updated successfully",
            data=relation_to_dict(response["Attributes"])
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )

@router.delete("/{user_id}/{relation_id}", response_model=SuccessResponse)
async def delete_relation(user_id: str, relation_id: str):
    """Delete a relation"""
    try:
        # Get existing relation
        response = relations_table.get_item(Key={"relationId": relation_id})
        
        if "Item" not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relation not found"
            )
        
        item = response["Item"]
        if item.get("userId") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized"
            )
        
        relations_table.delete_item(Key={"relationId": relation_id})
        
        return SuccessResponse(
            success=True,
            message="Relation deleted successfully"
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"DynamoDB error: {e.response['Error']['Message']}"
        )
