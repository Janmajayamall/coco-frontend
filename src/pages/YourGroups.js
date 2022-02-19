import PostDisplay from "../components/PostDisplay";
import Loader from "../components/Loader";
import {
	Button,
	Box,
	Text,
	Flex,
	Spacer,
	Heading,
	Avatar,
	IconButton,
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import {
	useGetSafesAndGroupsManagedByUser,
	useQueryExploreMarkets,
	useQueryGroupsByManagers,
	useQueryMarketByOracles,
	useQueryMarketsInResolutionByGroups,
} from "../hooks";
import useInView from "react-cool-inview";
import { useEffect, useState } from "react";
import {
	numStrFormatter,
	followGroup,
	unfollowGroup,
	generateProfileInitials,
	isValidAddress,
	FEED_BATCH_COUNT,
	findPosts,
	findGroupsDetails,
	COLORS,
	safeService,
	findGroupsByIdArr,
} from "../utils";
import { selectUserProfile, sUpdateLoginModalIsOpen } from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import ConfigSidebar from "../components/ConfigSiderbar";
import { FireIcon } from "../components/FireIcon";
import { HomeIcon } from "../components/HomeIcon";
import { ArrowBackIcon } from "@chakra-ui/icons";
import SuggestionSidebar from "../components/SuggestionSidebar";
import PrimaryButton from "../components/PrimaryButton";
import GroupDetails from "../components/GroupDetails";
import CreatePostStrip from "../components/CreatePostStrip";
import GroupDisplayName from "../components/GroupDisplayPanel";

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { account, chainId } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const location = useLocation();
	const urlParams = useParams();

	// find posts the need attention

	const [groupDetails, setGroupDetails] = useState([]);
	const [posts, setPosts] = useState([]);

	const { safes, groupIds } = useGetSafesAndGroupsManagedByUser(account);

	// Queries all markets that need attention.
	// Query is limited to groups managed by safes
	// owned by the user
	const timestamp = parseInt(new Date() / 1000);
	const {
		result: rQueryMarketsInResolutionByGroups,
		reexecuteQuery: reQueryMarketsInResolutionByGroups,
	} = useQueryMarketsInResolutionByGroups(groupIds, timestamp, false);

	// get groups details whenever rQueryGroupsByManagers (i.e. groupIds)
	// changes
	useEffect(async () => {
		if (groupIds.length != 0) {
			let res = await findGroupsByIdArr(groupIds);
			if (res == undefined) {
				return;
			}
			setGroupDetails(res.groups);
		}
	}, [groupIds]);

	// get post details whenever rQueryMarketsInResolutionByGroups changes
	useEffect(async () => {
		if (rQueryMarketsInResolutionByGroups.data) {
			const _marketIdentifiers = rQueryMarketsInResolutionByGroups.data.markets.map(
				(market) => market.marketIdentifier
			);
			const res = await findPosts(
				{
					marketIdentifier: {
						$in: _marketIdentifiers,
					},
				},
				{
					createdAt: -1,
				}
			);

			if (res == undefined) {
				return;
			}
			setPosts(res.posts);
		}
	}, [rQueryMarketsInResolutionByGroups]);

	return (
		<Flex width={"100%"}>
			<Flex
				flexDirection="column"
				width={"70%"}
				padding={5}
				minHeight="100vh"
			>
				{posts.length == 0 ? (
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						marginBottom={4}
						flexDirection={"column"}
					>
						<Text fontSize={15}>
							Hurray :)! No posts for you to review.
						</Text>
					</Flex>
				) : undefined}
				{posts.map((post, index) => {
					// if post does not have
					// corresponding group info
					// then return
					if (post.group.length == 0) {
						return;
					}

					return (
						<PostDisplay
							key={index}
							// setRef={
							// 	filteredMarkets.length % FEED_BATCH_COUNT === 0
							// 		? index === filteredMarkets.length - 1
							// 			? observe
							// 			: null
							// 		: null.

							// }
							style={{
								marginBottom: 45,
								width: "100%",
							}}
							post={post}
							onImageClick={(marketIdentifier) => {
								navigate(`/post/${marketIdentifier}`);
							}}
						/>
					);
				})}
			</Flex>
			<Flex flexDirection="column" width={"30%"} paddingTop={5}>
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<Heading size="sm" marginBottom={2}>
						Your Groups
					</Heading>
					{groupDetails.map((group, index) => {
						return (
							<GroupDisplayName
								key={index}
								group={group}
								followStatusVisible={false}
								settingsVisible={true}
							/>
						);
					})}
				</Flex>
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
				>
					<Heading size={"sm"}>Group rules are simple!</Heading>
					<Text>
						1. Challenge any post that you find not suitable for the
						feed
					</Text>
					<Text>
						2. Only post things you think are suitable for the feed
						:)
					</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Page;
