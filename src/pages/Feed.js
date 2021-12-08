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
	useQueryMarketTradeAndStakeInfoByUser,
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
	generateProfileInitials,
} from "../utils";
import {
	sUpdateProfile,
	sUpdateOraclesInfoObj,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdateMarketsMetadata,
	sUpdateGroupsFollowed,
	selectGroupsFollowed,
	selectRinkebyLatestBlockNumber,
	sAddGroupFollow,
	sDeleteGroupFollow,
	selectFeedDisplayConfigs,
	selectUserProfile,
	sUpdateLoginModalIsOpen,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from "react-router";
import ConfigSidebar from "../components/ConfigSiderbar";
import { FireIcon } from "../components/FireIcon";
import { HomeIcon } from "../components/HomeIcon";
import { ArrowBackIcon } from "@chakra-ui/icons";
import SuggestionSidebar from "../components/SuggestionSidebar";
import PrimaryButton from "../components/PrimaryButton";
import NoPostsTag from "../components/NoPostsTag";

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const location = useLocation();
	const urlParams = useParams();
	const groupId = urlParams.groupId;
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
	const [popularGroups, setPopularGroups] = useState([]);
	const [groupDetails, setGroupDetails] = useState({});
	const [loadingMarkets, setLoadingMarkets] = useState(true);

	const timestamp24HrsBefore = Math.floor(Date.now() / 1000) - 24 * 3600;
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
		if (feedType == undefined) {
			return;
		}

		if (feedType == 0) {
			setPagination({ first: 10, skip: 0 });
		} else if (feedType == 1) {
			let idsToLowerCase = Object.keys(groupsFollowed).map((id) =>
				id.toLowerCase()
			);
			setPagination({ first: 10, skip: 0 });
			setQueryOracles(idsToLowerCase);
		} else if (feedType == 2) {
			setPagination({ first: 10, skip: 0 });
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
			// console.log("This is the result, :", _result);
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
			setMarkets([..._result.data.markets]);
		} else {
			setMarkets([]);
		}

		// end loading
		setLoadingMarkets(false);
	}, [result0, result1, feedType]);

	useEffect(async () => {
		if (groupId) {
			let res = await findModeratorsDetails([groupId]);
			if (res && res.groupsDetails && res.groupsDetails.length > 0) {
				let groupDetails = res.groupsDetails[0];
				setGroupDetails(groupDetails);
			}
		}
	}, [groupId]);

	function noPostVisible(markets) {
		const post = markets.find((obj) => {
			const pM = populateMarketWithMetadata(
				obj,
				oraclesInfoObj,
				marketsMetadata,
				groupsFollowed,
				rinkebyLatestBlockNumber
			);

			if (
				pM.oracleInfo != undefined &&
				pM.probability1 >= Number(Number(feedThreshold) / 100)
			) {
				return true;
			}
		});

		return post == undefined;
	}

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
							>
								{groupsFollowed[groupId]
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
				{loadingMarkets == true ? <Loader /> : undefined}

				{loadingMarkets == false && noPostVisible(markets) ? (
					<Flex
						flexDirection={"column"}
						marginLeft="3"
						marginRight="3"
					>
						<Heading size="lg" marginBottom={1}>
							Skip algos, and see what people bet on you would
							want to see!
						</Heading>
						<Text>
							Join groups, make posts, place bets and curate
							content
						</Text>
					</Flex>
				) : undefined}

				{(feedType === 1 ||
					(feedType == 0 && noPostVisible(markets))) &&
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
				noPostVisible(markets) ? (
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
					? markets.map((market) => {
							const populatedMarket = populateMarketWithMetadata(
								market,
								oraclesInfoObj,
								marketsMetadata,
								groupsFollowed,
								rinkebyLatestBlockNumber
							);

							if (!populatedMarket.oracleInfo) {
								return;
							}

							if (
								populatedMarket.probability1 <
								Number(feedThreshold) / 100
							) {
								return;
							}
							return (
								<PostDisplay
									style={{
										marginBottom: 25,
									}}
									market={populatedMarket}
									onImageClick={(marketIdentifier) => {
										navigate(`/post/${marketIdentifier}`);
									}}
								/>
							);
					  })
					: undefined}
			</Flex>
			<SuggestionSidebar />
			<Spacer />
		</Flex>
	);
}

export default Page;
