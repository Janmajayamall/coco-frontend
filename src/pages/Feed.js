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
		if (groupId) {
			return 2;
		}
	})();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);
	const feedDisplayConfigs = useSelector(selectFeedDisplayConfigs);
	const feedThreshold = feedDisplayConfigs.threshold;

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

	// initial graph protocol call
	useEffect(() => {
		setMarkets([]);
		setFilteredMarkets([]);

		if (feedType == undefined) {
			return;
		}

		setPagination({ first: FEED_BATCH_COUNT, skip: 0 });
		if (feedType == 0) {
			setQueryOracles([]);
		} else if (feedType == 1) {
			let idsToLowerCase = Object.keys(groupsFollowed).map((id) =>
				id.toLowerCase()
			);
			setQueryOracles(idsToLowerCase);
		} else if (feedType == 2) {
			setQueryOracles([groupId.toLowerCase()]);
		}
	}, [groupsFollowed, feedType, groupId]);

	useEffect(() => {
		if (feedType == 0 && pagination.first > 0) {
			rQ0();
		}
	}, [pagination, feedType]);

	useEffect(() => {
		if (
			(feedType == 1 || feedType == 2) &&
			queryOracles.length > 0 &&
			pagination.first > 0
		) {
			rQ1();
		}
	}, [queryOracles, pagination, feedType]);

	useEffect(async () => {
		if (feedType == undefined) {
			setMarkets([]);
			return;
		}

		// start loading
		setLoadingMarkets(true);

		let _result;
		if (feedType == 0) {
			_result = result0;
		} else if (feedType == 1 || feedType == 2) {
			_result = result1;
		}

		if (_result.data && _result.data.markets) {
			await stateSetupOraclesInfo(
				filterOracleIdsFromMarketsGraph(_result.data.markets),
				dispatch
			);

			await stateSetupMarketsMetadata(
				filterMarketIdentifiersFromMarketsGraph(_result.data.markets),
				dispatch
			);

			// setMarkets([...markets, ..._result.data.markets]); TODO uncomment this for pagination to work
			setMarkets([...markets, ..._result.data.markets]);
		} else {
			setMarkets([]);
		}

		// end loading
		setLoadingMarkets(false);
	}, [result0, result1, feedType]);

	useEffect(() => {
		const _filteredMarkets = [];
		markets.forEach((market) => {
			const populatedMarket = populateMarketWithMetadata(
				market,
				oraclesInfoObj,
				marketsMetadata,
				groupsFollowed,
				rinkebyLatestBlockNumber
			);
			if (
				populatedMarket.oracleInfo != undefined &&
				populatedMarket.marketMetadata != undefined &&
				populatedMarket.probability1 >= Number(feedThreshold) / 100
			) {
				_filteredMarkets.push(populatedMarket);
			}
		});
		setFilteredMarkets(_filteredMarkets);
	}, [
		feedThreshold,
		markets,
		oraclesInfoObj,
		marketsMetadata,
		groupsFollowed,
		rinkebyLatestBlockNumber,
	]);

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
			<ConfigSidebar />
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
				{groupId ? (
					<Flex flexDirection="column" marginBottom={5}>
						<Flex
							marginBottom={5}
							marginTop={5}
							alignItems="center"
						>
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
								name={generateProfileInitials(
									groupDetails.name
								)}
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
							<Text fontSize="sm">
								{groupDetails.description}
							</Text>
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
										const res = await followModerator(
											groupId
										);
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
				) : undefined}
				{feedType == 0 || feedType == 1 ? (
					<Flex justifyContent="center" margin={5}>
						<IconButton
							onClick={() => {
								if (location.pathname == "/explore") {
									return;
								}
								navigate("/explore");
							}}
							style={
								feedType == 0
									? {
											border: "2px",
											borderStyle: "solid",
											borderColor: "blue.400",
											backgroundColor: "blue.400",
									  }
									: {
											backgroundColor: "#FDFDFD",
									  }
							}
							margin="1"
							icon={
								<FireIcon
									// fill={feedType == 0 ? "#FDFDFD" : "#0B0B0B"}
									fill={"#0B0B0B"}
									w={8}
									h={8}
								/>
							}
						/>

						<IconButton
							onClick={() => {
								if (location.pathname == "/home") {
									return;
								}
								navigate("/home");
							}}
							borderRadius={10}
							style={
								feedType == 1
									? {
											border: "2px",
											borderStyle: "solid",
											borderColor: "blue.400",
											backgroundColor: "blue.400",
									  }
									: {
											backgroundColor: "#FDFDFD",
									  }
							}
							margin="1"
							icon={<HomeIcon fill={"#0B0B0B"} w={8} h={8} />}
						/>
					</Flex>
				) : undefined}
				{loadingMarkets == false && filteredMarkets.length === 0 ? (
					<Flex
						flexDirection={"column"}
						marginLeft="3"
						marginRight="3"
					>
						<Heading size="lg" marginBottom={1}>
							Only see posts that people predict you would like!
						</Heading>
						<Text>
							Join groups, create posts, place predictions, and
							help curate group feeds.
						</Text>
					</Flex>
				) : undefined}

				{(feedType === 1 ||
					(feedType == 0 && filteredMarkets.length === 0)) &&
				loadingMarkets === false &&
				!isAuthenticated ? (
					<Flex margin={3}>
						<PrimaryButton
							onClick={() => {
								if (userProfile && account) {
									return;
								}
								dispatch(sUpdateLoginModalIsOpen(true));
							}}
							title={"Sign in"}
						/>
					</Flex>
				) : undefined}

				{(feedType === 2 || (feedType !== 2 && isAuthenticated)) &&
				loadingMarkets === false &&
				filteredMarkets.length === 0 ? (
					<Flex margin={3}>
						<PrimaryButton
							onClick={() => {
								navigate("/add");
							}}
							title={"Create a Post"}
						/>
					</Flex>
				) : undefined}

				{(feedType === 1 && isAuthenticated) || feedType != 1
					? filteredMarkets.map((market, index) => {
							return (
								<PostDisplay
									key={index}
									setRef={
										filteredMarkets.length %
											FEED_BATCH_COUNT ===
										0
											? index ===
											  filteredMarkets.length - 1
												? observe
												: null
											: null
									}
									style={{
										marginBottom: 45,
										width: "100%",
									}}
									market={market}
									onImageClick={(marketIdentifier) => {
										navigate(`/post/${marketIdentifier}`);
									}}
								/>
							);
					  })
					: undefined}
				{loadingMarkets == true ? <Loader /> : undefined}
			</Flex>
			<SuggestionSidebar />
			<Spacer />
		</Flex>
	);
}

export default Page;
