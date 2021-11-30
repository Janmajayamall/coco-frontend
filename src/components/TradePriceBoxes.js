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
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";

function TradePricesBoxes({
	market,
	tradePosition,
	outcomeChosen,
	onOutcomeChosen,
}) {
	return (
		<Flex marginTop="2" marginBottom="2">
			<Spacer />
			<Box
				onClick={() => {
					if (onOutcomeChosen) {
						onOutcomeChosen(1);
					}
				}}
				backgroundColor="#C5E6DD"
				borderColor="#00EBA9"
				borderRadius={4}
				borderWidth={outcomeChosen == 1 ? 6 : 1}
				paddingLeft={18}
				paddingRight={18}
				// paddingTop={2}
				// paddingBottom={2}
				justifyContent={"space-between"}
				alignItems={"center"}
			>
				<Text fontSize="15">{`YES ${roundValueTwoDP(
					market.probability1
				)}`}</Text>
				<Text fontSize="12" fontWeight="bold">{`${
					tradePosition ? roundValueTwoDP(tradePosition.amount1) : "0"
				} shares`}</Text>
			</Box>
			<Spacer />
			<Box
				onClick={() => {
					if (onOutcomeChosen) {
						onOutcomeChosen(0);
					}
				}}
				backgroundColor="#E9CFCC"
				borderColor="#FF523E"
				borderRadius={4}
				borderWidth={outcomeChosen == 0 ? 6 : 1}
				paddingLeft={18}
				paddingRight={18}
				justifyContent={"space-between"}
				alignItems={"center"}
			>
				<Text fontSize="15">{`NO ${roundValueTwoDP(
					market.probability0
				)}`}</Text>
				<Text fontSize="12" fontWeight="bold">{`${
					tradePosition ? roundValueTwoDP(tradePosition.amount0) : "0"
				} shares`}</Text>
			</Box>
			<Spacer />
		</Flex>
	);
}
export default TradePricesBoxes;
