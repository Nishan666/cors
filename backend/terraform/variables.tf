variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "table_name" {
  description = "DynamoDB table name"
  type        = string
  default     = "cors-demo-users"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}
