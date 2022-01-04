import { addresses } from "../contracts";
import {
	useEthers,
	useContractFunction,
	useContractCalls,
	useContractCall,
} from "@usedapp/core/packages/core";
import { oracleInterface, wEthInterface } from "../utils";

export function useTokenBalance(account) {
	const [tokenBalance] =
		useContractCall(
			account &&
				addresses.WETH && {
					abi: wEthInterface,
					address: addresses.WETH,
					method: "balanceOf",
					args: [account],
				}
		) ?? [];
	return tokenBalance;
}

export function useTokenAllowance(account) {
	const [allowance] =
		useContractCall(
			account &&
				addresses.WETH && {
					abi: wEthInterface,
					address: addresses.WETH,
					method: "allowance",
					args: [account, addresses.MarketRouter],
				}
		) ?? [];
	return allowance;
}

export function useERC1155ApprovalForAll(oracleAddress, account) {
	const [approval] =
		useContractCall(
			account &&
				oracleAddress &&
				addresses.MarketRouter && {
					abi: oracleInterface,
					address: oracleAddress,
					method: "isApprovedForAll",
					args: [account, addresses.MarketRouter],
				}
		) ?? [];
	return approval;
}
