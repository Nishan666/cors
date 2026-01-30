# CORS Demo with DynamoDB

## 🌐 Live URLs

**Frontend:** http://cors-488431.s3-website-us-east-1.amazonaws.com  
**API:** https://3bukmo18b0.execute-api.us-east-1.amazonaws.com

---

## Setup

### 1. Deploy DynamoDB with Terraform
```bash
cd backend/terraform
terraform init
terraform apply
```

### 2. Configure Backend
```bash
cd backend
npm install

# Update .env with your JWT secret
# Make sure AWS credentials are configured
```

### 3. Start Backend
```bash
cd backend
npm start
# Runs on port 5000
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on port 3000
```

## CORS Configuration

- **localhost:3000** - Can only POST to `/api/create` and `/api/login`
- **localhost:5000** - Can access all endpoints (GET, POST, PUT, DELETE)

## API Endpoints

- `POST /api/create` - Create user (name, message, password)
- `POST /api/login` - Login (name, password)
- `GET /api/user` - Get user data (requires auth)
- `PUT /api/user` - Update user (requires auth)
- `POST /api/logout` - Logout

## cURL Examples

### Create User
```bash
curl -X POST https://3bukmo18b0.execute-api.us-east-1.amazonaws.com/api/create \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","message":"My secret message","password":"mypassword123"}'
```

### Login
```bash
curl -X POST https://3bukmo18b0.execute-api.us-east-1.amazonaws.com/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"John Doe","password":"mypassword123"}'
```

### Get User (requires auth)
```bash
curl -X GET https://3bukmo18b0.execute-api.us-east-1.amazonaws.com/api/user \
  -b cookies.txt
```

### Update User (requires auth)
```bash
curl -X PUT https://3bukmo18b0.execute-api.us-east-1.amazonaws.com/api/user \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Jane Doe","message":"Updated secret"}'
```

### Logout
```bash
curl -X POST https://3bukmo18b0.execute-api.us-east-1.amazonaws.com/api/logout \
  -b cookies.txt \
  -c cookies.txt
```

**Note:** The `-c cookies.txt` flag saves cookies (JWT token) and `-b cookies.txt` sends them with subsequent requests.

cat ~/cookies.txt

## Security Features

- JWT stored in httpOnly cookie (frontend cannot access)
- Passwords hashed with bcrypt
- CORS restrictions by origin
- Credentials required for authenticated requests
