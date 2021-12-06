import addresses from "../contracts/addresses.json";
import {
	useEthers,
	useContractFunction,
	useContractCalls,
	useContractCall,
} from "@usedapp/core/packages/core";
import {
	marketRouterContract,
	oracleFactoryContract,
	oracleContract,
	memeTokenInterface,
	tokenDistributorContract,
	tokenDistributorInterface,
	oracleInterface,
} from "../utils";

export function useTokenBalance(account) {
	const [tokenBalance] =
		useContractCall(
			account &&
				addresses.MemeToken && {
					abi: memeTokenInterface,
					address: addresses.MemeToken,
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
				addresses.MemeToken && {
					abi: memeTokenInterface,
					address: addresses.MemeToken,
					method: "allowance",
					args: [account, addresses.MarketRouter],
				}
		) ?? [];
	return allowance;
}

export function useClaimedAmount(account) {
	const [claimedAmount] =
		useContractCall(
			account &&
				addresses.TokenDistributor && {
					abi: tokenDistributorInterface,
					address: addresses.TokenDistributor,
					method: "claims",
					args: [account],
				}
		) ?? [];
	return claimedAmount;
}

export function useClaimLimit() {
	const [claimLimit] =
		useContractCall(
			addresses.TokenDistributor && {
				abi: tokenDistributorInterface,
				address: addresses.TokenDistributor,
				method: "claimLimit",
				args: [],
			}
		) ?? [];
	return claimLimit;
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
