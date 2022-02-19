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
import { useQueryExploreMarkets, useQueryMarketByOracles } from "../hooks";
import useInView from "react-cool-inview";
import { useEffect, useState } from "react";
import {
	filterOracleIdsFromMarketsGraph,
	filterMarketIdentifiersFromMarketsGraph,
	populateMarketWithMetadata,
	followGroup,
	findModeratorsDetails,
	numStrFormatter,
	stateSetupOraclesInfo,
	stateSetupMarketsMetadata,
	unfollowGroup,
	generateProfileInitials,
	isValidAddress,
	FEED_BATCH_COUNT,
	findPosts,
	getExploreFeed,
	getHomeFeed,
	COLORS,
} from "../utils";
import {
	selectOracleInfoObj,
	selectMarketsMetadata,
	selectGroupsFollowed,
	selectRinkebyLatestBlockNumber,
	sAddGroupFollow,
	sDeleteGroupFollow,
	selectFeedDisplayConfigs,
	selectUserProfile,
	sUpdateLoginModalIsOpen,
	selectBadMarketIdentifiers,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { resolvePath, useLocation, useNavigate, useParams } from "react-router";
import ConfigSidebar from "../components/ConfigSiderbar";
import { FireIcon } from "../components/FireIcon";
import { HomeIcon } from "../components/HomeIcon";
import { ArrowBackIcon } from "@chakra-ui/icons";
import SuggestionSidebar from "../components/SuggestionSidebar";
import PrimaryButton from "../components/PrimaryButton";
import CreatePostStrip from "../components/CreatePostStrip";
import PopularGroups from "../components/PopularGroups";
import WETHSwapper from "../components/WETHSwapper";
import HelpBox from "../components/HelpBox";

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const badMarketIdentifiers = useSelector(selectBadMarketIdentifiers);

	const location = useLocation();
	const urlParams = useParams();
	const groupId =
		urlParams.groupId != undefined && isValidAddress(urlParams.groupId)
			? urlParams.groupId
			: undefined;

	const feedType = (() => {
		if (location.pathname == "/explore" || location.pathname == "/") {
			return 0;
		}
		if (location.pathname == "/home") {
			return 1;
		}
	})();

	const groupsFollowed = useSelector(selectGroupsFollowed);

	const [posts, setPosts] = useState([]);
	const [pagination, setPagination] = useState({ first: 0, skip: 0 });

	// get all posts depending on feedType
	useEffect(async () => {
		let res;
		if (feedType == 0) {
			res = await getExploreFeed();
		} else if (feedType == 1) {
			res = await getHomeFeed();
		}
		if (res == undefined) {
			// TODO throw error
			return;
		}
		setPosts(res.posts);
	}, [feedType]);

	// infinite scroll
	// const { observe } = useInView({
	// 	rootMargin: "30px",
	// 	// When the last item comes to the viewport
	// 	onEnter: ({ unobserve }) => {
	// 		unobserve();
	// 		setLoadingMarkets(true);
	// 		setPagination({
	// 			first: FEED_BATCH_COUNT,
	// 			skip: markets.length,
	// 		});
	// 	},
	// });

	return (
		<Flex width={"100%"}>
			<Flex
				flexDirection="column"
				width={"70%"}
				padding={5}
				minHeight="100vh"
			>
				<CreatePostStrip />
				{posts.length == 0 ||
				posts.filter(
					(p) => badMarketIdentifiers[p.marketIdentifier] == undefined
				).length == 0 ? (
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						marginBottom={4}
						flexDirection={"column"}
					>
						<Text fontSize={15}>
							Nothing to Show... Try posting something? ;)
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

					if (badMarketIdentifiers[post.marketIdentifier] == true) {
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
							post={post}
							onImageClick={(marketIdentifier) => {
								navigate(`/post/${marketIdentifier}`);
							}}
						/>
					);
				})}
			</Flex>
			<Flex flexDirection="column" width={"30%"} paddingTop={5}>
				<PopularGroups />
				<WETHSwapper />
				<HelpBox
					heading={"How does this work?"}
					pointsArr={[
						"1. Join groups and post interesting things in them.",
						"2. Didn't find one of interest? Create one by going to menu on top right.",
						"3. For every post you put some amount (0.05 WETH) to assure everyone that your post is relevant to the group. So, in case it isn't then anyone can challenge you!",
						"4. You can also challenge posts that you think are not related to the grourp, and win some amount.",
					]}
				/>
			</Flex>
		</Flex>
	);
}

export default Page;

{
	/* <Flex margin={3}>
	<PrimaryButton
		onClick={() => {
			if (userProfile && account) {
				return;
			}
			dispatch(sUpdateLoginModalIsOpen(true));
		}}
		title={"Sign in"}
	/>
</Flex>; */
}
