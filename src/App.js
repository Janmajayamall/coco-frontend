import "./App.css";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import NewPost from "./pages/NewPost";
import NewModerator from "./pages/NewModerator";
import OracleConfig from "./pages/OracleConfig";
import Explore from "./pages/Explore";
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
	getPopularModerators,
	filterOraclesFromMarketsGraph,
	findModeratorsByIdArr,
	filterMarketIdentifiersFromMarketsGraph,
	findPostsByMarketIdentifierArr,
	populateMarketWithMetadata,
} from "./utils";
import {
	sUpdateProfile,
	sUpdateOraclesInfoObj,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdateMarketsMetadata,
} from "./redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router";

const web3 = new Web3();

function App() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);

	const { account, chainId } = useEthers();
	const { state, send } = useCreateNewMarket();

	const { result, reexecuteQuery } = useQueryExploreMarkets();

	const [markets, setMarkets] = useState([]);

	useEffect(async () => {
		var res = await getUser();
		if (res != undefined) {
			dispatch(sUpdateProfile(res.user));
		}
		res = await findAllFollows();
	}, []);

	useEffect(async () => {
		if (result.data && result.data.markets) {
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

	function Post({ market }) {
		return (
			<Box>
				<Flex paddingBottom={3} paddingTop={4}>
					<Flex alignItems="center">
						<Avatar
							size="sm"
							name="Dan Abrahmov"
							src="https://bit.ly/dan-abramov"
						/>
						<Heading marginLeft={2} size="xs">
							{market.oracleInfo.name}
						</Heading>
					</Flex>
					<Spacer />
					<Text>dwa</Text>
				</Flex>
				<Image src={"https://bit.ly/2Z4KKcF"} />
			</Box>
		);
	}

	return (
		<div>
			<HeaderWarning />
			<Flex borderBottom="1px" borderColor="#BDBDBD">
				<Flex
					style={{
						paddingRight: 224,
						paddingLeft: 224,
						width: "100%",
						justifyContent: "center",
						alignItems: "center",
						height: 96,
					}}
				>
					<Heading>Mimi</Heading>
					<Spacer />
					<ConnectButton />
					<LoginButton />
				</Flex>
			</Flex>
			<Routes>
				<Route path="/add" element={<NewPost />} />
				<Route path="/addModerator" element={<NewModerator />} />
				<Route path="/oracle/:address" element={<OracleConfig />} />
				<Route path="/explore" element={<Explore />} />
				<Route
					path="/"
					element={
						<div
							style={{
								paddingRight: 208,
								paddingLeft: 208,
							}}
						>
							<Flex>
								<Flex
									width={268}
									height={100}
									backgroundColor="yellow.300"
								></Flex>
								<Flex
									flexDirection="column"
									width={600}
									paddingRight={21}
									paddingLeft={21}
									backgroundColor="yellow.400"
								>
									{markets.map((market) => {
										return (
											<Post
												market={populateMarketWithMetadata(
													market,
													oraclesInfoObj,
													marketsMetadata
												)}
											/>
										);
									})}
								</Flex>
								<Flex
									width={368}
									height={100}
									backgroundColor="yellow.900"
									paddingRight={6}
									paddingLeft={6}
									paddingTop={5}
									flexDirection="column"
								>
									<Heading size="md" marginBottom={5}>
										Explore Groups
									</Heading>
									<Flex>
										<Text>daiwodja</Text>
										<Spacer />
										<Button size="sm">daow</Button>
									</Flex>
								</Flex>
							</Flex>
						</div>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
