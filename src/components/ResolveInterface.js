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
import { Button, Text, Flex, Select, useToast } from "@chakra-ui/react";
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
	GRAPH_BUFFER_MS,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";
import PrimaryButton from "./PrimaryButton";

function ResolveInterface({
	market,
	tradePosition,
	stakeHistories,
	refreshFn,
}) {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();

	const { state, send } = useSetOutcome(market ? market.oracle.id : "");

	const [chosenOutcome, setChosenOutcome] = useState(2);

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (state.status === "Success") {
			setTimeout(() => {
				setLoading(false);

				toast({
					title: "Success!",
					status: "success",
					isClosable: true,
				});

				if (refreshFn) {
					refreshFn();
				}
			}, GRAPH_BUFFER_MS);
		} else if (state.status === "Exception" || state.status === "Fail") {
			toast({
				title: "Metamask err!",
				status: "error",
				isClosable: true,
			});
			setLoading(false);
		}
	}, [state]);

	if (!market) {
		return <div />;
	}

	return (
		<Flex flexDirection="column">
			{isAuthenticated &&
			account.toLowerCase() === market.oracle.delegate ? (
				<Flex marginTop={5} flexDirection="column">
					<Text fontSize={16} marginBottom={3} fontWeight="bold">
						Declare Outcome
					</Text>
					<TwoColTitleInfo
						title="Fee received"
						info={formatBNToDecimal(
							chosenOutcome == ""
								? ZERO_BN
								: calculateResolveFee(
										market,
										parseInt(chosenOutcome, 10)
								  )
						)}
						titleBold={true}
					/>

					<Select
						value={chosenOutcome}
						onChange={(e) => {
							setChosenOutcome(e.target.value);
						}}
						marginTop={2}
						placeholder="Select Outcome"
					>
						<option value={0}>No</option>

						<option value={1}>Yes</option>

						<option value={2}>Undecided</option>
					</Select>
					<Text marginBottom={2} fontSize={12} fontWeight="bold">
						You are seeing this because you govern the group.
					</Text>
					<PrimaryButton
						isLoading={loading}
						loadingText={"Processing..."}
						onClick={() => {
							if (
								chosenOutcome == undefined ||
								chosenOutcome == ""
							) {
								return;
							}
							setLoading(true);
							send(chosenOutcome, market.marketIdentifier);
						}}
						title="Declare outcome"
					/>
				</Flex>
			) : undefined}
			<TradePriceBoxes
				marginTop={5}
				market={market}
				tradePosition={tradePosition}
			/>
			<ChallengeHistoryTable stakeHistories={stakeHistories} />
		</Flex>
	);
}

export default ResolveInterface;
