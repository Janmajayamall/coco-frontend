import ConnectButton from "../components/ConnectButton";
import LoginButton from "../components/LoginButton";
import PostDisplay from "../components/PostDisplay";
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
	toCheckSumAddress,
	getUser,
	findAllFollows,
	filterOraclesFromMarketsGraph,
	findModeratorsByIdArr,
	filterMarketIdentifiersFromMarketsGraph,
	findPostsByMarketIdentifierArr,
	populateMarketWithMetadata,
	findPopularModerators,
	followModerator,
	findModeratorsDetails,
	numStrFormatter,
} from "../utils";
import {
	sUpdateProfile,
	sUpdateOraclesInfoObj,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdateMarketsMetadata,
	sUpdateGroupsFollowed,
	selectGroupsFollowed,
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

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

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

	const [pagination, setPagination] = useState({ first: 0, skip: 0 });
	const [queryOracles, setQueryOracles] = useState([]);
	const [markets, setMarkets] = useState([]);
	const [popularGroups, setPopularGroups] = useState([]);
	const [groupDetails, setGroupDetails] = useState({});

	const { result: result0, reexecuteQuery: rQ0 } = useQueryExploreMarkets(
		pagination.first,
		pagination.skip,
		0,
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
	}, [groupsFollowed]);

	useEffect(() => {
		if (feedType == 0 && pagination.first > 0) {
			rQ0();
		}
	}, [pagination]);

	useEffect(() => {
		if (
			(feedType == 1 || feedType == 2) &&
			queryOracles.length > 0 &&
			pagination.first > 0
		) {
			rQ1();
		}
	}, [queryOracles, pagination]);

	useEffect(async () => {
		if (feedType == undefined) {
			return;
		}

		let _result;
		if (feedType == 0) {
			_result = result0;
		} else if (feedType == 1 || feedType == 2) {
			_result = result1;
		}

		console.log(_result, " this is result");

		if (_result.data && _result.data.markets) {
			console.log(_result.data.markets);
			const oracleIds = filterOraclesFromMarketsGraph(
				_result.data.markets
			);
			let res = await findModeratorsByIdArr(oracleIds);
			dispatch(sUpdateOraclesInfoObj(res.moderators));

			const marketIdentifiers = filterMarketIdentifiersFromMarketsGraph(
				_result.data.markets
			);
			res = await findPostsByMarketIdentifierArr(marketIdentifiers);
			dispatch(sUpdateMarketsMetadata(res.posts));

			setMarkets([...markets, ..._result.data.markets]);
		}
	}, [result0, result1]);

	useEffect(async () => {
		const ignoreList = Object.keys(groupsFollowed);
		let res = await findPopularModerators(ignoreList);

		setPopularGroups(res.moderators);
	}, []);

	useEffect(async () => {
		var res = await getUser();
		if (res != undefined) {
			dispatch(sUpdateProfile(res.user));
		}
		res = await findAllFollows();

		if (res != undefined) {
			dispatch(sUpdateGroupsFollowed(res.relations));
		}
	}, []);

	useEffect(async () => {
		if (groupId) {
			let res = await findModeratorsDetails([groupId]);
			if (res && res.groupsDetails && res.groupsDetails.length > 0) {
				let groupDetails = res.groupsDetails[0];
				setGroupDetails(groupDetails);
			}
		}
	}, []);

	return (
		<Flex
			style={{
				paddingRight: 20,
				paddingLeft: 20,
			}}
		>
			<Spacer />
			<Flex width={"20%"}>
				<ConfigSidebar />
			</Flex>

			<Flex
				flexDirection="column"
				width={"50%"}
				paddingRight={21}
				paddingLeft={21}
				borderRightWidth={1}
				borderLeftWidth={1}
				borderColor={"#E0E0E0"}
			>
				{groupId ? (
					<Flex flexDirection="column">
						<Flex
							marginBottom={5}
							marginTop={5}
							alignItems="center"
						>
							<ArrowBackIcon
								onClick={() => {
									navigate("/feed");
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
								name="Dan Abrahmov"
								src="https://bit.ly/dan-abramov"
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
								Group description. This group is only for good
								posts. Please avoid posting any bad posts
							</Text>
						</Flex>
						<Flex>
							<Button
								backgroundColor="#0B0B0B"
								color="#FDFDFD"
								size="sm"
								variant="solid"
							>
								{groupsFollowed[toCheckSumAddress(groupId)]
									? "Leave Group"
									: "Join Group"}
							</Button>
						</Flex>
					</Flex>
				) : undefined}
				{feedType == 0 || feedType == 1 ? (
					<Flex justifyContent="center" margin={5}>
						<FireIcon marginRight={5} w={10} h={10} />
						<HomeIcon marginLeft={5} w={10} h={10} />
					</Flex>
				) : undefined}
				{markets.map((market) => {
					return (
						<PostDisplay
							market={populateMarketWithMetadata(
								market,
								oraclesInfoObj,
								marketsMetadata,
								groupsFollowed
							)}
						/>
					);
				})}
			</Flex>
			<Flex
				width={"20%"}
				paddingRight={6}
				paddingLeft={6}
				paddingTop={5}
				flexDirection="column"
			>
				<Heading size="md" marginBottom={5}>
					Explore Groups
				</Heading>
				<Flex flexDirection={"column"}>
					{popularGroups.map((group) => {
						return (
							<Flex>
								<Text>{group.name}</Text>
								<Spacer />
								<Button
									onClick={async () => {
										await followModerator(
											group.oracleAddress
										);
									}}
									size="sm"
								>
									daow
								</Button>
							</Flex>
						);
					})}
				</Flex>
			</Flex>
			<Spacer />
		</Flex>
	);
}

export default Page;
