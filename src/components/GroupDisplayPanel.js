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
import { SettingsIcon } from "@chakra-ui/icons";

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
	generateProfileInitials,
} from "../utils";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

function GroupDisplayName({ group, followStatusVisible, settingsVisible }) {
	const navigate = useNavigate();
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const dispatch = useDispatch();

	return (
		<Flex marginTop={2} marginBottom={2} alignItems="center">
			<Avatar size="sm" name={generateProfileInitials(group.name)} />

			<Text
				onClick={() => {
					navigate(`/group/${group.oracleAddress}`);
				}}
				fontSize="14"
				fontWeight="bold"
				marginLeft="2"
				color={"#4F4F4F"}
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
						width={12}
					>
						<Text fontSize={12}>Join</Text>
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
						width={12}
					>
						<Text fontSize={12}>Leave</Text>
					</Button>
				)
			) : undefined}
			{settingsVisible === true ? (
				<IconButton
					onClick={() => {
						navigate(`/settings/${group.oracleAddress}`);
					}}
					backgroundColor="#0B0B0B"
					size={"sm"}
					aria-label="Search database"
					icon={<SettingsIcon color="#FDFDFD" />}
					marginRight={5}
				/>
			) : undefined}
		</Flex>
	);
}

export default GroupDisplayName;
