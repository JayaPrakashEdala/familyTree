# Frontend-Backend Connection Guide

## 🔗 Setup Complete

Your frontend is now configured to connect with your EC2 backend at `http://3.237.47.234:8000`

## ✅ What Was Updated

### 1. **API Service Layer** (`src/apiService.js`)

- Created a centralized API service for all backend calls
- Handles all HTTP requests to the backend
- Includes error handling and response parsing

### 2. **Frontend Configuration** (`.env`)

```env
VITE_API_URL=http://3.237.47.234:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. **Authentication Flow** (`App.jsx`)

- **Login**: Creates/fetches user from backend DynamoDB
- **Add Relation**: Stores new family members in backend
- **Delete Relation**: Removes relations from backend
- **Load Relations**: Fetches all family members on login

### 4. **Updated Data Model**

Frontend now uses backend response format:

- `relationId` (instead of local `id`)
- `userId` for tracking user ownership
- All relations stored and retrieved from DynamoDB

## 🚀 Running the Frontend

### Prerequisites

```bash
cd frontEnd
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or your configured port)

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 API Flow

### 1. **User Login**

```
Frontend (Google OAuth)
  → App decodes token
  → Sends user data to backend
  → Backend creates user in DynamoDB
  → Backend returns userId
  → Frontend loads user's relations
```

### 2. **Add Family Member**

```
User fills form
  → Frontend validates data
  → Sends to backend API: POST /api/relations/{userId}
  → Backend creates record in DynamoDB
  → Returns new relation with relationId
  → Frontend updates state with response
```

### 3. **Delete Family Member**

```
User clicks remove
  → Frontend calls: DELETE /api/relations/{userId}/{relationId}
  → Backend deletes from DynamoDB
  → Frontend removes from local state
```

### 4. **View Family Tree**

```
Relations loaded from backend on login
  → Automatically builds tree visualization
  → Shows all family connections
  → Updates in real-time
```

## 🔍 Troubleshooting

### Issue: "Failed to login. Please check backend connection."

**Solution 1: Verify backend is running**

```bash
# Test backend from command line
curl http://3.237.47.234:8000/api/health/
# Should return: {"status": "healthy", ...}
```

**Solution 2: Check CORS configuration**

- Ensure EC2 backend has frontend URL in `ALLOWED_ORIGINS`
- Update backend `.env`:
  ```
  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
  ```

**Solution 3: Check firewall/security groups**

- Verify EC2 security group allows port 8000 inbound
- Test connectivity: `telnet 3.237.47.234 8000`

### Issue: "Relations not loading"

**Check:**

1. User was created successfully (check CloudWatch logs)
2. Backend DynamoDB table `family-tree-relations` has records
3. No CORS errors in browser console
4. Backend is returning data: `curl http://3.237.47.234:8000/api/relations/{userId}`

### Issue: "CORS Error"

**Solution:** Backend CORS configuration

Edit backend `.env`:

```
ALLOWED_ORIGINS=http://localhost:5173,http://3.237.47.234:3000
```

Then restart backend:

```bash
docker-compose restart api
# or on EC2:
docker-compose down && docker-compose up -d
```

## 💾 Frontend Storage

Data is now **fully stored in AWS DynamoDB** via backend. No local storage used.

- ✅ User profiles persisted
- ✅ Family relations persisted
- ✅ Changes sync to backend
- ✅ Data available across sessions

## 📡 Network Communication

```
Frontend (Browser)
    ↓ (HTTP/CORS)
    ↓
Backend API (EC2 Port 8000)
    ↓
DynamoDB Tables
    ├── family-tree-users
    └── family-tree-relations
```

## 🔐 Security Notes

1. **Auth Token**: Currently uses Google OAuth credential in browser
   - Consider adding backend token validation
   - Implement refresh token mechanism for production

2. **DynamoDB Access**:
   - Only through backend API
   - IAM roles control permissions
   - No direct client-to-DynamoDB access

3. **Environment Variables**:
   - `.env` file is in `.gitignore` (don't commit)
   - Backend credentials never exposed to frontend

## 📝 API Response Format

All responses follow this format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "userId": "uuid",
    "firstName": "John",
    "email": "john@example.com"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "details": {}
}
```

## 🧪 Testing Connection

### Test 1: Check Backend Health

```bash
curl http://3.237.47.234:8000/api/health/
```

### Test 2: Create Test User

```bash
curl -X POST http://3.237.47.234:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "dob": "1990-01-01"
  }'
```

### Test 3: Get User Relations

```bash
curl http://3.237.47.234:8000/api/relations/{userId}
```

## 📚 API Endpoints Reference

| Method | Endpoint                               | Purpose              |
| ------ | -------------------------------------- | -------------------- |
| GET    | `/api/health/`                         | Check backend status |
| POST   | `/api/users/`                          | Create user          |
| GET    | `/api/users/{userId}`                  | Get user profile     |
| PUT    | `/api/users/{userId}`                  | Update user          |
| POST   | `/api/relations/{userId}`              | Add family member    |
| GET    | `/api/relations/{userId}`              | List all relations   |
| DELETE | `/api/relations/{userId}/{relationId}` | Remove relation      |

## 🔄 Syncing Data

To ensure data consistency:

1. **On Login**: Frontend fetches all user relations
2. **On Add/Delete**: Frontend immediately updates local state
3. **On Logout**: Frontend clears cached data
4. **On Page Refresh**: Fresh data loaded from backend

## 🎯 Next Steps

1. ✅ Test login with Google OAuth
2. ✅ Add a family member and verify it appears in tree
3. ✅ Check DynamoDB to see stored data:
   ```bash
   aws dynamodb scan --table-name family-tree-relations --region us-east-1
   ```
4. ✅ Monitor CloudWatch logs for errors
5. ✅ Deploy frontend (Netlify, Vercel, S3)

## 📞 Support

For issues:

1. Check browser console for errors (F12 → Console)
2. Check backend logs: `docker-compose logs api`
3. Check AWS CloudWatch: Monitor → Logs
4. Verify DynamoDB tables exist and have data

---

**Backend URL**: http://3.237.47.234:8000
**Frontend runs locally at**: http://localhost:5173
