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

export const oracleInterface = new utils.Interface(OracleAbi);

export function useCreateNewMarket() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"createAndPlaceBetOnMarket"
	);
	return { state, send };
}

export function useCreateNewModerator() {
	const { state, send } = useContractFunction(
		oracleFactoryContract,
		"setupSingleOracle"
	);
	return { state, send };
}

export function useCallOracleParams(oracleAddress) {
	console.log(oracleAddress, "this is here");
	const d = useContractCall({
		abi: oracleInterface,
		address: oracleAddress,
		method: "getMarketParams",
		args: [],
	});
	console.log(d, ",l,l,");
	return d;
}

// const d = useContractCalls([
// 	{
// 		abi: oracleInterface,
// 		address: oracleAddress,
// 		method: "getMarketParams",
// 		args: [],
// 	},
// 	{
// 		abi: oracleInterface,
// 		address: oracleAddress,
// 		method: "getDelegate",
// 		args: [],
// 	},
// ]);