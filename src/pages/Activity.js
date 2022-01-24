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
	Select,
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import {
	useCreateNewMarket,
	useQueryMarketsOrderedByLatest,
	useQueryExploreMarkets,
	useQueryMarketByOracles,
	useQueryMarketsByUserInteraction,
	useQueryTokenBalancesByUser,
} from "../hooks";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
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
	determineOutcome,
	parseDecimalToBN,
	formatBNToDecimal,
	filterMarketsByStage,
	filterMarketsByClaim,
	filterMarketsByCreator,
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
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from "react-router";
import Loader from "../components/Loader";
import NoPostsTag from "../components/NoPostsTag";

/**
 * Shows different posts user has interacted with in any form.
 */

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { account } = useEthers();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	const { result: userMarketsResult } = useQueryMarketsByUserInteraction(
		account ? account.toLowerCase() : ""
	);
	const { result: tokenBalancesResult } = useQueryTokenBalancesByUser(
		account ? account.toLowerCase() : ""
	);

	const [markets, setMarkets] = useState([]);
	const [filteredMarkets, setFilteredMarkets] = useState([]);
	const [filter, setFilter] = useState(0);
	const [tokenBalancesObj, setTokenBalancesObj] = useState({});

	const [loading, setLoading] = useState(true);

	useEffect(async () => {
		if (
			userMarketsResult.data == undefined ||
			userMarketsResult.data.user == undefined
		) {
			return;
		}

		const _markets = userMarketsResult.data.user.markets.map(
			(obj) => obj.market
		);
		await stateSetupOraclesInfo(
			filterOracleIdsFromMarketsGraph(_markets),
			dispatch
		);
		await stateSetupMarketsMetadata(
			filterMarketIdentifiersFromMarketsGraph(_markets),
			dispatch
		);
	}, [userMarketsResult]);

	useEffect(() => {
		if (
			userMarketsResult.data == undefined ||
			userMarketsResult.data.user == undefined
		) {
			return;
		}

		setLoading(true);

		const _populatedMarkets = userMarketsResult.data.user.markets.map(
			(obj) =>
				populateMarketWithMetadata(
					obj.market,
					oraclesInfoObj,
					marketsMetadata,
					groupsFollowed,
					rinkebyLatestBlockNumber
				)
		);
		setMarkets(_populatedMarkets);
		setLoading(false);
	}, [oraclesInfoObj, marketsMetadata, groupsFollowed, userMarketsResult]);

	useEffect(() => {
		if (tokenBalancesResult.data == undefined) {
			return;
		}

		let dict = {};
		tokenBalancesResult.data.tokenBalances.forEach((obj) => {
			dict[obj.tokenId] = {
				...obj,
				balance: parseDecimalToBN(obj.balance),
			};
		});

		setTokenBalancesObj(dict);
	}, [tokenBalancesResult]);

	useEffect(() => {
		if (filter == "" || filter == undefined) {
			setFilteredMarkets(markets);
			return;
		}

		let _markets = [];
		if (filter == 0) {
			_markets = markets;
		}
		if (filter == 1) {
			_markets = filterMarketsByStage(markets, 1);
		}
		if (filter == 2) {
			_markets = filterMarketsByStage(markets, 2);
		}
		if (filter == 3) {
			_markets = filterMarketsByStage(markets, 3);
		}
		if (filter == 4) {
			_markets = filterMarketsByStage(markets, 4);
		}
		if (filter == 5) {
			_markets = filterMarketsByClaim(markets, tokenBalancesObj);
		}
		if (filter == 6) {
			_markets = filterMarketsByCreator(markets, account);
		}
		setFilteredMarkets(_markets);
	}, [filter, markets, tokenBalancesObj]);

	return (
		<Flex>
			<Spacer />
			<Flex width={"50%"} flexDirection={"column"}>
				<Flex flexDirection={"column"} marginTop={5} marginBottom={5}>
					<Text marginBottom={1} fontSize={"16"} fontWeight="bold">
						Filter Posts
					</Text>
					<Select
						onChange={(e) => {
							setFilter(e.target.value);
						}}
						fontSize={14}
						placeholder="No Filter"
						borderWidth={1}
						borderStyle="solid"
						borderColor="#0B0B0B"
					>
						<option value={1}>Live</option>
						<option value={2}>Challenge</option>
						<option value={3}>Resolution</option>
						<option value={4}>Final</option>
						<option value={5}>Pending Redeem</option>
						<option value={6}>Created by you</option>
					</Select>
				</Flex>
				{loading === true ? <Loader /> : undefined}
				{loading === false && filteredMarkets.length === 0 ? (
					<NoPostsTag marginTop={10} />
				) : undefined}
				{filteredMarkets.map((market, index) => {
					return (
						<PostDisplay
							key={index}
							style={{
								marginBottom: 20,
							}}
							market={market}
							onImageClick={() => {
								navigate(`/post/${market.marketIdentifier}`);
							}}
						/>
					);
				})}
			</Flex>
			<Spacer />
		</Flex>
	);
}

export default Page;
