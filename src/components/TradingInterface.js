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
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import PrimaryButton from "./PrimaryButton";
import { useParams } from "react-router";
import { BigNumber, ethers, utils } from "ethers";
import TradingInput from "./TradingInput";
import TradePriceBoxes from "./TradePriceBoxes";
import addresses from "./../contracts/addresses.json";
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "react-dom/cjs/react-dom.development";

function TradingInterface({
	market,
	tradePosition,
	erc1155ApprovalForAll,
	refreshFn,
}) {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;
	const toast = useToast();
	console.log(
		erc1155ApprovalForAll,
		"erc1155ApprovalForAll erc1155ApprovalForAll"
	);
	/**
	 * Contract calls
	 */
	const { state: stateBuy, send: sendBuy } = useBuyMinTokensForExactCTokens();
	const {
		state: stateSell,
		send: sendSell,
	} = useSellExactTokensForMinCTokens();
	const {
		state: stateSetApproval,
		send: sendSetApproval,
	} = useERC1155SetApprovalForAll(market.oracle.id);

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
		err: inputBuyAmountErr, // TODO supply validation function
	} = useBNInput();
	const [tokenOutAmountBn, setTokenOutAmountBn] = useState(BigNumber.from(0));

	/**
	 * Sell side states
	 * @TODO You are missing token approval button for selling tokens
	 */
	const {
		input: inputSellAmount,
		bnValue: inputSellAmountBn,
		setInput: setInputSellAmount,
		err: inputSellAmountErr,
		errText: inputSellAmountErrText,
	} = useBNInput(sellValidationFn);
	const [amountCOutBn, setAmountCOutBn] = useState(BigNumber.from(0));

	const [slippage, setSlippage] = useState(1);

	// tx loading
	const [buyLoading, setBuyLoading] = useState(false);
	const [sellLoading, setSellLoading] = useState(false);
	const [approvalLoading, setApprovalLoading] = useState(false);

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

	// tx loading
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

	// handle tx error
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
	}, [stateSetApproval]);

	function displayToast(title, status) {
		toast({
			title: title,
			status: status,
			isClosable: true,
		});
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

	return (
		<Flex flexDirection={"column"}>
			<Tabs
				backgroundColor={"#ffffff"}
				defaultIndex={0}
				isFitted
				variant="enclosed"
				onChange={(index) => {
					setTabIndex(index);
				}}
			>
				<TabList mb="1em">
					<Tab>Buy</Tab>
					<Tab>Sell</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
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
							info={formatBNToDecimal(
								tokenOutAmountBn.sub(inputBuyAmountBn)
							)}
						/>
						<Button
							disabled={!isAuthenticated}
							marginTop="2"
							width="100%"
							backgroundColor="green.100"
							onClick={() => {
								if (!isAuthenticated) {
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
							isLoading={buyLoading}
							loadingText={"Processing..."}
						>
							<Text
								color="white"
								fontSize="md"
								fontWeight="medium"
								mr="2"
							>
								Buy
							</Text>
						</Button>
					</TabPanel>
					<TabPanel>
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
									setInputSellAmount(tradePosition.amount0);
								}
								if (tokenActionIndex == 1) {
									setInputSellAmount(tradePosition.amount1);
								}
							}}
							err={inputSellAmountErr}
							errText={inputSellAmountErrText}
						/>
						<TwoColTitleInfo
							title="Your choice"
							info={tokenActionIndex === 0 ? "NO" : "YES"}
						/>
						<TwoColTitleInfo
							title="Estimated amount received"
							info={formatBNToDecimal(amountCOutBn)}
						/>
						<TwoColTitleInfo
							title="Avg. sell price"
							info={getDecStrAvgPriceBN(
								amountCOutBn,
								inputSellAmountBn
							)}
						/>

						<Button
							disabled={
								!isAuthenticated || !erc1155ApprovalForAll
							}
							backgroundColor="red.100"
							marginTop="2"
							width="100%"
							onClick={() => {
								if (!isAuthenticated) {
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
						>
							<Text
								color="white"
								fontSize="md"
								fontWeight="medium"
								mr="2"
							>
								Sell
							</Text>
						</Button>

						{erc1155ApprovalForAll === false ? (
							<Flex flexDirection={"column"} marginTop={5}>
								<Box
									padding={2}
									backgroundColor="red.300"
									borderRadius={20}
								>
									<Text fontSize={12}>
										To sell, you will have to first give
										token approval to the app. This is only
										needed once per group.
									</Text>
								</Box>
								<PrimaryButton
									style={{ marginTop: 5 }}
									disabled={erc1155ApprovalForAll !== false}
									loadingText="Processing..."
									isLoading={approvalLoading}
									onClick={() => {
										if (erc1155ApprovalForAll === false) {
											setApprovalLoading(true);
											sendSetApproval(
												addresses.MarketRouter,
												true
											);
										}
									}}
									title={"Set approval"}
								/>
							</Flex>
						) : undefined}
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Flex>
	);
}

export default TradingInterface;
