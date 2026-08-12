# ==========================================================================
# Enterprise GCP Multi-Cloud Blueprint
# Vertex AI Endpoints, BigQuery Lakehouse Partitioning & GKE Autopilot
# ==========================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

variable "gcp_project_id" {
  type    = string
  default = "genai-controlplane-prod"
}

variable "gcp_region" {
  type    = string
  default = "europe-west2"
}

# 1. GCP Vertex AI Endpoint Deployment
resource "google_vertex_ai_endpoint" "llm_gateway" {
  name         = "vertex-llm-gateway-prod"
  display_name = "Enterprise LLM Inference Gateway"
  location     = var.gcp_region
  region       = var.gcp_region

  labels = {
    env  = "prod"
    dept = "finops-ai"
  }
}

# 2. BigQuery Telemetry & Cost Partitioned Lakehouse Dataset
resource "google_bigquery_dataset" "finops_lakehouse" {
  dataset_id                  = "finops_telemetry_analytics"
  friendly_name               = "FinOps & AI Tokenomics Lakehouse"
  description                 = "50M+ daily telemetry log events & token cost analytics"
  location                    = "EU"
  default_table_expiration_ms = 7776000000 # 90 days retention

  labels = {
    tier = "analytics"
  }
}

resource "google_bigquery_table" "token_events" {
  dataset_id = google_bigquery_dataset.finops_lakehouse.dataset_id
  table_id   = "llm_token_invocations"

  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }

  schema = <<EOF
[
  {"name": "timestamp", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "model_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "provider", "type": "STRING", "mode": "REQUIRED"},
  {"name": "prompt_tokens", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "completion_tokens", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "estimated_cost_usd", "type": "FLOAT", "mode": "REQUIRED"}
]
EOF
}

# 3. GKE Autopilot Production Cluster
resource "google_container_cluster" "autopilot_cluster" {
  name             = "gke-genai-autopilot-prod"
  location         = var.gcp_region
  enable_autopilot = true

  ip_allocation_policy {
    use_ip_aliases = true
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }
}
