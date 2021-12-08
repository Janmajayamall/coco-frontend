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
	useToast,
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
	useERC1155SetApprovalForAll,
	useCheckTokenApprovals,
	useTokenBalance,
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
	getAvgPriceBN,
	getDecStrAvgPriceBN,
	GRAPH_BUFFER_MS,
	formatBNToDecimalCurr,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import PrimaryButton from "./PrimaryButton";
import { useParams } from "react-router";
import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import addresses from "./../contracts/addresses.json";
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

		if (err) {
			// TODO set error
			return;
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
			return;
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
			displayToast("Metmask err!", "error");
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
		if (wEthTokenBalance != undefined && bnValue.lte(wEthTokenBalance)) {
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
					/>
					<TwoColTitleInfo
						title="Estimated shares bought"
						info={formatBNToDecimal(tokenOutAmountBn)}
					/>
					<TwoColTitleInfo
						title="Avg. Price per share"
						info={getDecStrAvgPriceBN(
							inputBuyAmountBn,
							tokenOutAmountBn
						)}
					/>
					<TwoColTitleInfo
						title="Max. potential profit"
						info={formatBNToDecimalCurr(
							tokenOutAmountBn.sub(inputBuyAmountBn)
						)}
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

							setBuyLoading(true);

							let a0 =
								tokenActionIndex == 0
									? tokenOutAmountBn
									: BigNumber.from(0);
							let a1 =
								tokenActionIndex == 1
									? tokenOutAmountBn
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
					/>
					<TwoColTitleInfo
						title="Estimated amount received"
						info={formatBNToDecimalCurr(amountCOutBn)}
					/>
					<TwoColTitleInfo
						title="Avg. sell price"
						info={getDecStrAvgPriceBN(
							amountCOutBn,
							inputSellAmountBn
						)}
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
								amountCOutBn,
								market.oracle.id,
								market.marketIdentifier
							);
						}}
						isLoading={sellLoading}
						loadingText={"Processing..."}
						title={"Sell"}
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
				</Flex>
			) : undefined}
		</Flex>
	);
}

export default TradingInterface;
