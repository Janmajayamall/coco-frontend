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
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";

function StakingInterface({
	market,
	tradePosition,
	stakePosition,
	stakeHistories,
}) {
	const { input, bnValue, setInput, err } = useBNInput();

	function setInputToMinStakeReq() {
		setInput(
			ethers.utils.formatUnits(
				parseDecimalToBN(market.lastAmountStaked).isZero()
					? parseDecimalToBN("1")
					: parseDecimalToBN(market.lastAmountStaked).mul(TWO_BN),
				18
			)
		);
	}

	useEffect(() => {
		if (!market) {
			return;
		}
		setInputToMinStakeReq();
	}, [market]);

	return (
		<Flex flexDirection="column">
			<TradePriceBoxes
				market={market}
				tradePosition={tradePosition}
				outcomeChosen={3}
			/>

			<TwoColTitleInfo
				title={"Temp outcome"}
				info={`${outcomeDisplayName(
					getTempOutcomeInChallengePeriod(market)
				)}`}
			/>
			<TwoColTitleInfo
				title={"Time left to challenge"}
				info={`${formatTimeInSeconds(
					convertBlocksToSeconds(market.stateMetadata.blocksLeft)
				)}`}
			/>
			<TwoColTitleInfo
				title={"Challenges left"}
				info={`${
					Number(market.donEscalationLimit) -
					Number(market.donEscalationCount)
				}`}
			/>
			<TwoColTitleInfo
				title={"Min amount to challenge"}
				info={`${formatBNToDecimal(
					parseDecimalToBN(market.lastAmountStaked).mul(TWO_BN)
				)}`}
			/>

			<NumberInput
				onChange={(val) => {
					setInput(val);
				}}
				placeholder="Amount"
				value={input}
			>
				<NumberInputField />
			</NumberInput>

			<Button onClick={() => {}}>
				<Text color="white" fontSize="md" fontWeight="medium" mr="2">
					Challenge
				</Text>
			</Button>

			<ChallengeHistoryTable stakeHistories={stakeHistories} />
		</Flex>
	);
}

export default StakingInterface;
