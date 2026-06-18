import { getBalance, useEthersSigner } from "@/utils/transactions";
import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";

const useGetBalance = ({
  tokenAddress,
  address,
}: {
  tokenAddress: string;
  address: string;
}) => {
  const signer = useEthersSigner();

  const [balance, setBalance] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetBalance = async () => {
    setIsLoading(true);
    try {
      const value = await getBalance(tokenAddress, address, signer);

      setBalance(value);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetBalance();
  }, [tokenAddress, address, signer]);

  return { balance, isLoading, refetch: handleGetBalance };
};

export default useGetBalance;
