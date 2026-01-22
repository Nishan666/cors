# Backend Setup with Lambda & API Gateway

## 1. Build Lambda Package

```bash
cd terraform
chmod +x build.sh
./build.sh
```

## 2. Deploy Infrastructure

```bash
terraform init
terraform apply
```

This creates:
- DynamoDB table
- Lambda function
- API Gateway with CORS

## 3. Get API Endpoint

After deployment, copy the `api_endpoint` output and update `frontend/.env`:

```
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

## API Endpoints

- `POST /api/create` - Create user (name, secretText)
- `POST /api/login` - Login (userId, secretText)
- `GET /api/user` - Get user data (auth required)
- `PUT /api/user` - Update user (auth required)
- `POST /api/logout` - Logout

## CORS Configuration

- **localhost:3000** - POST only (create, login)
- **localhost:5000** - All methods (GET, POST, PUT, DELETE)
