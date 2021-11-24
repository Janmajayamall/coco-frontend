import "./App.css";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import PostDisplay from "./components/PostDisplay";
import NewPost from "./pages/NewPost";
import NewModerator from "./pages/NewModerator";
import OracleConfig from "./pages/OracleConfig";
import Explore from "./pages/Explore";
import Feed from "./pages/Feed";
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
	filterOraclesFromMarketsGraph,
	findModeratorsByIdArr,
	filterMarketIdentifiersFromMarketsGraph,
	findPostsByMarketIdentifierArr,
	populateMarketWithMetadata,
	findPopularModerators,
	followModerator,
} from "./utils";
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
import LoginModal from "./components/LoginModal";
import PostTradeModal from "./components/PostTradeModal";

const web3 = new Web3();

function App() {
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
		if (res != undefined) {
			dispatch(sUpdateGroupsFollowed(res.relations));
		}
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
		<div style={{ maxWidth: 1650 }}>
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
					<Heading>Mimi</Heading>
					<Spacer />
					<ConnectButton />
				</Flex>
			</Flex>
			<LoginModal />
			<PostTradeModal />
			<Routes>
				<Route path="/add" element={<NewPost />} />
				<Route path="/addModerator" element={<NewModerator />} />
				<Route path="/oracle/:address" element={<OracleConfig />} />
				<Route path="/explore" element={<Feed />} />
				<Route path="/home" element={<Feed />} />
				<Route path="/group/:groupId" element={<Feed />} />
				<Route path="/" element={<Feed />} />
			</Routes>
		</div>
	);
}

export default App;
