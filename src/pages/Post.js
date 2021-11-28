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
	getTradeWinAmount,
	determineStakeWinnings,
	totalAmountReceivedInStakeRedeem,
	marketStageDisplayName,
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
	console.log(mSATResult, " mSATResult");
	const tradeHistories =
		mSATResult.data && mSATResult.data.tradeHistories
			? mSATResult.data.tradeHistories
			: [];
	const stakeHistories =
		mSATResult.data && mSATResult.data.stakeHistories
			? mSATResult.data.stakeHistories
			: [];
	const tradePosition = mSATResult.tokenBalances.forEach((obj) => {
		if (market.oToken0Id == obj.tokenId) // TODO - finish this 
	})();
	const tradePosition =
		mSATResult.data && mSATResult.data.tradePosition
			? mSATResult.data.tradePosition
			: undefined;
	const stakePosition =
		mSATResult.data && mSATResult.data.stakePosition
			? mSATResult.data.stakePosition
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

	if (!market || !postId) {
		return <div />;
	}

	return (
		<Flex style={{ maxWidth: 1650, marginTop: 5 }}>
			<Spacer />
			<Flex width="50%" flexDirection={"column"} marginRight={5}>
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

							<Heading marginLeft={2} size="xs">
								Join
							</Heading>
						</Flex>
						<Spacer />
					</Flex>
					<Image src={"https://bit.ly/2Z4KKcF"} />
				</Flex>

				<Text>Your past trades</Text>
				{/* {tradeHistories.length == 0 ? (
					<Flex width="100%">
						<Spacer />
						<Text fontSize={15} fontWeight="bold">
							You have 0 trades
						</Text>
						<Spacer />
					</Flex>
				) : undefined} */}
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
									<Td>{row.amount0}</Td>
									<Td>{row.amount1}</Td>
									<Td>{row.amountC}</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</Flex>

			<Flex width="20%" marginLeft={5} flexDirection="column">
				<Heading>
					{marketStageDisplayName(
						market ? market.stateMetadata.stage : 0
					)}
				</Heading>
				{market && market.stateMetadata.blocksLeft ? (
					<Text>
						{`Expires in ${formatTimeInSeconds(
							convertBlocksToSeconds(
								market.stateMetadata.blocksLeft
							)
						)}`}
					</Text>
				) : undefined}
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
				{/* <StakingInterface
					market={market}
					tradePosition={tradePosition}
					stakeHistories={stakeHistories}
					stakePosition={stakePosition}
				/> */}
				{market && market.stateMetadata.stage == 4 ? (
					<RedeemWinsInterface
						market={market}
						tradePosition={tradePosition}
						stakeHistories={stakeHistories}
						stakePosition={stakePosition}
					/>
				) : undefined}
				{/* <TradingInterface
					market={market}
					tradePosition={tradePosition}
				/> */}
			</Flex>
			<Spacer />
		</Flex>
	);
}

export default Page;
