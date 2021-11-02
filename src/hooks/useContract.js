import addresses from "./../contracts/addresses.json";
import MarkerRouterAbi from "../contracts/abis/MarketRouter.json";

import { useEthers, useContractFunction } from "@usedapp/core/packages/core";
import { utils, Contract } from "ethers";

export const marketRouterContract = new Contract(
	addresses.MarketRouter,
	new utils.Interface(MarkerRouterAbi)
);

export function useCreateNewMarket() {
	const { state, send } = useContractFunction(
		marketRouterContract,
		"createAndPlaceBetOnMarket"
	);
	return { state, send };
}
