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
import { useDepositEthToWeth } from "../hooks";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
	findAllModerators,
	formatBNToDecimal,
	getFunctionSignature,
	ONE_BN,
	parseDecimalToBN,
	ZERO_BN,
	CURR_SYMBOL,
	useBNInput,
	findPopularGroups,
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
	const [swapLoading, setSwapLoading] = useState(false);
	const {
		input: inputEth,
		bnValue: inputEthBn,
		setInput: setInputEth,
		err: inputEthErr,
		errText: inputEthErrText,
	} = useBNInput(validateEthInput);

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
		// const ignoreList = Object.keys(groupsFollowed);
		// let res = await findAllModerators();
		// if (res == undefined) {
		// 	return;
		// }
		// setPopularGroups(res.moderators);
		// setInitialized(true);
	}, []);

	useEffect(async () => {
		const res = await findPopularGroups([]);
		if (res == undefined) {
			return;
		}
		setPopularGroups(res.groups);
	}, []);

	function validateEthInput() {
		if (ethBalance == undefined || inputEthBn.lte(ethBalance)) {
			return { valid: true, expStr: "" };
		}

		return {
			valid: false,
			expStr: "Insufficient Balance",
		};
	}

	function HelperOption({ text, onClick }) {
		return (
			<Flex
				_hover={{ cursor: "pointer" }}
				paddingTop={2}
				paddingBottom={2}
			>
				<Text onClick={onClick} fontSize={14}>
					{text}
				</Text>
			</Flex>
		);
	}

	return (
		<Flex
			width={"25%"}
			paddingRight={6}
			paddingLeft={6}
			paddingTop={5}
			flexDirection="column"
		>
			<Heading size="sm" marginBottom={2}>
				Popular Groups
			</Heading>
			<Flex flexDirection={"column"} paddingBottom={5}>
				{popularGroups.map((group, index) => {
					return (
						<GroupDisplayName
							key={index}
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
					{inputEthErr === true ? (
						<Text
							style={{
								fontSize: 12,
								color: "#EB5757",
							}}
						>
							{`${inputEthErrText}`}
						</Text>
					) : undefined}
					<PrimaryButton
						isLoading={swapLoading}
						loadingText="Processing..."
						disabled={inputEthErr === true}
						onClick={() => {
							if (inputEthErr === true || inputEthBn.isZero()) {
								return;
							}

							setSwapLoading(true);

							const fnSig = getFunctionSignature("deposit()");

							sendTransaction({
								to: addresses.WETH,
								value: inputEthBn,
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
								_hover={{ cursor: "pointer" }}
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
								_hover={{ cursor: "pointer" }}
								onClick={() => {
									if (window) {
										window.open(
											"https://faucet.rinkeby.io/"
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

			<Flex
				marginTop="1"
				marginBottom="1"
				flexDirection="column"
				padding={5}
				backgroundColor="gray.100"
			>
				<HelperOption
					text="How to use"
					onClick={() => {
						window.open("https://docs.cocoverse.club/", "_blank");
					}}
				/>
				<HelperOption
					text="Send Feedback"
					onClick={() => {
						window.open(
							"https://airtable.com/shrsVVVLBuawaCDvE",
							"_blank"
						);
					}}
				/>
				<HelperOption
					text="Join COCO on TG"
					onClick={() => {
						window.open("https://t.me/cocoverse", "_blank");
					}}
				/>
			</Flex>
		</Flex>
	);
}

export default SuggestionSidebar;
