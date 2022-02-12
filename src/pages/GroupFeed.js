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
	followModerator,
	findModeratorsDetails,
	numStrFormatter,
	stateSetupOraclesInfo,
	stateSetupMarketsMetadata,
	unfollowModerator,
	generateProfileInitials,
	isValidAddress,
	FEED_BATCH_COUNT,
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
import { useLocation, useNavigate, useParams } from "react-router";
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
	// TODO if group id is undefined then show error
	const groupId =
		urlParams.groupId != undefined && isValidAddress(urlParams.groupId)
			? urlParams.groupId
			: undefined;

	const groupsFollowed = useSelector(selectGroupsFollowed);

	const [pagination, setPagination] = useState({ first: 0, skip: 0 });
	const [queryOracles, setQueryOracles] = useState([]);
	const [markets, setMarkets] = useState([]);
	const [filteredMarkets, setFilteredMarkets] = useState([]);
	const [groupDetails, setGroupDetails] = useState({});
	const [loadingMarkets, setLoadingMarkets] = useState(true);

	const timestamp24HrsBefore = Math.floor(Date.now() / 1000) - 168 * 3600; // seven days
	const { result: result0, reexecuteQuery: rQ0 } = useQueryExploreMarkets(
		pagination.first,
		pagination.skip,
		timestamp24HrsBefore,
		true
	);
	const { result: result1, reexecuteQuery: rQ1 } = useQueryMarketByOracles(
		pagination.first,
		pagination.skip,
		queryOracles,
		true
	);

	useEffect(async () => {
		setGroupDetails({});
		if (groupId) {
			let res = await findModeratorsDetails([groupId]);
			if (res && res.groupsDetails && res.groupsDetails.length > 0) {
				let groupDetails = res.groupsDetails[0];
				setGroupDetails(groupDetails);
			}
		}
	}, [groupId]);

	// infinite scroll
	const { observe } = useInView({
		rootMargin: "30px",
		// When the last item comes to the viewport
		onEnter: ({ unobserve }) => {
			unobserve();
			setLoadingMarkets(true);
			setPagination({
				first: FEED_BATCH_COUNT,
				skip: markets.length,
			});
		},
	});

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
				<Flex flexDirection="column" marginBottom={5}>
					<Flex marginBottom={5} marginTop={5} alignItems="center">
						<ArrowBackIcon
							onClick={() => {
								navigate("/explore");
							}}
							marginRight={5}
							w={5}
							h={5}
							color="#0B0B0B"
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						/>
						<Heading size="sm">
							{groupDetails.name ? groupDetails.name : ""}
						</Heading>
					</Flex>
					<Flex marginBottom={5}>
						<Avatar
							size="md"
							name={generateProfileInitials(groupDetails.name)}
							marginRight={5}
						/>
						<Box marginRight={5}>
							<Text fontSize="md">
								{numStrFormatter(
									groupDetails.followCount
										? groupDetails.followCount
										: 0
								)}
							</Text>
							<Text fontSize="sm">members</Text>
						</Box>
						<Box marginRight={5}>
							<Text fontSize="md">
								{numStrFormatter(
									groupDetails.postCount
										? groupDetails.postCount
										: 0
								)}
							</Text>
							<Text fontSize="sm">contributions</Text>
						</Box>
					</Flex>
					<Flex marginBottom={5}>
						<Text fontSize="sm">{groupDetails.description}</Text>
					</Flex>
					<Flex>
						<Button
							backgroundColor="#0B0B0B"
							color="#FDFDFD"
							size="sm"
							variant="solid"
							onClick={async () => {
								if (groupsFollowed[groupId] != undefined) {
									// leave group
									const res = await unfollowModerator(
										groupId
									);
									if (res == undefined) {
										return;
									}
									dispatch(sDeleteGroupFollow(groupId));
								} else {
									// join group
									const res = await followModerator(groupId);
									if (res == undefined) {
										return;
									}
									dispatch(sAddGroupFollow(groupId));
								}
							}}
						>
							{groupsFollowed[groupId] != undefined
								? "Leave Group"
								: "Join Group"}
						</Button>
					</Flex>
				</Flex>
			</Flex>
			<SuggestionSidebar />
			<Spacer />
		</Flex>
	);
}

export default Page;
