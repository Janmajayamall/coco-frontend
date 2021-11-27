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
	useStakeForOutcome,
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
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";

function RedeemWinsInterface({
	market,
	stakeHistories,
	tradePosition,
	stakePosition,
}) {
	const finalOutcome = determineOutcome(market);
	const winningsArr = getTradeWinningsArr(tradePosition, finalOutcome);
	const stakeArr = getStakeWinArr(stakePosition, finalOutcome);
	return (
		<Flex flexDirection="column">
			<TradePricesBoxes market={market} tradePosition={tradePosition} />
			<Text>Outcome resolved</Text>
			<Text>Trades</Text>

			<TwoColTitleInfo
				title={"Yes shares"}
				info={
					tradePosition ? roundValueTwoDP(tradePosition.amount1) : "0"
				}
			/>
			<TwoColTitleInfo
				title={"No shares"}
				info={
					tradePosition ? roundValueTwoDP(tradePosition.amount0) : "0"
				}
			/>
			<TwoColTitleInfo
				title={"Declared outcome"}
				info={outcomeDisplayName(finalOutcome)}
			/>
			<TwoColTitleInfo
				title={"You receive"}
				info={getTradeWinAmount(tradePosition, finalOutcome)}
			/>
			<Button>
				<Text>Claim trade winnings</Text>
			</Button>
			<Text>Challenges</Text>
			<TwoColTitleInfo
				title={"Your stake for YES"}
				info={
					stakePosition ? roundValueTwoDP(stakePosition.amount1) : "0"
				}
			/>
			<TwoColTitleInfo
				title={"Your stake for NO"}
				info={
					stakePosition ? roundValueTwoDP(stakePosition.amount0) : "0"
				}
			/>
			<TwoColTitleInfo
				title={"Your challenge winnings"}
				info={roundValueTwoDP(
					determineStakeWinnings(market, finalOutcome, account)
				)}
			/>
			<TwoColTitleInfo
				title={"Your receive"}
				info={formatBNToDecimal(
					totalAmountReceivedInStakeRedeem(
						market,
						finalOutcome,
						stakePosition,
						account
					)
				)}
			/>

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
			<ChallengeHistoryTable stakeHistories={stakeHistories} />
		</Flex>
	);
}
export default RedeemWinsInterface;
