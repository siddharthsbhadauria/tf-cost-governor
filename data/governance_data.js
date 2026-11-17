window.GOVERNANCE_DATA = {
  "generated_at": "2026-11-17T15:31:11.388037Z",
  "total_resources": 14,
  "total_monthly_cost": 2643.0,
  "compliance_rate": 100.0,
  "providers": [
    "AWS",
    "GCP",
    "Azure"
  ],
  "summary": {
    "markdown_brief": "### Terraform cost summary\n* **Estimated monthly cost**: $2,643.00 across 14 resources.\n* **Guardrails in place**: 100.0% of resources.\n* **Largest cost**: AWS EKS Node Group (g5.2xlarge GPU) ($1,004.80 a month).\n* **Suggestion**: Implement Karpenter autoscaling with mixed instance types to save 35%."
  },
  "resources": [
    {
      "type": "azurerm_resource_group",
      "id": "azurerm_resource_group.rg",
      "name": "azurerm_resource_group.rg",
      "provider": "Azure",
      "category": "Configuration",
      "monthly_cost": 0.0,
      "policy_pass": true,
      "policy_rule": "No direct cost; billed through its parent resource",
      "finops_tip": "Keep tags consistent so cost reports roll up to the parent."
    },
    {
      "type": "azurerm_kubernetes_cluster",
      "id": "azurerm_kubernetes_cluster.aks",
      "name": "Azure AKS Cluster (Standard_D4s_v5)",
      "provider": "Azure",
      "category": "Compute & Orchestration",
      "monthly_cost": 416.1,
      "policy_pass": true,
      "policy_rule": "System-Assigned Managed Identity",
      "finops_tip": "Leverage Azure Reserved Instances (1-yr) to reduce monthly node spend by 40%."
    },
    {
      "type": "azurerm_cosmosdb_account",
      "id": "azurerm_cosmosdb_account.db",
      "name": "Azure Cosmos DB NoSQL Account",
      "provider": "Azure",
      "category": "Database",
      "monthly_cost": 290.0,
      "policy_pass": true,
      "policy_rule": "Session Consistency & Regional Failover",
      "finops_tip": "Enable Cosmos DB Autoscale throughput to avoid overprovisioning RU/s."
    },
    {
      "type": "azurerm_storage_account",
      "id": "azurerm_storage_account.storage",
      "name": "Azure Blob Storage Account (GRS)",
      "provider": "Azure",
      "category": "Storage & Data",
      "monthly_cost": 38.4,
      "policy_pass": true,
      "policy_rule": "TLS 1.2 & Blob Versioning Active",
      "finops_tip": "Transition cold telemetry logs to Cool / Archive tier after 14 days."
    },
    {
      "type": "google_vertex_ai_endpoint",
      "id": "google_vertex_ai_endpoint.llm_gateway",
      "name": "GCP Vertex AI Model Endpoint",
      "provider": "GCP",
      "category": "Generative AI",
      "monthly_cost": 580.0,
      "policy_pass": true,
      "policy_rule": "Customer Managed Encryption Key (CMEK)",
      "finops_tip": "Scale replica count to zero during non-business hours."
    },
    {
      "type": "google_bigquery_dataset",
      "id": "google_bigquery_dataset.finops_lakehouse",
      "name": "GCP BigQuery Telemetry Lakehouse",
      "provider": "GCP",
      "category": "Data & Analytics",
      "monthly_cost": 110.0,
      "policy_pass": true,
      "policy_rule": "Partitioning & 90-day Expiration Active",
      "finops_tip": "Use DAY-partitioning on timestamp field to cut query scan costs by 80%."
    },
    {
      "type": "google_bigquery_table",
      "id": "google_bigquery_table.token_events",
      "name": "google_bigquery_table.token_events",
      "provider": "GCP",
      "category": "Configuration",
      "monthly_cost": 0.0,
      "policy_pass": true,
      "policy_rule": "No direct cost; billed through its parent resource",
      "finops_tip": "Keep tags consistent so cost reports roll up to the parent."
    },
    {
      "type": "google_container_cluster",
      "id": "google_container_cluster.autopilot_cluster",
      "name": "GCP GKE Autopilot Cluster",
      "provider": "GCP",
      "category": "Compute & Orchestration",
      "monthly_cost": 73.0,
      "policy_pass": true,
      "policy_rule": "Private Endpoint & CIDR Enforced",
      "finops_tip": "Autopilot manages node sizing automatically to eliminate idle compute waste."
    },
    {
      "type": "aws_eks_cluster",
      "id": "aws_eks_cluster.primary",
      "name": "AWS EKS Control Plane",
      "provider": "AWS",
      "category": "Compute & Orchestration",
      "monthly_cost": 73.0,
      "policy_pass": true,
      "policy_rule": "KMS Secret Encryption Enforced",
      "finops_tip": "Enable EKS Auto-Mode or Spot Instances for non-critical pods."
    },
    {
      "type": "aws_eks_node_group",
      "id": "aws_eks_node_group.gpu_workers",
      "name": "AWS EKS Node Group (g5.2xlarge GPU)",
      "provider": "AWS",
      "category": "Compute & AI",
      "monthly_cost": 1004.8,
      "policy_pass": true,
      "policy_rule": "IMDSv2 Enforced",
      "finops_tip": "Implement Karpenter autoscaling with mixed instance types to save 35%."
    },
    {
      "type": "aws_s3_bucket",
      "id": "aws_s3_bucket.telemetry_datalake",
      "name": "AWS S3 Data Lakehouse Bucket",
      "provider": "AWS",
      "category": "Storage & Data",
      "monthly_cost": 45.2,
      "policy_pass": true,
      "policy_rule": "Block Public Access & KMS SSE Active",
      "finops_tip": "Apply S3 Intelligent-Tiering lifecycle policy after 30 days."
    },
    {
      "type": "aws_s3_bucket_server_side_encryption_configuration",
      "id": "aws_s3_bucket_server_side_encryption_configuration.s3_kms",
      "name": "aws_s3_bucket_server_side_encryption_configuration.s3_kms",
      "provider": "AWS",
      "category": "Configuration",
      "monthly_cost": 0.0,
      "policy_pass": true,
      "policy_rule": "No direct cost; billed through its parent resource",
      "finops_tip": "Keep tags consistent so cost reports roll up to the parent."
    },
    {
      "type": "aws_s3_bucket_public_access_block",
      "id": "aws_s3_bucket_public_access_block.public_block",
      "name": "aws_s3_bucket_public_access_block.public_block",
      "provider": "AWS",
      "category": "Configuration",
      "monthly_cost": 0.0,
      "policy_pass": true,
      "policy_rule": "No direct cost; billed through its parent resource",
      "finops_tip": "Keep tags consistent so cost reports roll up to the parent."
    },
    {
      "type": "aws_dynamodb_table",
      "id": "aws_dynamodb_table.tf_locks",
      "name": "AWS DynamoDB Terraform Lock Table",
      "provider": "AWS",
      "category": "Database & State",
      "monthly_cost": 12.5,
      "policy_pass": true,
      "policy_rule": "PAY_PER_REQUEST Mode Active",
      "finops_tip": "Keep on-demand capacity pricing for intermittent lock reads."
    }
  ]
};
