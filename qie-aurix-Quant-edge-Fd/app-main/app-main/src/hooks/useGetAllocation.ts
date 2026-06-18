import { Contract } from "ethers";
import { useCallback, useEffect, useState } from "react";
import fundManagerAbi from "../constants/fundManagerAbi.json";
import { useEthersSigner } from "@/utils/transactions";

const useGetAllocation = (numAssets = 4) => {
  const [allocation, setAllocation] = useState<any[]>([]);
  const signer = useEthersSigner();

  const getWeights = useCallback(async () => {
    try {
      const fundContract = new Contract(
        process.env.NEXT_PUBLIC_FUND_MANAGER_CONTRACT_ADDRESS!,
        fundManagerAbi,
        signer
      );

      const weights = await Promise.all(
        Array(numAssets)
          .fill("")
          .map(async (_, i) => {
            const token = await fundContract.weights(i);

            return {
              id: token.id,
              tokenId: token.tokenId,
              weight: token.weight,
            };
          })
      );

      const tokensAllocation = (
        await Promise.all(
          weights.map(async ({ tokenId, weight }) => {
            const token = await fundContract.tokens(tokenId);

            return {
              address: token.contractAddress,
              symbol: token.symbol,
              weight,
              isActive: token.isActive,
            };
          })
        )
      ).filter(({ isActive }) => isActive);

      setAllocation(tokensAllocation);
    } catch (err) {
      console.error(err);
    }
  }, [signer, setAllocation]);

  useEffect(() => {
    getWeights();
  }, []);

  return { allocation };
};

export default useGetAllocation;
