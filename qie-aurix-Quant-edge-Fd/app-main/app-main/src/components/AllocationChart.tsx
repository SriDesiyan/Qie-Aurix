import React, { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors } from "../../tailwind.config";
import { useContractRead } from "wagmi";
import vaultAbi from "../constants/vaultAbi.json";
import fundManagerAbi from "../constants/fundManagerAbi.json";

import Spinner from "./Spinner";
import { fetchBalance } from "wagmi/actions";
import { useGetAllocation, useHydrated } from "@/hooks";

const AllocationChart = () => {
  const [allocations, setAllocations] = useState<
    { name: string; allocation: number }[]
  >([]);

  const { hasHydrated } = useHydrated();

  // const token1 = useContractRead({
  //   address: process.env
  //     .NEXT_PUBLIC_FUND_MANAGER_CONTRACT_ADDRESS! as `0x${string}`,
  //   abi: fundManagerAbi,
  //   functionName: "weights",
  //   args: [0],
  // });
  // const token2 = useContractRead({
  //   address: process.env
  //     .NEXT_PUBLIC_FUND_MANAGER_CONTRACT_ADDRESS! as `0x${string}`,
  //   abi: fundManagerAbi,
  //   functionName: "weights",
  //   args: [0],
  // });
  // const token3 = useContractRead({
  //   address: process.env
  //     .NEXT_PUBLIC_FUND_MANAGER_CONTRACT_ADDRESS! as `0x${string}`,
  //   abi: fundManagerAbi,
  //   functionName: "weights",
  //   args: [0],
  // });

  // console.log(token1.data, token2.data, token3.data);

  const allocation = useGetAllocation();

  const totalValue = useContractRead({
    address: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS! as `0x${string}`,
    abi: vaultAbi,
    functionName: "calculateTotalValue",
  });

  // console.log(supportedTokens.data);
  // console.log(totalValue.data);

  const fetchAllocations = useCallback(async () => {
    // if (!supportedTokens?.data || totalValue.data) return;

    let tempAllocations = [];

    // for (let tokenAddress of supportedTokens.data) {
    //   const balance = await fetchBalance({
    //     address: process.env
    //       .NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS! as `0x${string}`,
    //     token: tokenAddress,
    //   });

    //   const proportion = Number(balance.value) / Number(totalValue.data);

    //   tempAllocations.push({ tokenAddress, proportion });
    // }

    const data = [
      { name: "BTC", allocation: 30 },
      { name: "ETH", allocation: 20 },
      { name: "DOGE", allocation: 10 },
      { name: "SOL", allocation: 15 },
    ];

    setAllocations(data);
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const isLoading = totalValue.isLoading;

  if (!hasHydrated) return null;

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={allocations}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          labelStyle={{
            color: "black",
          }}
        />
        <Legend />
        <Bar dataKey="allocation" fill={colors["primary-300"]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AllocationChart;
