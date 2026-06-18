const { ethers } = require("ethers");

function main() {
  const args = process.argv.slice(2);
  if (args.length < 6) {
    console.log("false");
    process.exit(1);
  }
  
  const claimId = args[0];
  const token = args[1];
  const amount = args[2];
  const claimant = args[3];
  const targetContract = args[4];
  const signature = args[5];
  const txHash = args[6];
  
  try {
    let messageHash;
    if (txHash && txHash !== "undefined" && txHash !== "null" && txHash !== "") {
      messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "address", "uint256", "address", "address", "bytes32"],
        [claimId, token, amount, claimant, targetContract, txHash]
      );
    } else {
      messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "address", "uint256", "address", "address"],
        [claimId, token, amount, claimant, targetContract]
      );
    }
    
    const messageHashBytes = ethers.getBytes(messageHash);
    const prefixedDigest = ethers.hashMessage(messageHashBytes);
    const recovered = ethers.recoverAddress(prefixedDigest, signature);
    
    console.log(recovered.toLowerCase() === claimant.toLowerCase() ? "true" : "false");
  } catch (err) {
    console.log("false");
  }
}

main();
