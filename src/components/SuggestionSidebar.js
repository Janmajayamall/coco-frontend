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
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import {
	useCreateNewMarket,
	useQueryMarketsOrderedByLatest,
	useQueryExploreMarkets,
	useQueryMarketByOracles,
	useClaim,
	useClaimedAmount,
	useClaimLimit,
} from "../hooks";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
	findAllModerators,
	formatBNToDecimal,
	formatBNToDecimalCurr,
	ZERO_BN,
} from "../utils";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
	selectUserProfile,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import PrimaryButton from "./PrimaryButton";
import { ExternalLinkIcon } from "@chakra-ui/icons";

function SuggestionSidebar() {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const dispatch = useDispatch();
	const toast = useToast();

	const groupsFollowed = useSelector(selectGroupsFollowed);
	const claimedAmount = useClaimedAmount(account);
	const claimLimit = useClaimLimit();

	const { state, send } = useClaim();

	const [popularGroups, setPopularGroups] = useState([]);
	const [initialized, setInitialized] = useState(false);
	const [claimableAmount, setClaimableAmount] = useState(ZERO_BN);

	const [claimLoading, setClaimLoading] = useState(false);

	useEffect(() => {
		if (state.status === "Success") {
			setClaimLoading(false);
			toast({
				title: "Claim Success!",
				status: "success",
				isClosable: true,
			});
		}

		if (state.status == "Exception" || state.status == "Fail") {
			setClaimLoading(false);
			toast({
				title:
					"Metamask err! Make sure you have enough test ETH to send transaction.",
				status: "error",
				isClosable: true,
			});
		}
	}, [state]);

	useEffect(() => {
		if (claimLimit && claimedAmount) {
			setClaimableAmount(claimLimit.sub(claimedAmount));
		}
	}, [claimLimit, claimedAmount]);

	useEffect(async () => {
		if (initialized == true) {
			return;
		}
		// const ignoreList = Object.keys(groupsFollowed);
		let res = await findAllModerators();
		if (res == undefined) {
			return;
		}
		setPopularGroups(res.moderators);
		setInitialized(true);
	}, []);

	return (
		<Flex
			width={"25%"}
			paddingRight={6}
			paddingLeft={6}
			paddingTop={5}
			flexDirection="column"
		>
			{isAuthenticated && claimableAmount.gt(ZERO_BN) ? (
				<Flex
					marginBottom="5"
					flexDirection="column"
					padding="5"
					backgroundColor="gray.100"
				>
					<Text fontSize="large" fontWeight="bold">
						{`Claim ${formatBNToDecimalCurr(
							claimableAmount
						)} Tokens now!`}
					</Text>
					<Flex>
						<Text
							onClick={() => {
								if (window) {
									window.open("https://faucet.paradigm.xyz/");
								}
							}}
							textDecoration="underline"
							fontSize={14}
						>
							{`Missing test ETH? Use a faucet`}
						</Text>
					</Flex>
					<PrimaryButton
						isLoading={claimLoading}
						loadingText="Processing..."
						onClick={() => {
							if (claimableAmount.gt(ZERO_BN)) {
								setClaimLoading(true);
								send(account, claimableAmount);
							}
						}}
						style={{
							marginTop: 20,
						}}
						title="Claim"
					/>
				</Flex>
			) : undefined}
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
		</Flex>
	);
}

export default SuggestionSidebar;
