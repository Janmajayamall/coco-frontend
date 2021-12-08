import PrimaryButton from "./PrimaryButton";
import { Flex, Box, Text } from "@chakra-ui/react";
import {
	useTokenAllowance,
	useERC1155ApprovalForAll,
	useERC1155SetApprovalForAll,
	useTokenApprove,
} from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { useEffect, useState } from "react";
import { BigNumber } from "@ethersproject/abi/node_modules/@ethersproject/bignumber";
import { CURR_SYMBOL, MAX_UINT_256, ZERO_BN } from "../utils";
import addresses from "../contracts/addresses.json";

/**
 * tokenType -> 0: ERC20, 1: ERC1155
 */
function ApprovalInterface({
	tokenType,
	erc1155Address,
	onSuccess,
	onFail,
	erc20AmountBn,
	...props
}) {
	const { account } = useEthers();

	const erc20TokenAllowance = useTokenAllowance(account);
	const erc1155TokenApproval = useERC1155ApprovalForAll(
		erc1155Address,
		account
	);

	const {
		state: stateERC1155,
		send: sendERC1155,
	} = useERC1155SetApprovalForAll(erc1155Address);
	const { state: stateToken, send: sendToken } = useTokenApprove();

	const [loading, setLoading] = useState(false);

	function isDisabled() {
		if (tokenType === 0 && erc20TokenAllowance != undefined) {
			let amount = erc20AmountBn;
			if (!BigNumber.isBigNumber(amount)) {
				amount = ZERO_BN;
			}
			return amount.lte(erc20TokenAllowance);
		}
		if (tokenType === 1 && erc1155TokenApproval != undefined) {
			return erc1155TokenApproval;
		}

		return true;
	}

	useEffect(() => {
		if (
			stateERC1155.status === "Success" ||
			stateToken.status === "Success"
		) {
			if (onSuccess) {
				onSuccess();
			}
			setLoading(false);
		} else if (
			stateERC1155.status === "Exception" ||
			stateERC1155.status === "Fail" ||
			stateToken.status === "Exception" ||
			stateToken.status === "Fail"
		) {
			if (onFail) {
				onFail();
			}
			setLoading(false);
		}
	}, [stateERC1155, stateToken]);

	if (isDisabled()) {
		return <></>;
	}

	return (
		<Flex flexDirection={"column"} {...props}>
			<Box
				padding={2}
				borderColor="blue.400"
				borderWidth={1}
				borderStyle="solid"
				backgroundColor="#4F4F4F"
				borderRadius={10}
			>
				<Text color={"#FDFDFD"} fontWeight="bold" fontSize={12}>
					{tokenType === 0
						? `To spend your ${CURR_SYMBOL} tokes, you will first have to give approval to the app. This is only needed once.`
						: `To spend your Outcome shares, you will first have to give approval to the app. This is only needed once per group`}
				</Text>
			</Box>
			<PrimaryButton
				style={{ marginTop: 5 }}
				disabled={isDisabled()}
				loadingText="Processing..."
				isLoading={loading}
				onClick={() => {
					if (isDisabled()) {
						return;
					}

					setLoading(true);

					if (tokenType === 0) {
						sendToken(addresses.MarketRouter, MAX_UINT_256);
					} else if (tokenType === 1) {
						sendERC1155(addresses.MarketRouter, true);
					} else {
						setLoading(false);
					}
				}}
				title={"Set approval"}
			/>
		</Flex>
	);
}

export default ApprovalInterface;
