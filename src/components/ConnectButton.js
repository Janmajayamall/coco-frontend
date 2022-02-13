import { Box, Text, Flex } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { useDispatch, useSelector } from "react-redux";
import {
	selectUserProfile,
	sUpdateLoginModalIsOpen,
} from "./../redux/reducers";
import { useERC20TokenBalance } from "./../hooks";
import { formatBNToDecimalCurr, sliceAddress } from "../utils";
import PrimaryButton from "./PrimaryButton";
import { addresses } from "../contracts";

/**
 * Authentication = (userProfile && account (from MM)) != undefined
 */
function ConnectButton() {
	const userProfile = useSelector(selectUserProfile);
	const dispatch = useDispatch();

	const { account } = useEthers();
	const tokenBalance = useERC20TokenBalance(account, addresses.WETH);

	return (
		<Flex m={2}>
			<Box
				display="flex"
				alignItems="center"
				background="gray.700"
				borderRadius="xl"
				py="0"
			>
				{account && tokenBalance && userProfile ? (
					<Box px="3">
						<Text color="white" fontSize="md">
							{formatBNToDecimalCurr(tokenBalance)}
						</Text>
					</Box>
				) : undefined}
				<PrimaryButton
					onClick={() => {
						if (userProfile && account) {
							return;
						}
						dispatch(sUpdateLoginModalIsOpen(true));
					}}
					title={
						userProfile && account
							? sliceAddress(account)
							: "Sign In"
					}
				/>
			</Box>
		</Flex>
	);
}

export default ConnectButton;
