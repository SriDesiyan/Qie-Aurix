import { BigInt } from "@graphprotocol/graph-ts";
import { InsuranceCreated } from "../generated/AzuranceFactory/AzuranceFactory"
import { AzurancePool } from "../generated/AzuranceFactory/AzurancePool";
import { InsurancePool } from "../generated/schema";
import { getOrCreateToken } from "./token";
import { AzurancePool as AzurancePoolTemplate } from '../generated/templates';

export function handleInsuranceCreated(event: InsuranceCreated): void {
  let id = event.params.target.toHex()

  let pool = InsurancePool.load(id);

  if (pool == null) {
    pool = new InsurancePool(id);

    let instance = AzurancePool.bind(event.params.target);

    let multiplier = instance.try_multiplier();
    let multiplierDecimals = instance.try_multiplierDecimals();

    // let maturityBlock = instance.try_maturityBlock();
    // let staleBlock = instance.try_staleBlock();

    let maturityTimestamp = instance.try_maturityTimestamp();
    let staleTimestamp = instance.try_maturityTimestamp();

    let underlyingToken = instance.try_underlyingToken();
    let fee = instance.try_fee();
    let feeDecimals = instance.try_feeDecimals();
    let feeTo = instance.try_feeTo();
    let condition = instance.try_condition();
    let buyerToken = instance.try_buyerToken();
    let sellerToken = instance.try_sellerToken();
    let status = instance.try_status();

    if (!multiplier.reverted) pool.multiplier = multiplier.value;
    if (!multiplierDecimals.reverted) pool.multiplierDecimals = multiplierDecimals.value;
    if (!maturityTimestamp.reverted) pool.maturityTimestamp = maturityTimestamp.value;
    if (!staleTimestamp.reverted) pool.staleTimestamp = staleTimestamp.value;
    // if (!maturityBlock.reverted) pool.maturityBlock = maturityBlock.value;
    // if (!staleBlock.reverted) pool.staleBlock = staleBlock.value;
    if (!underlyingToken.reverted) pool.underlyingToken = getOrCreateToken(underlyingToken.value).id;
    if (!fee.reverted) pool.fee = fee.value;
    if (!feeDecimals.reverted) pool.feeDecimals = feeDecimals.value;
    if (!feeTo.reverted) pool.feeTo = feeTo.value;
    if (!condition.reverted) pool.condition = condition.value;
    if (!buyerToken.reverted) pool.buyerToken = getOrCreateToken(buyerToken.value).id;
    if (!sellerToken.reverted) pool.sellerToken = getOrCreateToken(sellerToken.value).id;
    if (!status.reverted) pool.status = status.value;

    pool.createdAt = event.block.timestamp;

    pool.buyerShares = BigInt.fromI32(0);
    pool.sellerShares = BigInt.fromI32(0);
    pool.totalShares = BigInt.fromI32(0);

    pool.buyerValue = BigInt.fromI32(0);
    pool.sellerValue = BigInt.fromI32(0);
    pool.totalValue = BigInt.fromI32(0);

    AzurancePoolTemplate.create(event.params.target);

    pool.save();
  }
}