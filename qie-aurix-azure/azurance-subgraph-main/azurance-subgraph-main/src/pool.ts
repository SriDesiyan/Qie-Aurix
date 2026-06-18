import { Address, BigInt } from "@graphprotocol/graph-ts";
import { AzurancePool, InsuranceBought, InsuranceSold, StateChanged, Withdrew } from "../generated/AzuranceFactory/AzurancePool";
import { InsurancePool } from "../generated/schema";

export function handleInsuranceBought(event: InsuranceBought): void {
    updatePoolValue(event.address);
}

export function handleInsuranceSold(event: InsuranceSold): void {
    updatePoolValue(event.address);
}

export function handleStateChanged(event: StateChanged): void {
    let pool = updatePoolValue(event.address);
    if (pool) {
        pool.status = event.params.newState;
        pool.save();
    }
}

export function handleWithdrew(event: Withdrew): void {
    updatePoolValue(event.address);
}

function updatePoolValue(address: Address): InsurancePool | null {
    let id = address.toHex();
    let pool = InsurancePool.load(id);

    let instance = AzurancePool.bind(address);

    let buyerShares = instance.try_totalBuyShare();
    let sellerShares = instance.try_totalSellShare();
    let totalShares = instance.try_totalSellShare();

    let totalValue = instance.try_totalValueLocked();

    if (pool && !buyerShares.reverted && !sellerShares.reverted && !totalShares.reverted && !totalValue.reverted) {
        let buyerValue = BigInt.fromI32(0);
        let sellerValue = BigInt.fromI32(0);

        if (totalShares.value.gt(BigInt.fromI32(0))) {
            buyerValue = buyerShares.value.times(totalValue.value).div(totalShares.value);
            sellerValue = sellerShares.value.times(totalValue.value).div(totalShares.value);
        }

        pool.buyerShares = buyerShares.value;
        pool.sellerShares = sellerShares.value;
        pool.totalShares = totalShares.value;

        pool.buyerValue = buyerValue;
        pool.sellerValue = sellerValue;
        pool.totalValue = totalValue.value;

        pool.save();
    }

    return pool;
}