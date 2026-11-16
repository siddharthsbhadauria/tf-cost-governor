from scripts.evaluate_governance import analyse, parse_terraform_files

TF = '''
resource "aws_eks_node_group" "gpu_workers" {}
resource "aws_s3_bucket_public_access_block" "block" {}
resource "azurerm_resource_group" "rg" {}
'''


def test_priced_and_unpriced_resources(tmp_path):
    (tmp_path / "main.tf").write_text(TF)
    res = {r["id"]: r for r in parse_terraform_files(str(tmp_path))}
    assert res["aws_eks_node_group.gpu_workers"]["monthly_cost"] == 1004.80
    # Config-only resources have no direct charge and keep their real cloud.
    assert res["aws_s3_bucket_public_access_block.block"]["monthly_cost"] == 0.0
    assert res["aws_s3_bucket_public_access_block.block"]["provider"] == "AWS"
    assert res["azurerm_resource_group.rg"]["provider"] == "Azure"


def test_analyse_totals(tmp_path):
    (tmp_path / "main.tf").write_text(TF)
    data = analyse(parse_terraform_files(str(tmp_path)))
    assert data["total_resources"] == 3
    assert data["total_monthly_cost"] == 1004.80
    assert data["compliance_rate"] == 100.0
    assert data["generated_at"].endswith("Z")
    assert "Checkov" not in data["summary"]["markdown_brief"]


def test_real_blueprints_parse():
    res = parse_terraform_files()
    clouds = {r["provider"] for r in res}
    assert {"AWS", "GCP", "Azure"} <= clouds
