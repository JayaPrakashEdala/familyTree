# Family Tree Backend - AWS Setup Guide

## Overview

This is a FastAPI-based backend for the Family Tree application, fully integrated with AWS services:

- **DynamoDB** - NoSQL database for users and relations
- **EC2** - Compute instances for application hosting
- **Auto Scaling** - Automatic scaling based on demand
- **Application Load Balancer (ALB)** - Load distribution and health checks
- **CloudWatch** - Monitoring and logging
- **IAM** - Security and access control

## Prerequisites

### Local Setup

```bash
# Install Python 3.11+
python --version

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### AWS Account Setup

1. Create AWS Account or use existing one
2. Install AWS CLI

```bash
# Install AWS CLI v2
# https://aws.amazon.com/cli/

# Configure credentials
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Default region (us-east-1 recommended)
```

## DynamoDB Setup

### Create Users Table

```bash
aws dynamodb create-table \
  --table-name family-tree-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Create Relations Table

```bash
aws dynamodb create-table \
  --table-name family-tree-relations \
  --attribute-definitions \
    AttributeName=relationId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=relationId,KeyType=HASH \
    AttributeName=userId,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=userIdIndex,Keys=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Verify Tables

```bash
aws dynamodb list-tables --region us-east-1
```

## Environment Configuration

1. Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

2. Update `.env` with your AWS credentials:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_REGION=us-east-1
USERS_TABLE=family-tree-users
RELATIONS_TABLE=family-tree-relations
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Local Development

### Run with Docker Compose

```bash
# Build and run
docker-compose up

# API will be available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Run without Docker

```bash
# Activate virtual environment
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# Run the application
python main.py

# API will be available at http://localhost:8000
```

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## EC2 Deployment

### Step 1: Create EC2 Instance

```bash
# Launch EC2 instance (Ubuntu 22.04 LTS recommended)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-groups family-tree-api \
  --region us-east-1
```

### Step 2: Security Group Setup

```bash
# Create security group
aws ec2 create-security-group \
  --group-name family-tree-api \
  --description "Family Tree API Security Group" \
  --region us-east-1

# Allow inbound traffic on port 8000
aws ec2 authorize-security-group-ingress \
  --group-name family-tree-api \
  --protocol tcp \
  --port 8000 \
  --cidr 0.0.0.0/0 \
  --region us-east-1

# Allow SSH
aws ec2 authorize-security-group-ingress \
  --group-name family-tree-api \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 \
  --region us-east-1
```

### Step 3: EC2 Instance Setup

SSH into your EC2 instance:

```bash
ssh -i your-key-pair.pem ubuntu@your-instance-ip
```

On the EC2 instance, run:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone https://github.com/your-repo/familyTree.git
cd familyTree/backEnd

# Copy .env file (update with your credentials)
nano .env
# Paste and save your AWS credentials

# Start application
docker-compose up -d

# Check logs
docker-compose logs -f api
```

### Step 4: Application Load Balancer (ALB) Setup

```bash
# Create target group
aws elbv2 create-target-group \
  --name family-tree-api-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxxx \
  --health-check-path /api/health/ \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create load balancer
aws elbv2 create-load-balancer \
  --name family-tree-api-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Register EC2 instance with target group
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-xxxxx
```

### Step 5: Auto Scaling (Optional)

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name family-tree-api-template \
  --version-description "Family Tree API Launch Template" \
  --launch-template-data '{...}'

# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name family-tree-api-asg \
  --launch-template LaunchTemplateName=family-tree-api-template \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

## Monitoring and Logs

### CloudWatch Logs

```bash
# View logs
aws logs tail /family-tree/api --follow

# Create log group
aws logs create-log-group --log-group-name /family-tree/api
```

### CloudWatch Metrics

Monitor in AWS Console:

- CPU Utilization
- Network In/Out
- DynamoDB Read/Write Capacity
- ALB Request Count

## API Endpoints

### Health Check

- `GET /api/health/` - Service health status
- `GET /api/health/ready` - Readiness probe

### User Management

- `POST /api/users/` - Create user
- `GET /api/users/{user_id}` - Get user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Relations Management

- `POST /api/relations/{user_id}` - Add relation
- `GET /api/relations/{user_id}` - Get all relations
- `GET /api/relations/{user_id}/{relation_id}` - Get specific relation
- `PUT /api/relations/{user_id}/{relation_id}` - Update relation
- `DELETE /api/relations/{user_id}/{relation_id}` - Delete relation

## Troubleshooting

### DynamoDB Connection Issues

```bash
# Test DynamoDB connection
aws dynamodb scan --table-name family-tree-users --region us-east-1

# Check IAM permissions
aws iam get-user

# List DynamoDB tables
aws dynamodb list-tables
```

### Application Logs

```bash
# Docker logs
docker-compose logs api

# EC2 System logs
aws ec2 get-console-output --instance-id i-xxxxx

# Application traces
# Check /var/log/syslog on EC2
```

### Common Issues

**Error: Invalid table name**

- Ensure table names match in .env and AWS

**Error: Access Denied**

- Verify AWS credentials have DynamoDB permissions
- Check IAM policy: `AmazonDynamoDBFullAccess`

**Error: Connection timeout**

- Check security group inbound rules
- Verify EC2 instance is running
- Test with: `curl http://instance-ip:8000/api/health/`

## Cost Optimization

### DynamoDB

- Using **PAY_PER_REQUEST** billing (on-demand)
- Alternative: **PROVISIONED** billing for predictable traffic
- Enable Point-in-Time Recovery (PITR) for backups

### EC2

- Use **t3.micro** for low traffic (Free Tier eligible)
- Enable **Auto Scaling** to handle spikes
- Use **Spot Instances** for 70% cost savings

### Data Transfer

- Use **VPC Endpoints** for private DynamoDB access (no data transfer costs)
- CloudFront CDN for frontend assets

## Security Best Practices

1. **IAM Roles**
   - Attach least-privilege policy to EC2 instances
   - Use IAM roles instead of hardcoded credentials

2. **Environment Variables**
   - Never commit `.env` file to version control
   - Use AWS Secrets Manager for sensitive data

3. **DynamoDB Encryption**
   - Enable encryption at rest (default)
   - Enable Point-in-Time Recovery

4. **Network Security**
   - Use security groups to restrict traffic
   - Enable VPC Flow Logs for monitoring

5. **API Security**
   - Enable CORS properly (not 0.0.0.0 in production)
   - Validate Google OAuth tokens on backend
   - Rate limiting on API endpoints

## Production Deployment Checklist

- [ ] DynamoDB tables created and indexed
- [ ] IAM roles and policies configured
- [ ] EC2 security groups configured
- [ ] Application Load Balancer set up
- [ ] Auto Scaling configured
- [ ] CloudWatch monitoring enabled
- [ ] CloudWatch alarms created
- [ ] Backup strategy implemented
- [ ] SSL/TLS certificate (via AWS Certificate Manager)
- [ ] Domain name configured (via Route 53)
- [ ] Error logging to CloudWatch
- [ ] Performance monitoring set up
- [ ] Disaster recovery plan documented

## Resources

- [AWS FastAPI Documentation](https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-python/?ref=gsrchandson)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
