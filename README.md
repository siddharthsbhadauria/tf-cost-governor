# tf-cost-governor

[![CI](https://github.com/siddharthsbhadauria/tf-cost-governor/actions/workflows/ci.yml/badge.svg)](https://github.com/siddharthsbhadauria/tf-cost-governor/actions/workflows/ci.yml)
[![Daily run](https://github.com/siddharthsbhadauria/tf-cost-governor/actions/workflows/finops_advisory.yml/badge.svg)](https://github.com/siddharthsbhadauria/tf-cost-governor/actions/workflows/finops_advisory.yml)

What three multi-cloud Terraform blueprints would cost each month, worked out before anyone runs `terraform apply`.

**Dashboard:** https://siddharthsbhadauria.github.io/tf-cost-governor/

## What's in the blueprints

| Folder | Stack |
| :--- | :--- |
| `terraform/aws` | EKS cluster with a g5.2xlarge GPU node group, S3 data lake bucket with KMS and public access block, DynamoDB state lock table |
| `terraform/gcp` | Vertex AI endpoint, BigQuery dataset and table, GKE Autopilot cluster |
| `terraform/azure` | AKS cluster, Cosmos DB account, geo-redundant storage account |

## How it works

`scripts/evaluate_governance.py` runs every morning at 06:00 UTC on GitHub Actions.

1. It reads every `resource` block in the `.tf` files. Nothing is planned or applied.
2. Each resource type maps to an on-demand monthly price estimate and the guardrail its blueprint enforces, such as KMS encryption, IMDSv2 or a private endpoint. Types without a price, like resource groups and bucket settings, are billed through a parent resource and count as $0.
3. DuckDB totals cost by cloud and by resource and works out the share of resources with their guardrail in place.
4. The results are written to `data/governance_data.json` and published to GitHub Pages.

The prices are fixed estimates kept in the script, not live quotes. Real bills move with usage, region and discounts, so read them as a sizing guide. There is no policy scanner such as Checkov in the loop; the guardrails are recorded per resource type.

## Run it locally

```bash
pip install -r requirements.txt
python scripts/evaluate_governance.py
python -m http.server 8080          # then open http://localhost:8080
```

Tests and lint:

```bash
pip install -r requirements-dev.txt
ruff check .
pytest -q
```

## License

MIT
