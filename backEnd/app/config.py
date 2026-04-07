import os
import boto3
from dotenv import load_dotenv

load_dotenv()

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# DynamoDB Table Names
USERS_TABLE = os.getenv("USERS_TABLE", "family-tree-users")
RELATIONS_TABLE = os.getenv("RELATIONS_TABLE", "family-tree-relations")

# Initialize DynamoDB resource
dynamodb = boto3.resource(
    'dynamodb',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

# Get table references
users_table = dynamodb.Table(USERS_TABLE)
relations_table = dynamodb.Table(RELATIONS_TABLE)

# Initialize S3 client for file uploads if needed
s3_client = boto3.client(
    's3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

print(f"✓ Connected to AWS Region: {AWS_REGION}")
print(f"✓ Users Table: {USERS_TABLE}")
print(f"✓ Relations Table: {RELATIONS_TABLE}")
