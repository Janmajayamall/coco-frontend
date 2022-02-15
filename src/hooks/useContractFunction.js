import { addresses } from "../contracts";
import {
	useContractFunction,
	useSendTransaction,
} from "@usedapp/core/packages/core";
import {
	groupRouterContract,
	oracleContract,
	erc20Contract,
	groupContract,
	groupProxyFactoryContract,
} from "../utils";
import Web3 from "web3";

export function useCreateGroupWithSafe() {
	const { state, send } = useContractFunction(
		groupProxyFactoryContract,
		"createGroupWithSafe"
	);
	return { state, send };
}

export function useCreateAndBetOnMarket() {
	const { state, send } = useContractFunction(
		groupRouterContract,
		"createAndBetOnMarket"
	);
	return { state, send };
}

export function useBuyMinOutcomeTokensWithFixedAmount() {
	const { state, send } = useContractFunction(
		groupRouterContract,
		"buyMinOutcomeTokensWithFixedAmount"
	);
	return { state, send };
}

export function useRedeemWins() {
	const { state, send } = useContractFunction(
		groupRouterContract,
		"redeemWins"
	);
	return { state, send };
}

export function useRedeemStake() {
	const { state, send } = useContractFunction(
		groupRouterContract,
		"redeemStake"
	);
	return { state, send };
}

export function useRedeemWinsAndStake() {
	const { state, send } = useContractFunction(
		groupRouterContract,
		"redeemWinsAndStake"
	);
	return { state, send };
}

export function useERC1155SetApprovalForAll(groupAddress) {
	const { state, send } = useContractFunction(
		groupContract(groupAddress),
		"setApprovalForAll"
	);

	return {
		state,
		send,
	};
}

export function useERC20Approve(erc20Address) {
	const { state, send } = useContractFunction(
		erc20Contract(erc20Address),
		"approve"
	);
	return {
		state,
		send,
	};
}

export function useDepositEthToWeth() {
	const { state, sendTransaction } = useSendTransaction({
		transactionName: "Deposit ETH",
	});
	return { state, sendTransaction };
}
