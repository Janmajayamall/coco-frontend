import { useDisclosure } from "@chakra-ui/hooks";
import { useDispatch, useSelector } from "react-redux";
import {
	selectPostTradeModalState,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdatePostTradeModal,
	sUpdateOraclesInfoObj,
	sUpdateMarketsMetadata,
	selectGroupsFollowed,
	selectRinkebyLatestBlockNumber,
} from "../redux/reducers";
import {
	Button,
	Box,
	Text,
	Flex,
	Tabs,
	TabList,
	TabPanel,
	TabPanels,
	Tab,
	NumberInput,
	NumberInputField,
	Table,
	TableCaption,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Tfoot,
	Spacer,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Slider,
	Avatar,
	Heading,
	Image,
	Select,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinTokensForExactCTokens,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
	useQueryTokenApprovalsByUserAndOracle,
	useSellExactTokensForMinCTokens,
} from "../hooks";
import {
	convertBlocksToSeconds,
	convertDecimalStrToBigNumber,
	convertDecimalStrToInt,
	convertIntToDecimalStr,
	determineMarketState,
	filterMarketIdentifiersFromMarketsGraph,
	filterOracleIdsFromMarketsGraph,
	findModeratorsByIdArr,
	findPostsByMarketIdentifierArr,
	formatBNToDecimal,
	getAmountCBySellTokenAmount,
	getAmountCToBuyTokens,
	getAvgPrice,
	getAvgPriceOfOutcomeToken,
	getFavoredOutcomeName,
	getMarketStageName,
	getMarketStateDetails,
	getTempOutcomeInChallengePeriod,
	getTokenAmountToBuyWithAmountC,
	parseDecimalToBN,
	populateMarketWithMetadata,
	roundValueTwoDP,
	TWO_BN,
	useBNInput,
	outcomeDisplayName,
	formatTimeInSeconds,
	determineOutcome,
	getWinningsArr,
	getTradeWinningsArr,
	getStakeWinArr,
	ONE_BN,
	getTradeWinAmount,
	determineStakeWinnings,
	totalAmountReceivedInStakeRedeem,
	marketStageDisplayName,
	ZERO_DECIMAL_STR,
	findTokenIdBalanceInTokenArr,
	stateSetupOraclesInfo,
	stateSetupMarketsMetadata,
	ZERO_BN,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TradingInterface from "../components/TradingInterface";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradePricesBoxes from "../components/TradePriceBoxes";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import StakingInterface from "../components/StakingInterface";
import ChallengeHistoryTable from "../components/ChallengeHistoryTable";
import RedeemWinsInterface from "../components/RedeemInterface";
import addresses from "./../contracts/addresses.json";
import ResolveInterface from "../components/ResolveInterface";
import { makeErrorResult } from "@urql/core";
import Loader from "../components/Loader";

function Page() {
	const urlParams = useParams();
	const postId = urlParams.postId;

	const dispatch = useDispatch();

	const { account } = useEthers();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(postId);
	const {
		result: mSATResult,
		reexecuteQuery: mSATReexecuteQuery,
	} = useQueryMarketTradeAndStakeInfoByUser(
		postId,
		account ? account.toLowerCase() : ""
	);
	const {
		result: tokenApprovalsResult,
		reexecuteQuery: tokenApprovalsReexecuteQuery,
	} = useQueryTokenApprovalsByUserAndOracle(
		account ? account.toLocaleLowerCase() : "",
		result.data && result.data.market ? result.data.market.oracle.id : ""
	);

	useEffect(() => {}, [result]);

	const [market, setMarket] = useState(undefined);
	const [loadingMarket, setLoadingMarket] = useState(true);
	const [tradeHistories, setTradeHistories] = useState([]);
	const [stakeHistories, setStakeHistories] = useState([]);
	const [tradePosition, setTradePosition] = useState({
		amount0: ZERO_BN,
		amount1: ZERO_BN,
	});
	const [stakePosition, setStakePosition] = useState({
		amount0: ZERO_BN,
		amount1: ZERO_BN,
	});
	const [tokenApproval, setTokenApproval] = useState(false);

	useEffect(async () => {
		if (!result.data || !result.data.market) {
			return;
		}
		const _market = result.data.market;

		await stateSetupOraclesInfo(
			filterOracleIdsFromMarketsGraph([_market]),
			dispatch
		);
		await stateSetupMarketsMetadata(
			filterMarketIdentifiersFromMarketsGraph([_market]),
			dispatch
		);
	}, [result]);

	useEffect(() => {
		if (!result.data || !result.data.market) {
			return;
		}

		setMarket(
			populateMarketWithMetadata(
				result.data.market,
				oraclesInfoObj,
				marketsMetadata,
				groupsFollowed,
				rinkebyLatestBlockNumber
			)
		);
		setLoadingMarket(false);
	}, [
		result,
		oraclesInfoObj,
		marketsMetadata,
		groupsFollowed,
		rinkebyLatestBlockNumber,
	]);

	useEffect(() => {
		setTradeHistories(
			mSATResult.data && mSATResult.data.tradeHistories
				? mSATResult.data.tradeHistories
				: []
		);

		setStakeHistories(
			mSATResult.data && mSATResult.data.stakeHistories
				? mSATResult.data.stakeHistories
				: []
		);

		const tokenBalances = mSATResult.data
			? mSATResult.data.tokenBalances
			: [];

		setTradePosition({
			amount0: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.oToken0Id : undefined
			),
			amount1: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.oToken1Id : undefined
			),
		});

		setStakePosition({
			amount0: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.sToken0Id : undefined
			),
			amount1: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.sToken1Id : undefined
			),
		});
	}, [mSATResult, market]);

	useEffect(() => {
		const tokenApprovals =
			tokenApprovalsResult.data &&
			tokenApprovalsResult.data.tokenApprovals
				? tokenApprovalsResult.data.tokenApprovals
				: [];
		const obj = tokenApprovals.find(
			(obj) =>
				obj.operator == addresses.MarketRouter.toLowerCase() &&
				obj.approved == true
		);
		setTokenApproval(obj != undefined);
	}, [tokenApprovalsResult]);

	function refreshPost() {
		// console.log("daiowjaiosja");
		// reexecuteQuery();
		// mSATReexecuteQuery();
		// tokenApprovalsReexecuteQuery();
		window.location.reload();
	}

	return (
		<Flex style={{ maxWidth: 1650, marginTop: 5 }}>
			<Spacer />
			<Flex width="50%" flexDirection={"column"} marginRight={5}>
				{loadingMarket == true ? <Loader /> : undefined}
				{market && market.oracleInfo != undefined ? (
					<Flex flexDirection="column">
						<Flex paddingBottom={3} paddingTop={4}>
							<Flex alignItems="center">
								<Avatar
									size="sm"
									name="Dan Abrahmov"
									src="https://bit.ly/dan-abramov"
								/>
								<Heading marginLeft={2} size="xs">
									{market.oracleInfo
										? market.oracleInfo.name
										: ""}
								</Heading>

								{market.follow != true ? (
									<Heading marginLeft={2} size="xs">
										Join
									</Heading>
								) : undefined}
							</Flex>
							<Spacer />
						</Flex>
						{/* TODO check image exists here or not */}
						<Image src={"https://bit.ly/2Z4KKcF"} />
					</Flex>
				) : undefined}

				{/* {loadingMarket == false ? (
					<>
						<Text>Your past trades</Text>
						<Table size="sm" variant="simple">
							<Thead>
								<Tr>
									<Th>Direction</Th>
									<Th>Amount 0</Th>
									<Th>Amount 1</Th>
									<Th>Amount C</Th>
								</Tr>
							</Thead>
							<Tbody>
								{tradeHistories.map((row) => {
									return (
										<Tr>
											<Td>{row.buy ? "BUY" : "SELL"}</Td>
											<Td>
												{roundValueTwoDP(row.amount0)}
											</Td>
											<Td>
												{roundValueTwoDP(row.amount1)}
											</Td>
											<Td>
												{roundValueTwoDP(row.amountC)}
											</Td>
										</Tr>
									);
								})}
							</Tbody>
						</Table>
					</>
				) : undefined} */}
			</Flex>

			<Flex width="20%" marginLeft={5} flexDirection="column">
				{loadingMarket == false && market ? (
					<>
						<Heading>
							{marketStageDisplayName(
								market.optimisticState.stage
							)}
						</Heading>
						<Text>
							{`Expires in ${formatTimeInSeconds(
								convertBlocksToSeconds(
									market.optimisticState.blocksLeft
								)
							)}`}
						</Text>
						{market.optimisticState.stage === 1 ? (
							<TradingInterface
								market={market}
								tradePosition={tradePosition}
								tokenApproval={tokenApproval}
								refreshFn={refreshPost}
							/>
						) : undefined}
						{market.optimisticState.stage === 2 ? (
							<StakingInterface
								market={market}
								tradePosition={tradePosition}
								stakeHistories={stakeHistories}
								stakePosition={stakePosition}
								refreshFn={refreshPost}
							/>
						) : undefined}
						{market.optimisticState.stage === 4 ? (
							<RedeemWinsInterface
								market={market}
								tradePosition={tradePosition}
								stakeHistories={stakeHistories}
								stakePosition={stakePosition}
								tokenApproval={tokenApproval}
								refreshFn={refreshPost}
							/>
						) : undefined}
						{market && market.optimisticState.stage === 3 ? (
							<ResolveInterface
								market={market}
								stakeHistories={stakeHistories}
							/>
						) : undefined}
						{/* <TradingInterface
						
							market={market}
							tradePosition={tradePosition}
							tokenApproval={tokenApproval}
						/> */}
						{/* <StakingInterface
							market={market}
							tradePosition={tradePosition}
							stakeHistories={stakeHistories}
							stakePosition={stakePosition}
						/> */}
						{/* <RedeemWinsInterface
							market={market}
							tradePosition={tradePosition}
							stakeHistories={stakeHistories}
							stakePosition={stakePosition}
							tokenApproval={tokenApproval}
						/> */}
					</>
				) : (
					<Loader />
				)}
			</Flex>
			<Spacer />
		</Flex>
	);
}

export default Page;
