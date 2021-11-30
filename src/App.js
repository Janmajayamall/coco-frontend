import "./App.css";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import PostDisplay from "./components/PostDisplay";
import NewPost from "./pages/NewPost";
import NewModerator from "./pages/NewModerator";
import OracleConfig from "./pages/OracleConfig";
import Personal from "./pages/Personal";

import Feed from "./pages/Feed";
import Post from "./pages/Post";
import Pages from "./pages/Pages";
import PageSettings from "./pages/PageSettings";
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
} from "./hooks";
import HeaderWarning from "./components/HeaderWarning";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
	newPost,
	updateModerator,
	toCheckSumAddress,
	getUser,
	findAllFollows,
	filterOracleIdsFromMarketsGraph,
	findModeratorsByIdArr,
	filterMarketIdentifiersFromMarketsGraph,
	findPostsByMarketIdentifierArr,
	populateMarketWithMetadata,
	findPopularModerators,
	followModerator,
	getRinkebyLatestBlockNumber,
} from "./utils";
import {
	sUpdateProfile,
	sUpdateOraclesInfoObj,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdateMarketsMetadata,
	sUpdateGroupsFollowed,
	selectGroupsFollowed,
	sUpdateRinkebyLatestBlockNumber,
	selectRinkebyLatestBlockNumber,
} from "./redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router";
import LoginModal from "./components/LoginModal";
import PostTradeModal from "./components/PostTradeModal";

const web3 = new Web3();

function App() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const groupsFollowed = useSelector(selectGroupsFollowed);
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	const { result, reexecuteQuery } = useQueryExploreMarkets();

	const [markets, setMarkets] = useState([]);

	useEffect(async () => {
		const blockNumber = await getRinkebyLatestBlockNumber();
		dispatch(sUpdateRinkebyLatestBlockNumber(blockNumber));
	}, []);

	useEffect(() => {
		const interval = setInterval(async () => {
			const blockNumber = await getRinkebyLatestBlockNumber();

			dispatch(sUpdateRinkebyLatestBlockNumber(blockNumber));
		}, 5000);
		return () => clearInterval(interval);
	}, [rinkebyLatestBlockNumber]);

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
		if (result.data && result.data.markets) {
			const oracleIds = filterOracleIdsFromMarketsGraph(
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
		<div>
			<HeaderWarning />
			<Flex borderBottom="1px" borderColor="#BDBDBD">
				<Flex
					style={{
						width: "100%",
						justifyContent: "center",
						alignItems: "center",
						height: 96,
					}}
				>
					<Flex
						style={{
							width: "100%",
							height: "100%",
							maxWidth: 1650,
							justifyContent: "center",
							alignItems: "center",
							paddingLeft: 5,
							paddingRight: 5,
						}}
					>
						<Heading>Mimi</Heading>
						<Spacer />
						<ConnectButton />
					</Flex>
				</Flex>
			</Flex>
			<LoginModal />
			<Routes>
				<Route path="/add" element={<NewPost />} />
				<Route path="/addModerator" element={<NewModerator />} />
				<Route path="/oracle/:address" element={<OracleConfig />} />
				<Route path="/explore" element={<Feed />} />
				<Route path="/home" element={<Feed />} />
				<Route path="/group/:groupId" element={<Feed />} />
				<Route path="/" element={<Feed />} />
				<Route path="/post/:postId" element={<Post />} />
				<Route path="/settings/pages" element={<Pages />} />
				<Route
					path="/settings/pages/:pageId"
					element={<PageSettings />}
				/>
				<Route path="/personal" element={<Personal />} />
			</Routes>
		</div>
	);
}

export default App;
