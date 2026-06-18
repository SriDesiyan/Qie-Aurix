import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token } from "../generated/schema";
import { ERC20 } from "../generated/AzuranceFactory/ERC20";

export function getOrCreateToken(address: Address): Token {
    let id = address.toHex();
    let token = Token.load(id);
    if (token == null) {
        token = new Token(id);

        let instance = ERC20.bind(address);
        let name = instance.try_name();
        let symbol = instance.try_symbol();
        let decimals = instance.try_decimals();

        if (!name.reverted) token.name = name.value;
        if (!symbol.reverted) token.symbol = symbol.value;
        if (!decimals.reverted) token.decimals = decimals.value;

        token.save();
    }

    return token;
}