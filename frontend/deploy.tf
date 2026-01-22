# Configure AWS Provider
provider "aws" {
  region = "us-east-1"  # Change this to your desired region
}

# Create S3 bucket for website hosting
resource "aws_s3_bucket" "website_bucket" {
  bucket = "cors-488431"
}

# Enable versioning for the bucket
resource "aws_s3_bucket_versioning" "website_bucket_versioning" {
  bucket = aws_s3_bucket.website_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Configure bucket for website hosting
resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.website_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # For SPA, redirect all errors to index.html
  }
}

# Create bucket policy to allow public access
resource "aws_s3_bucket_policy" "website_bucket_policy" {
  bucket = aws_s3_bucket.website_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.website_public_access]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website_bucket.arn}/*"
      },
    ]
  })
}

# Enable public access to bucket
resource "aws_s3_bucket_public_access_block" "website_public_access" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Output the website endpoint
output "website_endpoint" {
  value = aws_s3_bucket_website_configuration.website_config.website_endpoint
}

# Output the bucket name
output "bucket_name" {
  value = aws_s3_bucket.website_bucket.id
}