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

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);

	const { result, reexecuteQuery } = useQueryExploreMarkets();

	const [markets, setMarkets] = useState([]);
	const [popularGroups, setPopularGroups] = useState([]);

	useEffect(async () => {
		const ignoreList = Object.keys(groupsFollowed);
		let res = await findPopularModerators(ignoreList);
		console.log(res);
		setPopularGroups(res.moderators);
	}, []);

	useEffect(async () => {
		var res = await getUser();
		if (res != undefined) {
			dispatch(sUpdateProfile(res.user));
		}
		res = await findAllFollows();
		console.log(res);
		dispatch(sUpdateGroupsFollowed(res.relations));
	}, []);

	useEffect(async () => {
		if (result.data && result.data.markets) {
			console.log(result.data.markets);
			const oracleIds = filterOraclesFromMarketsGraph(
				result.data.markets
			);
			let res = await findModeratorsByIdArr(oracleIds);
			dispatch(sUpdateOraclesInfoObj(res.moderators));

			const marketIdentifiers = filterMarketIdentifiersFromMarketsGraph(
				result.data.markets
			);
			res = await findPostsByMarketIdentifierArr(marketIdentifiers);
			dispatch(sUpdateMarketsMetadata(res.posts));

			setMarkets(result.data.markets);
		}
	}, [result]);

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
							<Heading size="sm">Group Name</Heading>
						</Flex>
						<Flex marginBottom={5}>
							<Avatar
								size="md"
								name="Dan Abrahmov"
								src="https://bit.ly/dan-abramov"
								marginRight={5}
							/>
							<Box marginRight={5}>
								<Text fontSize="md">17k</Text>
								<Text fontSize="sm">members</Text>
							</Box>
							<Box marginRight={5}>
								<Text fontSize="md">120m</Text>
								<Text fontSize="sm">contributions</Text>
							</Box>
						</Flex>
						<Flex>
							<Text fontSize="sm">
								Group description. This group is only for good
								posts. Please avoid posting any bad posts
							</Text>
						</Flex>
					</Flex>
				) : (
					<Flex justifyContent="center" margin={5}>
						<FireIcon marginRight={5} w={10} h={10} />
						<HomeIcon marginLeft={5} w={10} h={10} />
					</Flex>
				)}
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
