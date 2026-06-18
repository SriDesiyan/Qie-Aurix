import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying QIE Aurix contracts with:", deployer.address);

  // QIE Pass placeholder (replace with real address before mainnet)
  const QIE_PASS_PLACEHOLDER  = "0x0000000000000000000000000000000000000001";
  const QUSDC_PLACEHOLDER     = "0x0000000000000000000000000000000000000002";

  // 1. TrustProfileRegistry
  const TrustProfileRegistry = await ethers.getContractFactory("TrustProfileRegistry");
  const registry = await TrustProfileRegistry.deploy(QIE_PASS_PLACEHOLDER);
  await registry.waitForDeployment();
  console.log("TrustProfileRegistry:  ", await registry.getAddress());

  // 2. ResiliencePolicyVault
  const ResiliencePolicyVault = await ethers.getContractFactory("ResiliencePolicyVault");
  const vault = await ResiliencePolicyVault.deploy(QUSDC_PLACEHOLDER);
  await vault.waitForDeployment();
  console.log("ResiliencePolicyVault: ", await vault.getAddress());

  // 3. AurixRecoveryGate
  const AurixRecoveryGate = await ethers.getContractFactory("AurixRecoveryGate");
  const recoveryGate = await AurixRecoveryGate.deploy();
  await recoveryGate.waitForDeployment();
  console.log("AurixRecoveryGate:     ", await recoveryGate.getAddress());

  // 4. SafetyAuditAnchor
  const SafetyAuditAnchor = await ethers.getContractFactory("SafetyAuditAnchor");
  const auditAnchor = await SafetyAuditAnchor.deploy();
  await auditAnchor.waitForDeployment();
  console.log("SafetyAuditAnchor:     ", await auditAnchor.getAddress());

  // 5. FamilyVaultController
  const FamilyVaultController = await ethers.getContractFactory("FamilyVaultController");
  const familyVault = await FamilyVaultController.deploy(QIE_PASS_PLACEHOLDER);
  await familyVault.waitForDeployment();
  console.log("FamilyVaultController: ", await familyVault.getAddress());

  console.log("\n✅ All QIE Aurix contracts deployed. Copy addresses to .env");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
