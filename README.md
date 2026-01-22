# CORS Demo with DynamoDB

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

- `POST /api/create` - Create user (name, secretText)
- `POST /api/login` - Login (userId, secretText)
- `GET /api/user` - Get user data (requires auth)
- `PUT /api/user` - Update user (requires auth)
- `POST /api/logout` - Logout

## Security Features

- JWT stored in httpOnly cookie (frontend cannot access)
- Passwords hashed with bcrypt
- CORS restrictions by origin
- Credentials required for authenticated requests
