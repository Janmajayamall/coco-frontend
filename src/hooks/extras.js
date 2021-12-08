import { ZERO_BN } from "../utils";
import { useTokenAllowance, useERC1155ApprovalForAll } from "./useContractCall";

export function useCheckTokenApprovals(
	tokenType,
	account,
	erc1155Address = undefined,
	erc20AmountBn = ZERO_BN
) {
	const erc20TokenAllowance = useTokenAllowance(account);
	const erc1155TokenApproval = useERC1155ApprovalForAll(
		erc1155Address,
		account
	);

	if (tokenType === 0 && erc20TokenAllowance != undefined) {
        
		return erc20AmountBn.lte(erc20TokenAllowance);
	} else if (tokenType === 1 && erc1155TokenApproval != undefined) {
		return erc1155TokenApproval;
	}
	return true;
}
