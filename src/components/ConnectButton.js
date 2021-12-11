import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { formatEther, formatUnits } from "@ethersproject/units";
import { utils } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import {
	selectUserProfile,
	sUpdateLoginModalIsOpen,
} from "./../redux/reducers";
import { useTokenBalance } from "./../hooks";
import {
	formatBNToDecimal,
	formatBNToDecimalCurr,
	parseDecimalToBN,
	roundDecimalStr,
	sliceAddress,
} from "../utils";
import PrimaryButton from "./PrimaryButton";

/**
 * Authentication = (userProfile && account (from MM)) != undefined
 */
function ConnectButton() {
	const userProfile = useSelector(selectUserProfile);
	const dispatch = useDispatch();

	const { account } = useEthers();
	const tokenBalance = useTokenBalance(account);

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
