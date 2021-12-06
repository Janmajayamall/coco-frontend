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
	const [tokenBalance] =
		useContractCall(
			account &&
				addresses.MemeToken && {
					abi: memeTokenInterface,
					address: addresses.MemeToken,
					method: "allowance",
					args: [account, addresses.MarketRouter],
				}
		) ?? [];
	return tokenBalance;
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
