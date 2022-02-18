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
	findPostsByMarketIdentifierArr,
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

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const badMarketIdentifiers = useSelector(selectBadMarketIdentifiers);

	const location = useLocation();

	const [posts, setPosts] = useState([]);
	const [pagination, setPagination] = useState({ first: 0, skip: 0 });

	// get all posts depending on feedType
	useEffect(async () => {
		if (
			badMarketIdentifiers == undefined ||
			Object.keys(badMarketIdentifiers).length == 0
		) {
			return;
		}

		const res = await findPostsByMarketIdentifierArr(
			Object.keys(badMarketIdentifiers)
		);

		if (res == undefined) {
			// TODO throw error
			return;
		}
		setPosts(res.posts);
	}, [badMarketIdentifiers]);

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
					flexDirection={"column"}
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<Text fontWeight={"bold"}>Why are these posts here?</Text>
					<Text>
						These posts have been challenged that they are not
						suitable for the group they were posted to
					</Text>
				</Flex>
				<Flex
					flexDirection={"column"}
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<Text fontWeight={"bold"}>Can I challenge back?</Text>
					<Text>
						Yes you can, if the challenge period hasn't expired.
					</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Page;
