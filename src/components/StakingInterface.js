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
import {
	Button,
	Text,
	Flex,
	NumberInput,
	NumberInputField,
	useToast,
	HStack,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";

import { useEffect } from "react";
import { useState } from "react";
import { useStakeForOutcome, useCheckTokenApprovals } from "../hooks";
import {
	convertBlocksToSeconds,
	formatBNToDecimal,
	parseDecimalToBN,
	TWO_BN,
	useBNInput,
	outcomeDisplayName,
	formatTimeInSeconds,
	determineOutcomeInExpiry,
	GRAPH_BUFFER_MS,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import PrimaryButton from "./PrimaryButton";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ChallengeHistoryTable from "./ChallengeHistoryTable";
import ApprovalInterface from "./ApprovalInterface";

function StakingInterface({ market, stakeHistories, refreshFn }) {
	const { account } = useEthers();
	const toast = useToast();

	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const { state, send } = useStakeForOutcome();

	const { input, bnValue, setInput, err, errText } = useBNInput(
		validateInput
	);
	const [tempOutcome, setTempOutcome] = useState(0);
	const [favoredOutcome, setFavoredOutcome] = useState();
	const [stakeLoading, setStakeLoading] = useState(false);

	const tokenApproval = useCheckTokenApprovals(
		0,
		account,
		undefined,
		bnValue
	);

	function setInputToMinStakeReq() {
		setInput(
			ethers.utils.formatUnits(
				market.lastAmountStaked.isZero()
					? parseDecimalToBN("1")
					: market.lastAmountStaked.mul(TWO_BN),
				18
			)
		);
	}

	useEffect(() => {
		if (!market) {
			return;
		}
		setInputToMinStakeReq();

		let _tempOutcome = determineOutcomeInExpiry(market);
		setTempOutcome(_tempOutcome);
		setFavoredOutcome(_tempOutcome == 2 ? 2 : 1 - _tempOutcome);
	}, []);

	// stake tx state loading
	useEffect(() => {
		if (state.status === "Success") {
			setTimeout(() => {
				toast({
					title: "Success!",
					status: "success",
					isClosable: true,
				});

				setStakeLoading(false);

				if (refreshFn) {
					refreshFn();
				}
			}, GRAPH_BUFFER_MS);
		}
	}, [state]);

	// stake tx state error
	useEffect(() => {
		if (state.status === "Exception" || state.status === "Fail") {
			toast({
				title: "Metamask err!",
				status: "error",
				isClosable: true,
			});
			setStakeLoading(false);
		}
	}, [state]);

	function validateInput(bnValue) {
		if (market.lastAmountStaked.isZero() && bnValue.isZero()) {
			return {
				valid: false,
				expStr: "Challenge amount should be greater than 0",
			};
		}

		if (bnValue.gte(market.lastAmountStaked.mul(TWO_BN))) {
			return {
				valid: true,
				expStr: "",
			};
		}

		return {
			valid: false,
			expStr: `Challenge amount should be min ${formatBNToDecimal(
				market.lastAmountStaked.mul(TWO_BN).toString()
			)}`,
		};
	}

	return (
		<Flex marginTop={5} flexDirection="column">
			<Text fontSize={16} fontWeight={"bold"} marginBottom={2}>
				Challenge outcome
			</Text>
			<TwoColTitleInfo
				title={"Temporary outcome"}
				info={`${outcomeDisplayName(tempOutcome)}`}
			/>
			<TwoColTitleInfo
				title={"Time left to challenge"}
				info={`${formatTimeInSeconds(
					convertBlocksToSeconds(market.optimisticState.blocksLeft)
				)}`}
			/>
			<TwoColTitleInfo
				title={"Challenges left"}
				info={`${
					market.donEscalationLimit - market.donEscalationCount
				}`}
			/>
			<TwoColTitleInfo
				title={"Min. amount to challenge"}
				info={`${formatBNToDecimal(
					market.lastAmountStaked.mul(TWO_BN)
				)} MEME`}
			/>

			<TwoColTitleInfo
				title={"You think outcome is"}
				info={`${outcomeDisplayName(favoredOutcome)}`}
			/>
			<HStack>
				<NumberInput
					onChange={(val) => {
						setInput(val);
					}}
					placeholder="Amount"
					fontSize={14}
					value={input}
					marginTop={3}
				>
					<NumberInputField />
				</NumberInput>
				<Text fontSize={14}>Meme</Text>
			</HStack>
			{err === true ? (
				<Text
					marginTop="1"
					marginBottom="1"
					fontSize="10"
					fontWeight="bold"
					color="red.300"
				>
					{errText}
				</Text>
			) : undefined}
			<PrimaryButton
				loadingText="Processing..."
				isLoading={stakeLoading}
				disabled={!isAuthenticated || !tokenApproval}
				onClick={() => {
					if (!isAuthenticated && tokenApproval) {
						return;
					}

					// TODO validation checks

					// favored outcome can't be 2
					if (favoredOutcome == 2) {
						return;
					}

					setStakeLoading(true);

					send(
						favoredOutcome,
						bnValue,
						market.oracle.id,
						market.marketIdentifier
					);
				}}
				title={`Outcome is ${outcomeDisplayName(
					favoredOutcome
				)}, I challenge`}
				style={{
					marginTop: 5,
				}}
			/>

			<ChallengeHistoryTable stakeHistories={stakeHistories} />

			<ApprovalInterface
				marginTop={5}
				tokenType={0}
				erc20AmountBn={bnValue}
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
		</Flex>
	);
}

export default StakingInterface;
