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

variable "handlers" {
  description = "Map of Lambda handlers"
  type = map(object({
    handler    = string
    method     = string
    path       = string
    needs_auth = bool
  }))
  default = {
    create = {
      handler    = "handlers/create.handler"
      method     = "POST"
      path       = "/api/create"
      needs_auth = false
    }
    login = {
      handler    = "handlers/login.handler"
      method     = "POST"
      path       = "/api/login"
      needs_auth = false
    }
    logout = {
      handler    = "handlers/logout.handler"
      method     = "POST"
      path       = "/api/logout"
      needs_auth = false
    }
    get_user = {
      handler    = "handlers/getUser.handler"
      method     = "GET"
      path       = "/api/user"
      needs_auth = true
    }
    update_user = {
      handler    = "handlers/updateUser.handler"
      method     = "PUT"
      path       = "/api/user"
      needs_auth = true
    }
  }
}
