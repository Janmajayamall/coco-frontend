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
	selectUserProfile,
} from "../redux/reducers";
import { Button, Text, Flex, Select } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinTokensForExactCTokens,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
	useSellExactTokensForMinCTokens,
	useSetOutcome,
	useStakeForOutcome,
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
	ZERO_BN,
	ZERO_DECIMAL_STR,
	calculateResolveFee,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";

function ResolveInterface({ market, stakeHistories }) {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = userProfile && account;

	const { state, send } = useSetOutcome(market ? market.oracle.id : "");

	const [chosenOutcome, setChosenOutcome] = useState(2);

	if (!market) {
		return <div />;
	}

	return (
		<Flex flexDirection="column">
			{isAuthenticated &&
			account.toLowerCase() === market.oracle.delegate ? (
				<>
					<TwoColTitleInfo
						title="Fee"
						info={formatBNToDecimal(
							calculateResolveFee(market, chosenOutcome)
						)}
					/>
					<Select
						value={chosenOutcome}
						onChange={(e) => {
							setChosenOutcome(e.target.value);
						}}
						placeholder="Select Outcome"
					>
						<option value={0}>NO</option>

						<option value={1}>YES</option>

						<option value={2}>UNDECIDED</option>
					</Select>
					<Button
						onClick={() => {
							send(chosenOutcome, market.marketIdentifier);
						}}
					>
						<Text>Declare Outcome</Text>
					</Button>
				</>
			) : undefined}
			<ChallengeHistoryTable stakeHistories={stakeHistories} />
		</Flex>
	);
}

export default ResolveInterface;
