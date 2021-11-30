import addresses from "./../contracts/addresses.json";
import MarkerRouterAbi from "../contracts/abis/MarketRouter.json";
import OracleFactoryAbi from "../contracts/abis/OracleFactory.json";
import OracleAbi from "../contracts/abis/Oracle.json";

import {
	useEthers,
	useContractFunction,
	useContractCalls,
	useContractCall,
} from "@usedapp/core/packages/core";
import { utils, Contract } from "ethers";

export const marketRouterContract = new Contract(
	addresses.MarketRouter,
	new utils.Interface(MarkerRouterAbi)
);

export const oracleFactoryInterface = new utils.Interface(OracleFactoryAbi);
export const oracleFactoryContract = new Contract(
	addresses.OracleFactory,
	oracleFactoryInterface
);

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

export function useRedeemStake(oracleAddress) {
	const oracleContract = new Contract(
		oracleAddress,
		new utils.Interface(OracleAbi)
	);

	const { state, send } = useContractFunction(oracleContract, "redeemStake");
	return {
		state,
		send,
	};
}

export function useERC1155SetApprovalForAll(oracleAddress) {
	const oracleContract = new Contract(
		oracleAddress,
		new utils.Interface(OracleAbi)
	);

	const { state, send } = useContractFunction(
		oracleContract,
		"setApprovalForAll"
	);

	return {
		state,
		send,
	};
}

export function useSetOutcome(oracleAddress) {
	const oracleContract = new Contract(
		oracleAddress,
		new utils.Interface(OracleAbi)
	);

	const { state, send } = useContractFunction(oracleContract, "setOutcome");

	return {
		state,
		send,
	};
}

export function useUpdateMarketConfig(oracleAddress) {
	const oracleContract = new Contract(
		oracleAddress,
		new utils.Interface(OracleAbi)
	);

	const { state, send } = useContractFunction(
		oracleContract,
		"updateMarketConfig"
	);

	return {
		state,
		send,
	};
}
