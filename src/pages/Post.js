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
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinTokensForExactCTokens,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
	useSellExactTokensForMinCTokens,
} from "../hooks";
import {
	convertBlocksToSeconds,
	convertDecimalStrToBigNumber,
	convertDecimalStrToInt,
	convertIntToDecimalStr,
	determineMarketState,
	filterMarketIdentifiersFromMarketsGraph,
	filterOraclesFromMarketsGraph,
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
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TradingInterface from "../components/TradingInterface";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradePricesBoxes from "../components/TradePriceBoxes";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import StakingInterface from "../components/StakingInterface";

/**
 * You haven't checked errors returned on graph queries. (For example when postId is wrong)
 * Try putting in some validation check for postId (i.e. marketIdentifier)?
 */
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

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(
		postId,
		false
	);
	const {
		result: mSATResult,
		reexecuteQuery: mSATRexecuteQuery,
	} = useQueryMarketTradeAndStakeInfoByUser(
		postId,
		account ? account.toLowerCase() : "",
		false
	);

	const [market, setMarket] = useState(undefined);
	// const [marketStage, setMarketStage] = useState(getMarketStageName(-1));
	// const [stageTimeRemaining, setStageTimeRemaining] = useState(0);

	// console.log(marketStage, " marketStage");
	// console.log(stageTimeRemaining, "stageTimeRemaining");

	const tradeHistories =
		mSATResult.data && mSATResult.data.tradeHistories
			? mSATResult.data.tradeHistories
			: [];
	const stakeHistories =
		mSATResult.data && mSATResult.data.stakeHistories
			? mSATResult.data.stakeHistories
			: [];
	const tradePosition =
		mSATResult.data && mSATResult.data.tradePosition
			? mSATResult.data.tradePosition
			: undefined;
	const stakePosition =
		mSATResult.data && mSATResult.data.stakePosition
			? mSATResult.data.tradePosition
			: undefined;

	useEffect(async () => {
		if (!result.data || !result.data.market) {
			return;
		}
		const _market = result.data.market;

		const oracleIds = filterOraclesFromMarketsGraph([_market]);
		let res = await findModeratorsByIdArr(oracleIds);
		if (!res || !res.moderators) {
			return;
		}
		dispatch(sUpdateOraclesInfoObj(res.moderators));

		const marketIdentifiers = filterMarketIdentifiersFromMarketsGraph([
			_market,
		]);
		res = await findPostsByMarketIdentifierArr(marketIdentifiers);
		if (!res || !res.posts) {
			return;
		}
		dispatch(sUpdateMarketsMetadata(res.posts));
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
	}, [
		result,
		oraclesInfoObj,
		marketsMetadata,
		groupsFollowed,
		rinkebyLatestBlockNumber,
	]);

	// useEffect(() => {
	// 	if (!market) {
	// 		return;
	// 	}
	// 	console.log(rinkebyLatestBlockNumber, " rinkebyLatestBlockNumber");
	// 	let { stage, blocksLeft } = determineMarketState(
	// 		getMarketStateDetails(market),
	// 		rinkebyLatestBlockNumber
	// 	);
	// 	setMarketStage(getMarketStageName(stage));
	// 	setStageTimeRemaining(convertBlocksToSeconds(blocksLeft));
	// }, [market, rinkebyLatestBlockNumber]);

	if (!market || !postId) {
		return <div />;
	}

	function RedeemWinsInterface() {
		const finalOutcome = determineOutcome(market);
		const winningsArr = getTradeWinningsArr(tradePosition, finalOutcome);
		const stakeArr = getStakeWinArr(stakePosition, finalOutcome);
		return (
			<Flex flexDirection="column">
				<Text>Claim Winnings</Text>
				<Text>{`Final decision - ${finalOutcome}`}</Text>
				<Text>You receive</Text>
				{winningsArr.map((winning) => {
					return (
						<Text>
							{`
				${formatBNToDecimal(winning.amountC)} for ${formatBNToDecimal(
								winning.amountT
							)} ${winning.outcome} tokens
			`}
						</Text>
					);
				})}
				<Button>
					<Text>Claim trade winnings</Text>
				</Button>
				{stakeArr.map((obj) => {
					if (obj.amountSR.isZero()) {
						return;
					}
					return (
						<Text>
							{`
							${formatBNToDecimal(obj.amountSR)} challenge amount used in favor of outcome ${
								obj.outcome
							}
							`}
						</Text>
					);
				})}
				{finalOutcome == Number(market.lastOutcomeStaked) &&
				account.toLowerCase() ==
					(finalOutcome == 0 ? market.staker0 : market.staker1) ? (
					<Text>
						{`${
							finalOutcome == 0
								? market.stakingReserve0
								: market.stakingReserve1
						} from loser's stake`}
					</Text>
				) : undefined}
				<Button>
					<Text>Claim stake winnings</Text>
				</Button>
			</Flex>
		);
	}
	console.log(market, " market here");
	return (
		<Flex>
			<Flex flexDirection={"column"}>
				<PostDisplay market={market} />
				<Table size="sm" variant="simple">
					<TableCaption>Trade History</TableCaption>
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
									<Td>{row.amount0}</Td>
									<Td>{row.amount1}</Td>
									<Td>{row.amountC}</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</Flex>
			{market && market.stateMetadata.stage == 1 ? (
				<TradingInterface
					market={market}
					tradePosition={tradePosition}
				/>
			) : undefined}
			{market && market.stateMetadata.stage == 2 ? (
				<StakingInterface
					market={market}
					tradePosition={tradePosition}
					stakeHistories={stakeHistories}
					stakePosition={stakePosition}
				/>
			) : undefined}
			<StakingInterface
				market={market}
				tradePosition={tradePosition}
				stakeHistories={stakeHistories}
				stakePosition={stakePosition}
			/>
			{/* <RedeemWinsInterface /> */}
			{/* <TradingInterface market={market} tradePosition={tradePosition} /> */}
		</Flex>
	);
}

export default Page;
