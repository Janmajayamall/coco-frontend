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
import { Button, Text, Flex, useToast, Box, Spacer } from "@chakra-ui/react";
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
	useCheckTokenApprovals,
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
	formatBNToDecimalCurr,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";
import addresses from "./../contracts/addresses.json";
import PrimaryButton from "./PrimaryButton";
import ApprovalInterface from "./ApprovalInterface";

function RedeemWinsInterface({
	market,
	stakeHistories,
	tradePosition,
	stakePosition,
	refreshFn,
}) {
	const { account } = useEthers();
	const toast = useToast();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const { state: stateRMaxW, send: sendRMaxW } = useRedeemMaxWinning();
	const {
		state: stateRMaxWS,
		send: sendRMaxWS,
	} = useRedeemMaxWinningAndStake();

	const erc1155TokenApproval = useCheckTokenApprovals(
		1,
		account,
		market.oracle.id
	);

	// redeem tx loading
	const [redeemLoading, setRedeemLoading] = useState(false);

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
			<Flex
				backgroundColor="#F3F5F7"
				padding={2}
				marginTop={5}
				marginBottom={3}
				borderRadius={10}
				alignItems="center"
			>
				<Text fontSize={14} fontWeight="bold">
					Final outcome
				</Text>
				<Spacer />
				<Text fontSize={14} fontWeight="bold">
					{outcomeDisplayName(market.optimisticState.outcome)}
				</Text>
			</Flex>
			<Text fontSize={14} fontWeight="bold">
				Your Trades
			</Text>
			<TradePriceBoxes market={market} tradePosition={tradePosition} />
			{/* <TwoColTitleInfo
				title={"Final outcome"}
				info={}
			/> */}
			<TwoColTitleInfo
				title={"Your trade winnings"}
				info={formatBNToDecimalCurr(
					determineTradeWinAmount(
						tradePosition,
						market.optimisticState.outcome
					)
				)}
				titleBold={true}
			/>
			{!stakePosition.amount0.isZero() ||
			!stakePosition.amount1.isZero() ? (
				<Flex flexDirection="column" marginTop="5">
					<Text fontSize={14} fontWeight="bold">
						Your Challenges
					</Text>
					{!stakePosition.amount1.isZero() ? (
						<TwoColTitleInfo
							title={"In favour of Yes"}
							info={`${formatBNToDecimalCurr(
								stakePosition.amount1
							)}`}
						/>
					) : undefined}
					{!stakePosition.amount0.isZero() ? (
						<TwoColTitleInfo
							title={"In favour of No"}
							info={`${formatBNToDecimalCurr(
								stakePosition.amount0
							)}`}
						/>
					) : undefined}
					<TwoColTitleInfo
						title={"Challenge winnings"}
						info={`${formatBNToDecimalCurr(
							determineStakeWinnings(market, account)
						)}`}
					/>
					<TwoColTitleInfo
						title={"You get back"}
						info={`${formatBNToDecimalCurr(
							determineTotalAmountStakeRedeem(
								market,
								stakePosition,
								account
							)
						)}`}
						titleBold={true}
					/>
				</Flex>
			) : undefined}

			<Flex flexDirection="column" marginTop="5">
				<TwoColTitleInfo
					title={"You get back in total"}
					info={`${formatBNToDecimalCurr(
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
					)}`}
					titleBold={true}
				/>
			</Flex>
			<PrimaryButton
				disabled={
					!isAuthenticated ||
					determineWinLevel() === 0 ||
					!erc1155TokenApproval
				}
				loadingText="Processing..."
				isLoading={redeemLoading}
				onClick={() => {
					let winLevel = determineWinLevel();
					if (
						winLevel === 0 ||
						!isAuthenticated ||
						!erc1155TokenApproval
					) {
						return;
					}

					setRedeemLoading(true);

					if (winLevel === 1) {
						sendRMaxW(market.oracle.id, market.marketIdentifier);
					} else {
						sendRMaxWS(market.oracle.id, market.marketIdentifier);
					}
				}}
				title={"Claim"}
				style={{
					marginTop: 10,
				}}
			/>

			<ApprovalInterface
				tokenType={1}
				erc1155Address={market.oracle.id}
				onSuccess={() => {
					toast({
						title: "Success!",
						status: "success",
						isClosable: true,
					});
				}}
				onFail={() => {
					toast({
						title: "Metamask err!",
						status: "error",
						isClosable: true,
					});
				}}
			/>

			<ChallengeHistoryTable stakeHistories={stakeHistories} />
		</Flex>
	);
}
export default RedeemWinsInterface;
