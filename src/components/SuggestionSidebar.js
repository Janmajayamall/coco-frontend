import ConnectButton from "../components/ConnectButton";
import LoginButton from "../components/LoginButton";
import PostDisplay from "../components/PostDisplay";
import Loader from "../components/Loader";
import GroupDisplayName from "./GroupDisplayPanel";
import {
	Button,
	Box,
	Text,
	Flex,
	Spacer,
	Switch,
	Heading,
	Image,
	Avatar,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	IconButton,
	useToast,
	NumberInput,
	NumberInputField,
	HStack,
} from "@chakra-ui/react";

import { useEtherBalance, useEthers } from "@usedapp/core/packages/core";
import {
	useCreateNewMarket,
	useQueryMarketsOrderedByLatest,
	useQueryExploreMarkets,
	useQueryMarketByOracles,
	useClaim,
	useClaimedAmount,
	useClaimLimit,
	useDepositEthToWeth,
} from "../hooks";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
	findAllModerators,
	formatBNToDecimal,
	formatBNToDecimalCurr,
	getFunctionSignature,
	ONE_BN,
	parseDecimalToBN,
	ZERO_BN,
	CURR_SYMBOL,
} from "../utils";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
	selectUserProfile,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import PrimaryButton from "./PrimaryButton";
import { addresses } from "./../contracts";

function SuggestionSidebar() {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const dispatch = useDispatch();
	const toast = useToast();

	const ethBalance = useEtherBalance(account);

	const { state, sendTransaction } = useDepositEthToWeth();

	const [popularGroups, setPopularGroups] = useState([]);
	const [initialized, setInitialized] = useState(false);
	const [inputEth, setInputEth] = useState(0);
	const [swapLoading, setSwapLoading] = useState(false);

	useEffect(() => {
		if (state.status === "Success") {
			setSwapLoading(false);
			toast({
				title: "Swap Success!",
				status: "success",
				isClosable: true,
			});
		}

		if (state.status == "Exception" || state.status == "Fail") {
			setSwapLoading(false);
			toast({
				title:
					"Metamask err! Make sure you have enough test ETH to send transaction.",
				status: "error",
				isClosable: true,
			});
		}
	}, [state]);

	useEffect(async () => {
		if (initialized == true) {
			return;
		}
		// const ignoreList = Object.keys(groupsFollowed);
		let res = await findAllModerators();
		console.log("Got this, you know it!");
		if (res == undefined) {
			return;
		}
		setPopularGroups(res.moderators);
		setInitialized(true);
	}, []);

	function validateEthInput() {
		if (ethBalance == undefined || inputEth == "") {
			return true;
		}

		if (ethBalance.gte(parseDecimalToBN(inputEth))) {
			return true;
		}

		return false;
	}

	return (
		<Flex
			width={"25%"}
			paddingRight={6}
			paddingLeft={6}
			paddingTop={5}
			flexDirection="column"
		>
			<Heading size="md" marginBottom={5}>
				Explore Groups
			</Heading>
			<Flex flexDirection={"column"}>
				{initialized == false ? <Loader /> : undefined}
				{popularGroups.map((group) => {
					return (
						<GroupDisplayName
							group={group}
							followStatusVisible={true}
						/>
					);
				})}
			</Flex>

			{isAuthenticated ? (
				<Flex
					marginTop="8"
					marginBottom="5"
					flexDirection="column"
					padding="5"
					backgroundColor="gray.100"
				>
					<Text fontSize="large" fontWeight="bold">
						Swap ETH to WETH
					</Text>

					<HStack>
						<NumberInput
							style={{
								width: "100%",
								marginTop: 5,
							}}
							onChange={(val) => {
								setInputEth(val);
							}}
							value={inputEth}
							defaultValue={0}
							precision={6}
							fontSize={14}
						>
							<NumberInputField />
						</NumberInput>
						<Text fontSize={14}>{`ETH`}</Text>
					</HStack>
					{validateEthInput() === false ? (
						<Text
							style={{
								fontSize: 12,
								color: "#EB5757",
							}}
						>
							Insufficient ETH balance
						</Text>
					) : undefined}
					<PrimaryButton
						isLoading={swapLoading}
						loadingText="Processing..."
						disabled={validateEthInput() === false}
						onClick={() => {
							if (validateEthInput() === false) {
								return;
							}

							if (inputEth == "0" || inputEth == "") {
								return;
							}

							setSwapLoading(true);

							const fnSig = getFunctionSignature("deposit()");

							sendTransaction({
								to: addresses.WETH,
								value: parseDecimalToBN(inputEth),
								data: fnSig,
							});
						}}
						style={{
							marginTop: 5,
						}}
						title="Swap"
					/>
					<Flex
						marginTop={5}
						marginBottom={1}
						flexDirection={"column"}
					>
						<Text
							fontSize={14}
						>{`Need test ETH? Try a faucet`}</Text>
						<Flex>
							<Text
								onClick={() => {
									if (window) {
										window.open(
											"https://faucet.paradigm.xyz/"
										);
									}
								}}
								textDecoration="underline"
								fontSize={14}
							>
								{`here`}
							</Text>
							<Text
								fontSize={14}
								marginLeft={1}
								marginRight={1}
							>{`or`}</Text>
							<Text
								onClick={() => {
									if (window) {
										window.open(
											"https://faucet.paradigm.xyz/"
										);
									}
								}}
								textDecoration="underline"
								fontSize={14}
							>
								{`here`}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			) : undefined}
		</Flex>
	);
}

export default SuggestionSidebar;
