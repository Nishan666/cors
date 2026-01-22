# Backend Setup with Lambda & API Gateway

## Deploy Infrastructure

```bash
cd terraform
terraform init
terraform apply
```

Terraform automatically:
- Zips Lambda functions
- Creates DynamoDB table
- Deploys Lambda functions
- Sets up API Gateway with CORS

## Get API Endpoint

After deployment, copy the `api_endpoint` output and update `frontend/.env`:

```
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

## Adding New Handler

1. Create handler file: `handlers/newHandler.js`
2. Add to `terraform/variables.tf` in the `handlers` map:
```hcl
new_handler = {
  handler    = "handlers/newHandler.handler"
  method     = "GET"
  path       = "/api/new"
  needs_auth = false
}
```
3. Run `terraform apply`

That's it! No need to modify main.tf.

## API Endpoints

- `POST /api/create` - Create user (name, secretText)
- `POST /api/login` - Login (userId, secretText)
- `GET /api/user` - Get user data (auth required)
- `PUT /api/user` - Update user (auth required)
- `POST /api/logout` - Logout

## CORS Configuration

- **localhost:3000** - POST only (create, login)
- **localhost:5000** - All methods (GET, POST, PUT, DELETE)
