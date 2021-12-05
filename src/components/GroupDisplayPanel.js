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
import { useNavigate } from "react-router";

function GroupDisplayName({ group, followStatusVisible }) {
	const navigate = useNavigate();
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const dispatch = useDispatch();

	return (
		<Flex marginTop={2} marginBottom={2}>
			<Avatar
				size="sm"
				name="Dan Abrahmov"
				src="https://bit.ly/dan-abramov"
			/>

			<Text
				onClick={() => {
					navigate(`/group/${group.oracleAddress}`);
				}}
			>
				{group.name}
			</Text>
			<Spacer />
			{followStatusVisible === true ? (
				groupsFollowed[group.oracleAddress] !== true ? (
					<Button
						onClick={async () => {
							const res = await followModerator(
								group.oracleAddress
							);
							if (res == undefined) {
								return;
							}
							dispatch(sAddGroupFollow(group.oracleAddress));
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
							dispatch(sDeleteGroupFollow(group.oracleAddress));
						}}
						size="sm"
					>
						Leave
					</Button>
				)
			) : undefined}
		</Flex>
	);
}

export default GroupDisplayName;
