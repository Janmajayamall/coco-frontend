import "./App.css";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import PostDisplay from "./components/PostDisplay";
import NewPost from "./pages/NewPost";
import NewModerator from "./pages/NewModerator";
import OracleConfig from "./pages/OracleConfig";
import Activity from "./pages/Activity";

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
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
} from "@chakra-ui/react";
import {
	AddIcon,
	ExternalLinkIcon,
	RepeatIcon,
	EditIcon,
	HamburgerIcon,
} from "@chakra-ui/icons";

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
import MainMenu from "./components/MainMenu";

const web3 = new Web3();

function App() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { account } = useEthers();

	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	useEffect(async () => {
		let res = await getRinkebyLatestBlockNumber();
		console.log(res);
		if (res == undefined) {
			return;
		}
		dispatch(sUpdateRinkebyLatestBlockNumber(res.rinkebyLatestBlockNumber));
	}, []);

	useEffect(() => {
		const interval = setInterval(async () => {
			let res = await getRinkebyLatestBlockNumber();
			console.log(res);
			if (res == undefined) {
				return;
			}
			dispatch(
				sUpdateRinkebyLatestBlockNumber(res.rinkebyLatestBlockNumber)
			);
		}, 30000);
		return () => clearInterval(interval);
	}, [rinkebyLatestBlockNumber]);

	useEffect(async () => {
		let res = await getUser();
		if (res == undefined) {
			return;
		}
		dispatch(sUpdateProfile(res.user));

		res = await findAllFollows();
		if (res == undefined) {
			return;
		}
		dispatch(sUpdateGroupsFollowed(res.relations));
	}, [account]);

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
						<Heading
							onClick={() => {
								navigate("/");
							}}
						>
							Mimi
						</Heading>
						<Spacer />
						<ConnectButton />
						<MainMenu />
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
				<Route path="/groups" element={<Pages />} />
				<Route path="/settings/:pageId" element={<PageSettings />} />
				<Route path="/activity" element={<Activity />} />
			</Routes>
		</div>
	);
}

export default App;
