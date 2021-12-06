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
import { findAllModerators, formatBNToDecimal, ZERO_BN } from "../utils";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";

function SuggestionSidebar() {
	const { account } = useEthers();
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
		if (state.receipt) {
			setClaimLoading("False");
			toast({
				title: "Claim Success!",
				status: "success",
				isClosable: true,
			});
		}
	});

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
			width={"20%"}
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
			{claimableAmount.gt(ZERO_BN) ? (
				<Flex
					marginTop="5"
					flexDirection="column"
					padding="5"
					backgroundColor="gray.100"
				>
					<Text fontSize="large" fontWeight="bold">
						{`Claim ${formatBNToDecimal(
							claimableAmount
						)} MEME Tokens now!`}
					</Text>
					<Button
						onClick={() => {
							if (claimableAmount.gt(ZERO_BN)) {
								send(account, claimableAmount);
							}
						}}
						backgroundColor="blue.200"
					>
						Claim
					</Button>
				</Flex>
			) : undefined}
		</Flex>
	);
}

export default SuggestionSidebar;
