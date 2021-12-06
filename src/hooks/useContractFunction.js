import addresses from "../contracts/addresses.json";
import { useContractFunction } from "@usedapp/core/packages/core";
import {
	marketRouterContract,
	oracleFactoryContract,
	oracleContract,
	memeTokenInterface,
	tokenDistributorContract,
} from "../utils";

export function useCreateNewMarket() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"createFundBetOnMarket"
	);
	return { state, send };
}

export function useCreateNewOracle() {
	const { state, send } = useContractFunction(
		oracleFactoryContract,
		"createOracle"
	);
	return { state, send };
}

export function useBuyMinTokensForExactCTokens() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"buyMinTokensForExactCTokens"
	);
	return { state, send };
}

export function useSellExactTokensForMinCTokens() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"sellExactTokensForMinCTokens"
	);
	return { state, send };
}

export function useStakeForOutcome() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"stakeForOutcome"
	);
	return { state, send };
}

export function useRedeemWinning() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"redeemWinning"
	);
	return { state, send };
}

export function useRedeemWinningBothOutcomes() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"redeemWinningBothOutcomes"
	);
	return { state, send };
}

export function useRedeemMaxWinning() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"redeemMaxWinning"
	);
	return { state, send };
}

export function useRedeemMaxWinningAndStake() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"redeemMaxWinningAndStake"
	);
	return { state, send };
}

export function useRedeemStake(oracleAddress) {
	const { state, send } = useContractFunction(
		oracleContract(oracleAddress),
		"redeemStake"
	);
	return {
		state,
		send,
	};
}

export function useERC1155SetApprovalForAll(oracleAddress) {
	const { state, send } = useContractFunction(
		oracleContract(oracleAddress),
		"setApprovalForAll"
	);

	return {
		state,
		send,
	};
}

export function useSetOutcome(oracleAddress) {
	const { state, send } = useContractFunction(
		oracleContract(oracleAddress),
		"setOutcome"
	);

	return {
		state,
		send,
	};
}

export function useUpdateMarketConfig(oracleAddress) {
	const { state, send } = useContractFunction(
		oracleContract(oracleAddress),
		"updateMarketConfig"
	);

	return {
		state,
		send,
	};
}

export function useClaim() {
	const { state, send } = useContractFunction(
		tokenDistributorContract,
		"claim"
	);
	return {
		state,
		send,
	};
}
