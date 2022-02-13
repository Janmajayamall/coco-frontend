import { useDisclosure } from "@chakra-ui/hooks";
import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile } from "../redux/reducers";
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
import {
	useStakeForOutcome,
	useCheckTokenApprovals,
	useTokenBalance,
} from "../hooks";
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
	formatBNToDecimalCurr,
	CURR_SYMBOL,
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

function ChallengeInterface({ market, refreshFn }) {
	const { account } = useEthers();
	const toast = useToast();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const wEthTokenBalance = useTokenBalance(account);

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

		if (bnValue.lt(market.lastAmountStaked.mul(TWO_BN))) {
			return {
				valid: false,
				expStr: `Challenge amount should be min ${formatBNToDecimalCurr(
					market.lastAmountStaked.mul(TWO_BN)
				)}`,
			};
		}

		if (wEthTokenBalance == undefined || bnValue.gt(wEthTokenBalance)) {
			return {
				valid: false,
				expStr: "Insufficient Balance",
			};
		}

		return {
			valid: true,
			expStr: "",
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
				helpText="Outcome that will be declared as the final outcome if not challenged before challenge period ends"
			/>
			<TwoColTitleInfo
				title={"Time remaining"}
				info={`${formatTimeInSeconds(
					convertBlocksToSeconds(market.optimisticState.blocksLeft)
				)}`}
				helpText="Time before which you can challenge the temporary outcome"
			/>
			{/* <TwoColTitleInfo
				title={"Challenges left"}
				info={`${
					market.donEscalationLimit - market.donEscalationCount
				}`}
				helpText="Challenges can only be made a certain number of time (max. limit), after which moderators declare the final outcome. Challenges left shows number of challenges left to reach max. limit."
			/> */}
			<TwoColTitleInfo
				title={"Min. amount to challenge"}
				info={`${formatBNToDecimalCurr(
					market.lastAmountStaked.mul(TWO_BN)
				)}`}
				helpText={`Every consecutive challenge requires amount staked (in ${CURR_SYMBOL}) to be double of the amount staked in last challenge. If there's no previous challenge, then amount staked should be greater than 0 ${CURR_SYMBOL}.`}
			/>

			<TwoColTitleInfo
				title={"Outcome favoured"}
				info={`${outcomeDisplayName(favoredOutcome)}`}
				helpText="Outcome in favour of which you are challenging the last outcome. You think that your favoured outcome should be declared as final outcome."
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
				<Text fontSize={14}>{`${CURR_SYMBOL}`}</Text>
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

			{/* <ApprovalInterface
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
			/> */}
		</Flex>
	);
}

export default ChallengeInterface;
