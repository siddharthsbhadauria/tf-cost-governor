# ==========================================================================
# Enterprise AWS Multi-Cloud Blueprint
# AWS EKS Cluster, Karpenter Autoscaler, S3 Data Lake & CloudWatch
# ==========================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = "Production"
      ManagedBy   = "Terraform"
      Project     = "GenAI-Platform"
      CostCenter  = "CC-7782"
    }
  }
}

variable "aws_region" {
  type    = string;
  default = "eu-west-2"
}

# 1. AWS EKS Production Cluster
resource "aws_eks_cluster" "primary" {
  name     = "enterprise-genai-eks-prod"
  role_arn = "arn:aws:iam::123456789012:role/EKSClusterRole"
  version  = "1.29"

  vpc_config {
    subnet_ids              = ["subnet-0a1b2c3d4e", "subnet-5f6g7h8i9j"]
    endpoint_private_access = true
    endpoint_public_access  = false
  }

  encryption_config {
    provider {
      key_arn = "arn:aws:kms:eu-west-2:123456789012:key/eks-encryption-key"
    }
    resources = ["secrets"]
  }
}

# 2. EKS Node Group (GPU & General Workloads)
resource "aws_eks_node_group" "gpu_workers" {
  cluster_name    = aws_eks_cluster.primary.name
  node_group_name = "gpu-inference-nodes"
  node_role_arn   = "arn:aws:iam::123456789012:role/EKSNodeRole"
  subnet_ids      = ["subnet-0a1b2c3d4e"]
  instance_types  = ["g5.2xlarge"]

  scaling_config {
    desired_size = 4
    max_size     = 12
    min_size     = 2
  }
}

# 3. S3 Enterprise Data Lake Bucket
resource "aws_s3_bucket" "telemetry_datalake" {
  bucket        = "enterprise-telemetry-lakehouse-prod-uk"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_kms" {
  bucket = aws_s3_bucket.telemetry_datalake.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket                  = aws_s3_bucket.telemetry_datalake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 4. DynamoDB Lock & State Tracking Table
resource "aws_dynamodb_table" "tf_locks" {
  name         = "terraform-state-lock-matrix"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
