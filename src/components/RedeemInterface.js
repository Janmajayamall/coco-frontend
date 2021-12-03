import { useDisclosure, useFocusEffect } from "@chakra-ui/hooks";
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
import { Button, Text, Flex, useToast } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinTokensForExactCTokens,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
	useRedeemWinning,
	useSellExactTokensForMinCTokens,
	useStakeForOutcome,
	useRedeemWinningBothOutcomes,
	useRedeemStake,
	useERC1155SetApprovalForAll,
	useRedeemMaxWinning,
	useRedeemMaxWinningAndStake,
} from "../hooks";
import {
	formatBNToDecimal,
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
	roundDecimalStr,
	ZERO_DECIMAL_STR,
	determineTotalAmountStakeRedeem,
	determineTradeWinAmount,
	GRAPH_BUFFER_MS,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";
import addresses from "./../contracts/addresses.json";

function RedeemWinsInterface({
	market,
	stakeHistories,
	tradePosition,
	stakePosition,
	tokenApproval,
	refreshFn,
}) {
	const { account } = useEthers();
	const toast = useToast();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = userProfile && account;

	const { state: stateRMaxW, send: sendRMaxW } = useRedeemMaxWinning();
	const {
		state: stateRMaxWS,
		send: sendRMaxWS,
	} = useRedeemMaxWinningAndStake();
	const {
		state: stateSetApproval,
		send: sendSetApproval,
	} = useERC1155SetApprovalForAll(market.oracle.id);

	// redeem tx loading
	const [redeemLoading, setRedeemLoading] = useState(false);
	const [approvalLoading, setApprovalLoading] = useState(false);

	useEffect(() => {
		if (
			stateRMaxW.status === "Success" ||
			stateRMaxWS.status === "Success"
		) {
			setTimeout(() => {
				setRedeemLoading(false);
				toast({
					title: "Success!",
					status: "success",
					isClosable: true,
				});
				if (refreshFn) {
					refreshFn();
				}
			}, GRAPH_BUFFER_MS);
		}
	}, [stateRMaxW, stateRMaxWS]);

	useEffect(() => {
		if (stateSetApproval.status === "Success") {
			setTimeout(() => {
				setApprovalLoading(false);
				toast({
					title: "Success!",
					status: "success",
					isClosable: true,
				});
				if (refreshFn) {
					refreshFn();
				}
			}, GRAPH_BUFFER_MS);
		}
	}, [stateSetApproval]);

	useEffect(() => {
		if (
			stateSetApproval.status === "Exception" ||
			stateSetApproval.status === "Fail"
		) {
			setApprovalLoading(false);
			toast({
				title: "Metamask Err!",
				status: "error",
				isClosable: true,
			});
		}
	});

	useEffect(() => {
		if (
			stateRMaxW.status === "Exception" ||
			stateRMaxWS.status === "Exception" ||
			stateRMaxW.status === "Fail" ||
			stateRMaxWS.status === "Fail"
		) {
			setRedeemLoading(false);
			toast({
				title: "Metamask Err!",
				status: "error",
				isClosable: true,
			});
		}
	}, [stateRMaxW, stateRMaxWS]);

	function determineWinLevel() {
		let tradeWinnings = determineTradeWinAmount(
			tradePosition,
			market.optimisticState.outcome
		);

		let stakeWinnings = determineTotalAmountStakeRedeem(
			market,
			stakePosition,
			account
		);

		if (tradeWinnings.isZero() && stakeWinnings.isZero()) {
			return 0;
		}

		if (stakeWinnings.isZero()) {
			return 1;
		}

		return 2;
	}

	return (
		<Flex flexDirection="column">
			<TradePriceBoxes market={market} tradePosition={tradePosition} />
			<Text>Outcome resolved</Text>
			<TwoColTitleInfo
				title={"Yes shares"}
				info={
					tradePosition
						? formatBNToDecimal(tradePosition.amount1)
						: ZERO_DECIMAL_STR
				}
			/>
			<TwoColTitleInfo
				title={"No shares"}
				info={
					tradePosition
						? formatBNToDecimal(tradePosition.amount0)
						: ZERO_DECIMAL_STR
				}
			/>
			<TwoColTitleInfo
				title={"Declared outcome"}
				info={outcomeDisplayName(market.optimisticState.outcome)}
			/>

			<TwoColTitleInfo
				title={"You Win"}
				info={formatBNToDecimal(
					determineTradeWinAmount(
						tradePosition,
						market.optimisticState.outcome
					)
				)}
			/>

			<Text>Your Challenges</Text>
			{stakePosition.amount0.isZero() &&
			stakePosition.amount1.isZero() ? (
				<Text>You didn't challenge</Text>
			) : undefined}
			{!stakePosition.amount1.isZero() ? (
				<TwoColTitleInfo
					title={"Amount challenged for YES"}
					info={formatBNToDecimal(stakePosition.amount1)}
				/>
			) : undefined}
			{!stakePosition.amount0.isZero() ? (
				<TwoColTitleInfo
					title={"Amount challenged for NO"}
					info={formatBNToDecimal(stakePosition.amount0)}
				/>
			) : undefined}
			<TwoColTitleInfo
				title={"Your challenge winnings"}
				info={formatBNToDecimal(
					determineStakeWinnings(market, account)
				)}
			/>
			<TwoColTitleInfo
				title={"Your receive"}
				info={formatBNToDecimal(
					determineTotalAmountStakeRedeem(
						market,
						stakePosition,
						account
					)
				)}
			/>

			<TwoColTitleInfo
				title={"You receive in total"}
				info={formatBNToDecimal(
					determineTradeWinAmount(
						tradePosition,
						market.optimisticState.outcome
					).add(
						determineTotalAmountStakeRedeem(
							market,

							stakePosition,
							account
						)
					)
				)}
			/>

			<Button
				disabled={!isAuthenticated || determineWinLevel() === 0}
				loadingText="Processing..."
				isLoading={redeemLoading}
				onClick={() => {
					let winLevel = determineWinLevel();
					if (winLevel === 0) {
						return;
					}

					setRedeemLoading(true);

					if (winLevel === 1) {
						sendRMaxW(market.oracle.id, market.marketIdentifier);
					} else {
						sendRMaxWS(market.oracle.id, market.marketIdentifier);
					}
				}}
			>
				<Text>Claim reward</Text>
			</Button>
			<ChallengeHistoryTable stakeHistories={stakeHistories} />
			<Button
				disabled={tokenApproval}
				loadingText="Processing..."
				isLoading={approvalLoading}
				onClick={() => {
					setApprovalLoading(true);
					sendSetApproval(addresses.MarketRouter, true);
				}}
			>
				<Text>Set approval</Text>
			</Button>
		</Flex>
	);
}
export default RedeemWinsInterface;
