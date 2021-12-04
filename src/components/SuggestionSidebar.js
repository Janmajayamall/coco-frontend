import ConnectButton from "../components/ConnectButton";
import LoginButton from "../components/LoginButton";
import PostDisplay from "../components/PostDisplay";
import Loader from "../components/Loader";
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
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import {
	useCreateNewMarket,
	useQueryMarketsOrderedByLatest,
	useQueryExploreMarkets,
	useQueryMarketByOracles,
} from "../hooks";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
	newPost,
	updateModerator,
	getUser,
	findAllFollows,
	filterOracleIdsFromMarketsGraph,
	findModeratorsByIdArr,
	filterMarketIdentifiersFromMarketsGraph,
	findPostsByMarketIdentifierArr,
	populateMarketWithMetadata,
	findPopularModerators,
	followModerator,
	findModeratorsDetails,
	numStrFormatter,
	stateSetupOraclesInfo,
	stateSetupMarketsMetadata,
	unfollowModerator,
	findAllModerators,
} from "../utils";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";

function SuggestionSidebar() {
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const dispatch = useDispatch();

	const [popularGroups, setPopularGroups] = useState([]);
	const [initialized, setInitialized] = useState(false);

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
						<Flex>
							<Text>{group.name}</Text>
							<Spacer />
							{groupsFollowed[group.oracleAddress] != true ? (
								<Button
									onClick={async () => {
										const res = await followModerator(
											group.oracleAddress
										);
										if (res == undefined) {
											return;
										}
										dispatch(
											sAddGroupFollow(group.oracleAddress)
										);
									}}
									size="sm"
								>
									Join
								</Button>
							) : (
								<Button
									onClick={async () => {
										const res = await unfollowModerator(
											group.oracleAddress
										);
										if (res == undefined) {
											return;
										}
										dispatch(
											sDeleteGroupFollow(
												group.oracleAddress
											)
										);
									}}
									size="sm"
								>
									Leave
								</Button>
							)}
						</Flex>
					);
				})}
			</Flex>
		</Flex>
	);
}

export default SuggestionSidebar;
