import { ZERO_BN } from "../utils";
import {
	useERC20TokenAllowance,
	useERC1155ApprovalForAll,
} from "./useContractCall";

export function useERC20TokenAllowanceWrapper(
	erc20Address,
	account,
	approvalToAddress,
	erc20AmountBn
) {
	let allowance = useERC20TokenAllowance(
		erc20Address,
		account,
		approvalToAddress
	);
	return allowance == undefined ? true : erc20AmountBn.lte(account);
}

export function useERC1155ApprovalForAllWrapper(
	groupAddress,
	account,
	approvalToAddress
) {
	let approval = useERC1155ApprovalForAll(
		groupAddress,
		account,
		approvalToAddress
	);
	return approval == undefined ? true : approval;
}
