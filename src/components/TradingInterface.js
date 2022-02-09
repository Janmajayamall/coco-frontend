import { useSelector } from "react-redux";
import { selectUserProfile } from "../redux/reducers";
import { Button, Text, Flex, useToast, UnorderedList } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinTokensForExactCTokens,
	useSellExactTokensForMinCTokens,
	useTokenBalance,
	useCheckTokenApprovals,
} from "../hooks";
import {
	formatBNToDecimal,
	getAmountCBySellTokenAmount,
	getTokenAmountToBuyWithAmountC,
	useBNInput,
	getDecStrAvgPriceBN,
	GRAPH_BUFFER_MS,
	formatBNToDecimalCurr,
	minAmountAfterSlippageBn,
	CURR_SYMBOL,
	getOutcomeProbabilityFromReserves,
	ZERO_BN,
	formatDecimalToPercentage,
} from "../utils";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import PrimaryButton from "./PrimaryButton";
import { BigNumber } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import ApprovalInterface from "./ApprovalInterface";

function TradingInterface({ market, tradePosition, refreshFn }) {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;
	const toast = useToast();

	const wEthTokenBalance = useTokenBalance(account);

	/**
	 * Contract calls
	 */
	const { state: stateBuy, send: sendBuy } = useBuyMinTokensForExactCTokens();
	const {
		state: stateSell,
		send: sendSell,
	} = useSellExactTokensForMinCTokens();

	/**
	 * tabIndex == 0 -> BUY
	 * tabIndex == 1 -> SELL
	 */
	const [tabIndex, setTabIndex] = useState(0);
	const [tokenActionIndex, setTokenActionIndex] = useState(1);

	/**
	 * Buy side states
	 */
	const {
		input: inputBuyAmount,
		bnValue: inputBuyAmountBn,
		setInput: setInputBuyAmount,
		err: inputBuyAmountErr,
		errText: inputBuyAmountErrText,
	} = useBNInput(buyValidationFn);
	const [tokenOutAmountBn, setTokenOutAmountBn] = useState(BigNumber.from(0));

	/**
	 * Sell side states
	 */
	const {
		input: inputSellAmount,
		bnValue: inputSellAmountBn,
		setInput: setInputSellAmount,
		err: inputSellAmountErr,
		errText: inputSellAmountErrText,
	} = useBNInput(sellValidationFn);
	const [amountCOutBn, setAmountCOutBn] = useState(BigNumber.from(0));

	const [slippage, setSlippage] = useState(0.5);

	// updated probabilities
	const [updatedProbabilityObj, setUpdatedProbabilityObj] = useState(
		undefined
	);

	// tx loading
	const [buyLoading, setBuyLoading] = useState(false);
	const [sellLoading, setSellLoading] = useState(false);

	const tokenApproval = useCheckTokenApprovals(
		0,
		account,
		undefined,
		inputBuyAmountBn
	);
	const erc1155TokenApproval = useCheckTokenApprovals(
		1,
		account,
		market.oracle.id
	);

	useEffect(() => {
		if (
			!market ||
			tabIndex != 0 ||
			tokenActionIndex > 1 ||
			tokenActionIndex < 0
		) {
			return;
		}

		let { amount, err } = getTokenAmountToBuyWithAmountC(
			market.outcomeReserve0,
			market.outcomeReserve1,
			inputBuyAmountBn,
			tokenActionIndex
		);

		if (err === true) {
			// TODO set error
			setUpdatedProbabilityObj(undefined);
			return;
		}

		const _updatedProbs = getOutcomeProbabilityFromReserves(
			market.outcomeReserve0
				.add(inputBuyAmountBn)
				.sub(tokenActionIndex == 0 ? amount : ZERO_BN),
			market.outcomeReserve1
				.add(inputBuyAmountBn)
				.sub(tokenActionIndex == 1 ? amount : ZERO_BN)
		);

		if (_updatedProbs.error === false) {
			setUpdatedProbabilityObj(_updatedProbs);
		} else {
			setUpdatedProbabilityObj(undefined);
		}

		setTokenOutAmountBn(amount);
	}, [inputBuyAmountBn, tokenActionIndex]);

	useEffect(() => {
		if (
			!market ||
			tabIndex != 1 ||
			tokenActionIndex > 1 ||
			tokenActionIndex < 0
		) {
			return;
		}

		let { amount, err } = getAmountCBySellTokenAmount(
			market.outcomeReserve0,
			market.outcomeReserve1,
			inputSellAmountBn,
			tokenActionIndex
		);

		if (err) {
			// TODO set error
			setUpdatedProbabilityObj(undefined);
			return;
		}

		const _updatedProbs = getOutcomeProbabilityFromReserves(
			market.outcomeReserve0
				.add(tokenActionIndex == 0 ? inputSellAmountBn : ZERO_BN)
				.sub(amount),
			market.outcomeReserve1
				.add(tokenActionIndex == 1 ? inputSellAmountBn : ZERO_BN)
				.sub(amount)
		);

		if (_updatedProbs.error === false) {
			setUpdatedProbabilityObj(_updatedProbs);
		} else {
			setUpdatedProbabilityObj(undefined);
		}

		setAmountCOutBn(amount);
	}, [inputSellAmountBn, tokenActionIndex]);

	// tx state handle
	useEffect(() => {
		if (stateBuy.status == "Success" || stateSell.status == "Success") {
			setTimeout(() => {
				displayToast("Success!", "success");
				setBuyLoading(false);
				setSellLoading(false);
				if (refreshFn) {
					refreshFn();
				}
			}, GRAPH_BUFFER_MS);
		}
	}, [stateSell, stateBuy]);

	useEffect(() => {
		if (
			stateBuy.status == "Exception" ||
			stateBuy.status == "Fail" ||
			stateSell.status == "Exception" ||
			stateSell.status == "Fail"
		) {
			displayToast("Metamask err!", "error");
			setBuyLoading(false);
			setSellLoading(false);
		}
	}, [stateBuy, stateSell]);

	function displayToast(title, status) {
		toast({
			title: title,
			status: status,
			isClosable: true,
		});
	}

	function buyValidationFn(bnValue) {
		if (wEthTokenBalance == undefined || bnValue.lte(wEthTokenBalance)) {
			return { valid: true, expStr: "" };
		}
		return {
			valid: false,
			expStr: "Insufficient Balance",
		};
	}

	function sellValidationFn(bnValue) {
		if (
			(tokenActionIndex === 0 && bnValue.gt(tradePosition.amount0)) ||
			(tokenActionIndex === 1 && bnValue.gt(tradePosition.amount1))
		) {
			return {
				valid: false,
				expStr: "You don't have enough shares",
			};
		}
		return {
			valid: true,
			expStr: "",
		};
	}

	function TradingButton({ index, ...props }) {
		return (
			<Button
				{...props}
				style={
					tabIndex === index
						? {
								backgroundColor: "#0B0B0B",
						  }
						: {
								backgroundColor: "#FDFDFD",
						  }
				}
				_hover={{
					border: "1px",
					borderStyle: "solid",
					borderColor: "blue.400",
					backgroundColor: "gray.700",
				}}
				width="50%"
				justifyContent="center"
			>
				<Text
					fontSize={14}
					style={
						tabIndex === index
							? {
									color: "#FDFDFD",
							  }
							: {
									color: "#0B0B0B",
							  }
					}
				>
					{index == 0 ? "Buy" : "Sell"}
				</Text>
			</Button>
		);
	}

	return (
		<Flex flexDirection={"column"}>
			<Flex marginTop={5}>
				<TradingButton
					index={0}
					onClick={() => {
						setTabIndex(0);
					}}
				/>
				<TradingButton
					index={1}
					onClick={() => {
						setTabIndex(1);
					}}
				/>
			</Flex>
			{tabIndex === 0 ? (
				<Flex flexDirection="column">
					<TradePriceBoxes
						market={market}
						outcomeChosen={tokenActionIndex}
						onOutcomeChosen={(index) => {
							setTokenActionIndex(index);
						}}
						tradePosition={tradePosition}
					/>
					<TradingInput
						setSlippage={setSlippage}
						slippageValue={slippage}
						setInput={setInputBuyAmount}
						inputValue={inputBuyAmount}
						isBuy={true}
						err={inputBuyAmountErr}
						errText={inputBuyAmountErrText}
					/>
					<TwoColTitleInfo
						title="Your choice"
						info={tokenActionIndex === 0 ? "NO" : "YES"}
						helpText="Outcome share that you are buying"
					/>
					<TwoColTitleInfo
						title="Estimated shares bought"
						info={formatBNToDecimal(tokenOutAmountBn)}
						helpText="Number of shares you will receive based on the WETH amount you've entered"
					/>
					<TwoColTitleInfo
						title="Avg. Price per share"
						info={getDecStrAvgPriceBN(
							inputBuyAmountBn,
							tokenOutAmountBn
						)}
						helpText={`Price per outcome share in ${CURR_SYMBOL}`}
					/>
					<TwoColTitleInfo
						title="Max. potential profit"
						info={formatBNToDecimalCurr(
							tokenOutAmountBn.sub(inputBuyAmountBn)
						)}
						helpText="Maximum WETH you could win, if your prediction is correct"
					/>
					<TwoColTitleInfo
						title="New YES(%) Prob."
						info={
							updatedProbabilityObj != undefined
								? formatDecimalToPercentage(
										updatedProbabilityObj.p1
								  )
								: "N/A"
						}
						helpText="Shows how the shares you're buying will impact the YES outcome probability."
					/>
					<TwoColTitleInfo
						title="New NO(%) Prob."
						info={
							updatedProbabilityObj != undefined
								? formatDecimalToPercentage(
										updatedProbabilityObj.p0
								  )
								: "N/A"
						}
						helpText="Shows how the shares you're buying will impact the NO probability."
					/>

					<PrimaryButton
						disabled={
							!isAuthenticated ||
							!tokenApproval ||
							inputBuyAmountErr
						}
						marginTop="2"
						width="100%"
						isLoading={buyLoading}
						loadingText={"Processing..."}
						onClick={() => {
							if (
								!isAuthenticated ||
								!tokenApproval ||
								inputBuyAmountErr
							) {
								return;
							}

							let tokenOutAmountBnAfterSlippage = minAmountAfterSlippageBn(
								tokenOutAmountBn,
								slippage
							);
							if (
								tokenOutAmountBnAfterSlippage.isZero() ||
								inputBuyAmountBn.isZero()
							) {
								return;
							}

							setBuyLoading(true);

							let a0 =
								tokenActionIndex == 0
									? tokenOutAmountBnAfterSlippage
									: BigNumber.from(0);
							let a1 =
								tokenActionIndex == 1
									? tokenOutAmountBnAfterSlippage
									: BigNumber.from(0);

							sendBuy(
								a0,
								a1,
								inputBuyAmountBn,
								1 - tokenActionIndex,
								market.oracle.id,
								market.marketIdentifier
							);
						}}
						title={"Buy"}
					/>

					<ApprovalInterface
						marginTop={5}
						tokenType={0}
						erc20AmountBn={inputBuyAmountBn}
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
			) : undefined}
			{tabIndex === 1 ? (
				<Flex flexDirection="column">
					<TradePriceBoxes
						market={market}
						outcomeChosen={tokenActionIndex}
						onOutcomeChosen={(index) => {
							setTokenActionIndex(index);
						}}
						tradePosition={tradePosition}
					/>
					<TradingInput
						setSlippage={setSlippage}
						slippageValue={slippage}
						setInput={setInputSellAmount}
						inputValue={inputSellAmount}
						setMaxSell={() => {
							if (tokenActionIndex == 0) {
								setInputSellAmount(
									formatBNToDecimal(
										tradePosition.amount0,
										18,
										false
									)
								);
							}
							if (tokenActionIndex == 1) {
								setInputSellAmount(
									formatBNToDecimal(
										tradePosition.amount1,
										18,
										false
									)
								);
							}
						}}
						err={inputSellAmountErr}
						errText={inputSellAmountErrText}
						isBuy={false}
					/>
					<TwoColTitleInfo
						title="Your choice"
						info={tokenActionIndex === 0 ? "NO" : "YES"}
						helpText="Outcome share that you are selling"
					/>
					<TwoColTitleInfo
						title="Estimated amount received"
						info={formatBNToDecimalCurr(amountCOutBn)}
						helpText={`Amount in ${CURR_SYMBOL} you will receive based on Share amount you've entered`}
					/>
					<TwoColTitleInfo
						title="Avg. sell price"
						info={getDecStrAvgPriceBN(
							amountCOutBn,
							inputSellAmountBn
						)}
						helpText={`Amount in ${CURR_SYMBOL} you receive per share`}
					/>
					<TwoColTitleInfo
						title="New YES(%) Prob."
						info={
							updatedProbabilityObj != undefined
								? formatDecimalToPercentage(
										updatedProbabilityObj.p1
								  )
								: "N/A"
						}
						helpText="Shows how the shares you're selling will impact the YES outcome probability."
					/>
					<TwoColTitleInfo
						title="New NO(%) Prob."
						info={
							updatedProbabilityObj != undefined
								? formatDecimalToPercentage(
										updatedProbabilityObj.p0
								  )
								: "N/A"
						}
						helpText="Shows how the shares you're selling will impact the NO outcome probability."
					/>

					<PrimaryButton
						disabled={
							!isAuthenticated ||
							!erc1155TokenApproval ||
							inputSellAmountErr
						}
						marginTop="2"
						width="100%"
						onClick={() => {
							if (
								!isAuthenticated ||
								!erc1155TokenApproval ||
								inputSellAmountErr
							) {
								return;
							}

							let amountCOutAfterSlippageBn = minAmountAfterSlippageBn(
								amountCOutBn,
								slippage
							);

							if (
								amountCOutAfterSlippageBn.isZero() ||
								inputSellAmountBn.isZero()
							) {
								return;
							}

							setSellLoading(true);

							let a0 =
								tokenActionIndex == 0
									? inputSellAmountBn
									: BigNumber.from(0);
							let a1 =
								tokenActionIndex == 1
									? inputSellAmountBn
									: BigNumber.from(0);

							sendSell(
								a0,
								a1,
								amountCOutAfterSlippageBn,
								market.oracle.id,
								market.marketIdentifier
							);
						}}
						isLoading={sellLoading}
						loadingText={"Processing..."}
						title={"Sell"}
					/>

					<ApprovalInterface
						marginTop={10}
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
				</Flex>
			) : undefined}
		</Flex>
	);
}

export default TradingInterface;
