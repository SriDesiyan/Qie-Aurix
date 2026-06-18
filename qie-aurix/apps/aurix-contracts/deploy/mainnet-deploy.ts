import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Starting production QIE Blockchain Mainnet deployment...");
  console.log("Deploying contract with account:", deployer.address);

  // Read config settings from environment
  const qiePassAddress = process.env.QIE_PASS_ADDRESS;
  const qusdcAddress = process.env.QUSDC_ADDRESS;
  const qieDomainsAddress = process.env.QIE_DOMAINS_ADDRESS;

  // Validate settings and fail safely if they are missing or are set to placeholders
  if (!qiePassAddress || qiePassAddress === "REQUIRES_OFFICIAL_ADDRESS") {
    console.error("FATAL: QIE_PASS_ADDRESS environment variable is missing or set to a placeholder.");
    process.exit(1);
  }
  if (!qusdcAddress || qusdcAddress === "REQUIRES_OFFICIAL_ADDRESS") {
    console.error("FATAL: QUSDC_ADDRESS environment variable is missing or set to a placeholder.");
    process.exit(1);
  }

  console.log("Config validated successfully.");
  console.log("QIE Pass Address: ", qiePassAddress);
  console.log("QUSDC Address:    ", qusdcAddress);

  // 1. TrustProfileRegistry
  console.log("Deploying TrustProfileRegistry...");
  const TrustProfileRegistry = await ethers.getContractFactory("TrustProfileRegistry");
  const registry = await TrustProfileRegistry.deploy(qiePassAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("TrustProfileRegistry deployed to: ", registryAddress);

  // 2. ResiliencePolicyVault
  console.log("Deploying ResiliencePolicyVault...");
  const ResiliencePolicyVault = await ethers.getContractFactory("ResiliencePolicyVault");
  const vault = await ResiliencePolicyVault.deploy(qusdcAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("ResiliencePolicyVault deployed to:", vaultAddress);

  // 3. AurixRecoveryGate
  console.log("Deploying AurixRecoveryGate...");
  const AurixRecoveryGate = await ethers.getContractFactory("AurixRecoveryGate");
  const recoveryGate = await AurixRecoveryGate.deploy();
  await recoveryGate.waitForDeployment();
  const recoveryGateAddress = await recoveryGate.getAddress();
  console.log("AurixRecoveryGate deployed to:    ", recoveryGateAddress);

  // 4. SafetyAuditAnchor
  console.log("Deploying SafetyAuditAnchor...");
  const SafetyAuditAnchor = await ethers.getContractFactory("SafetyAuditAnchor");
  const auditAnchor = await SafetyAuditAnchor.deploy();
  await auditAnchor.waitForDeployment();
  const auditAnchorAddress = await auditAnchor.getAddress();
  console.log("SafetyAuditAnchor deployed to:    ", auditAnchorAddress);

  // 5. FamilyVaultController
  console.log("Deploying FamilyVaultController...");
  const FamilyVaultController = await ethers.getContractFactory("FamilyVaultController");
  const familyVault = await FamilyVaultController.deploy(qiePassAddress);
  await familyVault.waitForDeployment();
  const familyVaultAddress = await familyVault.getAddress();
  console.log("FamilyVaultController deployed to: ", familyVaultAddress);

  // Optional: Set domains resolver on FamilyVaultController if provided
  if (qieDomainsAddress && qieDomainsAddress !== "REQUIRES_OFFICIAL_ADDRESS" && qieDomainsAddress !== "0x0000000000000000000000000000000000000000") {
    console.log("Setting QIE Domains Resolver on FamilyVaultController...");
    const tx = await familyVault.setQieDomainsResolver(qieDomainsAddress);
    await tx.wait();
    console.log("QIE Domains Resolver set to:", qieDomainsAddress);
  }

  console.log("\n✅ All QIE Aurix contracts successfully deployed to QIE Mainnet!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
