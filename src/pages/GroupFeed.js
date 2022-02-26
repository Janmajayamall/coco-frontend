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
	numStrFormatter,
	followGroup,
	unfollowGroup,
	generateProfileInitials,
	isValidAddress,
	FEED_BATCH_COUNT,
	findPosts,
	findGroupsDetails,
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
import { useLocation, useNavigate, useParams } from "react-router";
import ConfigSidebar from "../components/ConfigSiderbar";
import { FireIcon } from "../components/FireIcon";
import { HomeIcon } from "../components/HomeIcon";
import { ArrowBackIcon } from "@chakra-ui/icons";
import PrimaryButton from "../components/PrimaryButton";
import GroupDetails from "../components/GroupDetails";
import CreatePostStrip from "../components/CreatePostStrip";
import HelpBox from "../components/HelpBox";

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
			? urlParams.groupId.toLowerCase()
			: undefined;

	const badMarketIdentifiers = useSelector(selectBadMarketIdentifiers);

	const [groupDetails, setGroupDetails] = useState(null);
	const [posts, setPosts] = useState([]);

	// set group details
	useEffect(async () => {
		setGroupDetails(null);
		if (groupId) {
			let res = await findGroupsDetails([groupId]);
			if (res && res.groupsDetails && res.groupsDetails.length > 0) {
				let groupDetails = res.groupsDetails[0];
				setGroupDetails(groupDetails);
			}
		}
	}, [groupId]);

	// set group posts
	useEffect(async () => {
		if (groupId == undefined) {
			return;
		}

		const res = await findPosts(
			{
				groupAddress: groupId,
			},
			{
				createdAt: -1,
			}
		);

		if (res == undefined) {
			// TODO throw error
			return;
		}
		setPosts(res.posts);
	}, [groupId]);

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
				<GroupDetails groupDetails={groupDetails} followButton={true} />
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
						<Text>
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
				<HelpBox
					heading={"Group Rules"}
					pointsArr={[
						"1. Your posts should be relevant to the group :)",
						"2. Challenge to win reward if you think some post isn't suitable for group's feed",
					]}
				/>
			</Flex>
		</Flex>
	);
}

export default Page;
