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
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { resolvePath, useLocation, useNavigate, useParams } from "react-router";
import ConfigSidebar from "../components/ConfigSiderbar";
import { FireIcon } from "../components/FireIcon";
import { HomeIcon } from "../components/HomeIcon";
import { ArrowBackIcon } from "@chakra-ui/icons";
import SuggestionSidebar from "../components/SuggestionSidebar";
import PrimaryButton from "../components/PrimaryButton";

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

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
		let res = await findPosts({});
		console.log(resolvePath);
		if (res == undefined) {
			// TODO throw error
			return;
		}
		setPosts(res.posts);
	}, []);

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
		<Flex
			style={{
				paddingRight: 20,
				paddingLeft: 20,
			}}
		>
			<Spacer />

			<Flex
				flexDirection="column"
				width={"50%"}
				minHeight="100vh"
				paddingRight={21}
				paddingLeft={21}
				borderRightWidth={1}
				borderLeftWidth={1}
				borderColor={"#E0E0E0"}
			>
				{posts.map((post, index) => {
					return (
						<PostDisplay
							key={index}
							// setRef={
							// 	filteredMarkets.length % FEED_BATCH_COUNT === 0
							// 		? index === filteredMarkets.length - 1
							// 			? observe
							// 			: null
							// 		: null
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
			<SuggestionSidebar />
			<Spacer />
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
