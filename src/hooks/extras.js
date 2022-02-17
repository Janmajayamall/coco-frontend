import { useEffect, useState } from "react";
import { useQueryGroupsByManagers } from ".";
import { safeService, ZERO_BN } from "../utils";
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

	return allowance == undefined ? true : erc20AmountBn.lte(allowance);
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

// Gets safes owned by account
// AND Ids of groups managed by
// account's safe addresses
export function useGetSafesAndGroupsManagedByUser(account) {
	const [safes, setSafes] = useState([]);
	const {
		result: rGroupsByManagers,
		reexecuteQuery: reexecuteGroupsByManagers,
	} = useQueryGroupsByManagers(
		safes.map((id) => id.toLowerCase()),
		false
	);

	useEffect(async () => {
		try {
			if (account == undefined) {
				return;
			}
			let res = await safeService.getSafesByOwner(account);
			if (res == undefined || res.safes == undefined) {
				return;
			}
			setSafes(res.safes);
		} catch (e) {}
	}, [account]);

	return {
		safes,
		groupIds: rGroupsByManagers.data
			? rGroupsByManagers.data.groups.map((group) => group.id)
			: [],
	};
}
