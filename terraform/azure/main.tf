# ==========================================================================
# Enterprise Azure Multi-Cloud Blueprint
# Azure AKS Cluster, Cosmos DB & Blob Storage Account
# ==========================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "azure_location" {
  type    = string
  default = "ukwest"
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-enterprise-controlplane-prod"
  location = var.azure_location

  tags = {
    Environment = "Production"
    CostCenter  = "CC-7782"
  }
}

# 1. Azure Kubernetes Service (AKS)
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-genai-controlplane-uk"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "genai-aks"

  default_node_pool {
    name       = "defaultpool"
    node_count = 3
    vm_size    = "Standard_D4s_v5"
  }

  identity {
    type = "SystemAssigned"
  }
}

# 2. Azure Cosmos DB Account (NoSQL Data Tier)
resource "azurerm_cosmosdb_account" "db" {
  name                = "cosmos-finops-telemetry-prod"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.azure_location
    failover_priority = 0
  }
}

# 3. Azure Secure Blob Storage
resource "azurerm_storage_account" "storage" {
  name                     = "stfinopsanalyticsukprod"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }
}
