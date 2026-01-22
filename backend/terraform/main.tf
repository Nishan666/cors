terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# DynamoDB Table
resource "aws_dynamodb_table" "users" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Name        = "CORS Demo Users"
    Environment = "dev"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "cors-demo-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem"
      ]
      Resource = aws_dynamodb_table.users.arn
    }]
  })
}

# Lambda Functions
resource "aws_lambda_function" "create" {
  filename      = "lambda-create.zip"
  function_name = "cors-demo-create"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handlers/create.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.users.name
      JWT_SECRET     = var.jwt_secret
    }
  }
}

resource "aws_lambda_function" "login" {
  filename      = "lambda-login.zip"
  function_name = "cors-demo-login"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handlers/login.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.users.name
      JWT_SECRET     = var.jwt_secret
    }
  }
}

resource "aws_lambda_function" "logout" {
  filename      = "lambda-logout.zip"
  function_name = "cors-demo-logout"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handlers/logout.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  environment {
    variables = {
      JWT_SECRET = var.jwt_secret
    }
  }
}

resource "aws_lambda_function" "get_user" {
  filename      = "lambda-getUser.zip"
  function_name = "cors-demo-get-user"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handlers/getUser.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.users.name
      JWT_SECRET     = var.jwt_secret
    }
  }
}

resource "aws_lambda_function" "update_user" {
  filename      = "lambda-updateUser.zip"
  function_name = "cors-demo-update-user"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handlers/updateUser.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.users.name
      JWT_SECRET     = var.jwt_secret
    }
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "cors-demo-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins     = ["http://localhost:3000", "http://localhost:5000"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["content-type", "authorization"]
    allow_credentials = true
    max_age           = 300
  }
}

# Integrations
resource "aws_apigatewayv2_integration" "create" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.create.invoke_arn
}

resource "aws_apigatewayv2_integration" "login" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.login.invoke_arn
}

resource "aws_apigatewayv2_integration" "logout" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.logout.invoke_arn
}

resource "aws_apigatewayv2_integration" "get_user" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_user.invoke_arn
}

resource "aws_apigatewayv2_integration" "update_user" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.update_user.invoke_arn
}

# Routes
resource "aws_apigatewayv2_route" "create" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/create"
  target    = "integrations/${aws_apigatewayv2_integration.create.id}"
}

resource "aws_apigatewayv2_route" "login" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/login"
  target    = "integrations/${aws_apigatewayv2_integration.login.id}"
}

resource "aws_apigatewayv2_route" "logout" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/logout"
  target    = "integrations/${aws_apigatewayv2_integration.logout.id}"
}

resource "aws_apigatewayv2_route" "get_user" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /api/user"
  target    = "integrations/${aws_apigatewayv2_integration.get_user.id}"
}

resource "aws_apigatewayv2_route" "update_user" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "PUT /api/user"
  target    = "integrations/${aws_apigatewayv2_integration.update_user.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Lambda Permissions
resource "aws_lambda_permission" "create" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "login" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "logout" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.logout.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.users.name
}
