# Family Tree Backend API

A FastAPI-based REST API for the Family Tree application, powered by AWS services (DynamoDB, EC2, ALB, Auto Scaling).

## Quick Start

### Prerequisites

- Python 3.11+
- AWS Account with credentials configured
- Docker & Docker Compose (optional)

### Local Setup

```bash
# Clone repository
cd familyTree/backEnd

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your AWS credentials

# Run application
python main.py
```

The API will be available at `http://localhost:8000`

### Using Docker

```bash
# Build and run
docker-compose up

# Access API
# Swagger docs: http://localhost:8000/docs
# API: http://localhost:8000
```

## Project Structure

```
backEnd/
├── app/
│   ├── routes/
│   │   ├── health.py      # Health check endpoints
│   │   ├── users.py       # User profile management
│   │   └── relations.py   # Family relation management
│   ├── config.py          # AWS/DynamoDB configuration
│   ├── models.py          # Pydantic data models
│   └── __init__.py
├── main.py                # FastAPI application entry
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── AWS_SETUP.md          # AWS deployment guide
└── README.md             # This file
```

## API Endpoints

### Health & Status

- `GET /` - Service status
- `GET /api/health/` - Health check
- `GET /api/health/ready` - Readiness probe

### User Management

- `POST /api/users/` - Create new user
- `GET /api/users/{user_id}` - Retrieve user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Relations (Family Members)

- `POST /api/relations/{user_id}` - Add family member
- `GET /api/relations/{user_id}` - List all relations
- `GET /api/relations/{user_id}/{relation_id}` - Get specific relation
- `PUT /api/relations/{user_id}/{relation_id}` - Update relation
- `DELETE /api/relations/{user_id}/{relation_id}` - Delete relation

## Data Models

### User

```json
{
  "userId": "uuid",
  "firstName": "string",
  "middleName": "string",
  "lastName": "string",
  "email": "string",
  "dob": "string (YYYY-MM-DD)",
  "avatar": "string (URL)",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### Relation

```json
{
  "relationId": "uuid",
  "userId": "uuid",
  "name": "string",
  "firstName": "string",
  "middleName": "string",
  "lastName": "string",
  "email": "string",
  "type": "Father|Mother|Spouse|Son|Daughter|Brother|Sister",
  "linkedParent": "string (optional)",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## Features

✅ **AWS-Native Backend**

- FastAPI with async/await support
- DynamoDB for scalable NoSQL storage
- EC2 deployment with auto-scaling
- Application Load Balancer for high availability

✅ **RESTful API**

- Full CRUD operations for users and relations
- Standardized JSON responses
- Comprehensive error handling

✅ **Security**

- AWS IAM integration
- Environment-based configuration
- CORS support for frontend communication

✅ **Monitoring**

- Health check endpoints
- CloudWatch integration ready
- Docker health checks

✅ **Documentation**

- Swagger UI at `/docs`
- ReDoc at `/redoc`
- Comprehensive AWS setup guide

## Environment Variables

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
DYNAMODB_REGION=us-east-1
USERS_TABLE=family-tree-users
RELATIONS_TABLE=family-tree-relations
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Development

### Install Development Tools

```bash
pip install black flake8 pytest
```

### Format Code

```bash
black app/ main.py
```

### Lint Code

```bash
flake8 app/ main.py --max-line-length=120
```

### Run Tests (coming soon)

```bash
pytest
```

## AWS Deployment

For detailed AWS deployment instructions, including:

- DynamoDB table setup
- EC2 instance configuration
- Load Balancer setup
- Auto Scaling configuration
- CloudWatch monitoring

See [AWS_SETUP.md](./AWS_SETUP.md)

## Troubleshooting

### DynamoDB Connection Issues

```bash
# Test AWS credentials
aws sts get-caller-identity

# Verify tables exist
aws dynamodb list-tables

# Scan users table
aws dynamodb scan --table-name family-tree-users
```

### Application Issues

```bash
# Check logs
docker-compose logs api

# Test API
curl http://localhost:8000/api/health/

# View Swagger docs
# Open http://localhost:8000/docs in browser
```

## Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Boto3 (AWS SDK)](https://boto3.amazonaws.com/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS CLI](https://aws.amazon.com/cli/)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
