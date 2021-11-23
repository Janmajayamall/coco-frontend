import "./App.css";
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
import HeaderWarning from "./components/HeaderWarning";

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
} from "./redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router";
import ConfigSidebar from "../components/ConfigSiderbar";
import { FireIcon } from "../components/FireIcon";
import { HomeIcon } from "../components/HomeIcon";

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

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
				<Flex justifyContent="center" margin={5}>
					<FireIcon marginRight={5} w={10} h={10} />
					<HomeIcon marginLeft={5} w={10} h={10} />
				</Flex>
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
