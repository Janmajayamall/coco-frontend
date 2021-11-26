import addresses from "./../contracts/addresses.json";
import MarkerRouterAbi from "../contracts/abis/MarketRouter.json";
import OracleFactoryAbi from "../contracts/abis/OracleFactory.json";

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
