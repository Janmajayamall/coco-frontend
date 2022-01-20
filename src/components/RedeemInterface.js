import { useSelector } from "react-redux";
import { selectUserProfile } from "../redux/reducers";
import { Text, Flex, useToast, Box, Spacer } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";

import { useEffect } from "react";
import { useState } from "react";
import {
	useRedeemMaxWinning,
	useRedeemMaxWinningAndStake,
	useCheckTokenApprovals,
} from "../hooks";
import {
	outcomeDisplayName,
	determineStakeWinnings,
	determineTotalAmountStakeRedeem,
	determineTradeWinAmount,
	GRAPH_BUFFER_MS,
	formatBNToDecimalCurr,
} from "../utils";

import TwoColTitleInfo from "../components/TwoColTitleInfo";

import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";

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
				title={"Total from Predictions"}
				info={formatBNToDecimalCurr(
					determineTradeWinAmount(
						tradePosition,
						market.optimisticState.outcome
					)
				)}
				titleBold={true}
				helpText="For every right outcome share you own, you get back 1 WETH. Difference between the price at which you bought your shares and 1, are your winning."
			/>
			{/* {!stakePosition.amount0.isZero() ||
			!stakePosition.amount1.isZero() ? ( */}
			<Flex flexDirection="column" marginTop="5">
				<Text fontSize={14} fontWeight="bold">
					Your Challenges
				</Text>
				{/* {!stakePosition.amount1.isZero() ? ( */}
				<TwoColTitleInfo
					title={"In favour of YES"}
					info={`${formatBNToDecimalCurr(stakePosition.amount1)}`}
					helpText="Amount you staked to challenge in favour of a YES outcome."
				/>
				{/* ) : undefined} */}
				{/* {!stakePosition.amount0.isZero() ? ( */}
				<TwoColTitleInfo
					title={"In favour of NO"}
					info={`${formatBNToDecimalCurr(stakePosition.amount0)}`}
					helpText="Amount you staked to challenge in favour of a NO outcome."
				/>
				{/* ) : undefined} */}
				<TwoColTitleInfo
					title={"Challenge winnings"}
					info={`${formatBNToDecimalCurr(
						determineStakeWinnings(market, account)
					)}`}
					helpText="Your reward if you were last to challenge in favour of the correct outcome, equal to the total staked on the losing outcome minus the resolution fee if applicable."
				/>
				<TwoColTitleInfo
					title={"Total from Challenge"}
					info={`${formatBNToDecimalCurr(
						determineTotalAmountStakeRedeem(
							market,
							stakePosition,
							account
						)
					)}`}
					titleBold={true}
					helpText="Amount staked for the right outcome + Challenge winnings."
				/>
			</Flex>
			{/* : undefined} */}
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
					helpText="Your outcome shares + Total from Challenge"
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
				title={"Redeem"}
				style={{
					marginTop: 10,
				}}
			/>
			<ApprovalInterface
				marginTop={5}
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
