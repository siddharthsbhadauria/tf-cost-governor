# 🛡️ TF Cost Governor
> **Automated Multi-Cloud Terraform FinOps & Security Advisory Engine**

[![FinOps Pipeline](https://github.com/siddharthsbhadauria/tf-cost-governor/actions/workflows/finops_advisory.yml/badge.svg)](https://github.com/siddharthsbhadauria/tf-cost-governor/actions/workflows/finops_advisory.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Terraform](https://img.shields.io/badge/Terraform-v1.5+-623CE4.svg?logo=terraform)](https://www.terraform.io/)
[![DuckDB](https://img.shields.io/badge/DuckDB-In--Memory-FFF000.svg?logo=duckdb)](https://duckdb.org/)

An automated, serverless Multi-Cloud Infrastructure FinOps & Policy Compliance Engine. Built using **Terraform (HCL)** across AWS, GCP, and Azure, evaluated by **DuckDB** inside **GitHub Actions**, and presented via a high-tech **JetBrains Mono** static dashboard.

---

## ⚡ Key Architectural Features

- **Multi-Cloud Terraform Blueprints**: Real-world production IaC code blocks for AWS EKS, GCP Vertex AI & BigQuery, and Azure AKS & Cosmos DB.
- **DuckDB Analytical Engine**: In-memory SQL processing of IaC pricing structures, monthly spend calculations, and policy compliance rates.
- **Automated CI/CD Governance**: GitHub Actions workflow runs daily at 06:00 UTC to evaluate IaC changes and auto-update metrics.
- **JetBrains Mono Digital UI**: Dual theme system with high-contrast warm Light Mode and obsidian Cyber Dark Mode.

---

## 🛠️ Tech Stack & Tools

- **IaC**: Terraform (HCL), HashiCorp Modules, AWS Provider, GCP Provider, AzureRM Provider
- **Policy & FinOps**: Infracost CLI Model, Checkov Policy Guardrails, OPA / Rego Rules
- **Engine**: Python 3.11, DuckDB In-Memory Analytical Database
- **Automation**: GitHub Actions, GitHub Pages
- **Frontend**: Vanilla JS, CSS3 Design System, JetBrains Mono

---

## 🚀 Local Development

```bash
# 1. Clone repository
git clone https://github.com/siddharthsbhadauria/tf-cost-governor.git
cd tf-cost-governor

# 2. Install dependencies
pip install duckdb

# 3. Execute evaluation engine
python scripts/evaluate_governance.py

# 4. Host local server
python -m http.server 8080
```

---

## 📄 License
MIT &copy; 2026 Siddharth Singh Bhadauria
