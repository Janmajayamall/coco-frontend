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
} from "../hooks";
import {
	convertBlocksToSeconds,
	convertDecimalStrToBigNumber,
	convertDecimalStrToInt,
	convertIntToDecimalStr,
	determineMarketState,
	filterMarketIdentifiersFromMarketsGraph,
	filterOraclesFromMarketsGraph,
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
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";

import { BigNumber, ethers, utils } from "ethers";
/**
 * You haven't checked errors returned on graph queries. (For example when postId is wrong)
 * Try putting in some validation check for postId (i.e. marketIdentifier)?
 */
function Page() {
	const urlParams = useParams();
	const postId = urlParams.postId;

	const dispatch = useDispatch();

	const { account } = useEthers();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	const { state: stateBuy, send: sendBuy } = useBuyMinTokensForExactCTokens();
	const {
		state: stateSell,
		send: sendSell,
	} = useSellExactTokensForMinCTokens();

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(
		postId,
		false
	);
	const {
		result: mSATResult,
		reexecuteQuery: mSATRexecuteQuery,
	} = useQueryMarketTradeAndStakeInfoByUser(
		postId,
		account ? account.toLowerCase() : "",
		false
	);

	const [market, setMarket] = useState(undefined);
	// const [marketStage, setMarketStage] = useState(getMarketStageName(-1));
	// const [stageTimeRemaining, setStageTimeRemaining] = useState(0);

	// console.log(marketStage, " marketStage");
	// console.log(stageTimeRemaining, "stageTimeRemaining");

	const tradeHistories =
		mSATResult.data && mSATResult.data.tradeHistories
			? mSATResult.data.tradeHistories
			: [];
	const stakeHistories =
		mSATResult.data && mSATResult.data.stakeHistories
			? mSATResult.data.stakeHistories
			: [];
	const tradePosition =
		mSATResult.data && mSATResult.data.tradePosition
			? mSATResult.data.tradePosition
			: undefined;
	const stakePosition =
		mSATResult.data && mSATResult.data.stakePosition
			? mSATResult.data.tradePosition
			: undefined;

	useEffect(async () => {
		if (!result.data || !result.data.market) {
			return;
		}
		const _market = result.data.market;

		const oracleIds = filterOraclesFromMarketsGraph([_market]);
		let res = await findModeratorsByIdArr(oracleIds);
		if (!res || !res.moderators) {
			return;
		}
		dispatch(sUpdateOraclesInfoObj(res.moderators));

		const marketIdentifiers = filterMarketIdentifiersFromMarketsGraph([
			_market,
		]);
		res = await findPostsByMarketIdentifierArr(marketIdentifiers);
		if (!res || !res.posts) {
			return;
		}
		dispatch(sUpdateMarketsMetadata(res.posts));
	}, [result]);

	useEffect(() => {
		if (!result.data || !result.data.market) {
			return;
		}

		setMarket(
			populateMarketWithMetadata(
				result.data.market,
				oraclesInfoObj,
				marketsMetadata,
				groupsFollowed,
				rinkebyLatestBlockNumber
			)
		);
	}, [
		result,
		oraclesInfoObj,
		marketsMetadata,
		groupsFollowed,
		rinkebyLatestBlockNumber,
	]);

	// useEffect(() => {
	// 	if (!market) {
	// 		return;
	// 	}
	// 	console.log(rinkebyLatestBlockNumber, " rinkebyLatestBlockNumber");
	// 	let { stage, blocksLeft } = determineMarketState(
	// 		getMarketStateDetails(market),
	// 		rinkebyLatestBlockNumber
	// 	);
	// 	setMarketStage(getMarketStageName(stage));
	// 	setStageTimeRemaining(convertBlocksToSeconds(blocksLeft));
	// }, [market, rinkebyLatestBlockNumber]);

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
	} = useBNInput();
	const [tokenOutAmountBn, setTokenOutAmountBn] = useState(BigNumber.from(0));

	/**
	 * Sell side states
	 */
	const {
		input: inputSellAmount,
		bnValue: inputSellAmountBn,
		setInput: setInputSellAmount,
		err: inputSellAmountErr,
	} = useBNInput();
	const [amountCOutBn, setAmountCOutBn] = useState(BigNumber.from(0));

	const [slippage, setSlippage] = useState(1);

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
			parseDecimalToBN(market.outcomeReserve0),
			parseDecimalToBN(market.outcomeReserve1),
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
			parseDecimalToBN(market.outcomeReserve0),
			parseDecimalToBN(market.outcomeReserve1),
			inputSellAmountBn,
			tokenActionIndex
		);

		if (err) {
			// TODO set error
			return;
		}

		setAmountCOutBn(amount);
	}, [inputSellAmountBn, tokenActionIndex]);

	if (!market || !postId) {
		return <div />;
	}

	function TradePrices() {
		return (
			<Flex marginTop="2" marginBottom="2">
				<Spacer />
				<Box
					backgroundColor="#C5E6DD"
					borderColor="#00EBA9"
					borderRadius={4}
					borderWidth={1}
					paddingLeft={18}
					paddingRight={18}
					// paddingTop={2}
					// paddingBottom={2}
					justifyContent={"space-between"}
					alignItems={"center"}
				>
					<Text fontSize="15">{`YES ${roundValueTwoDP(
						market.probability1
					)}`}</Text>
					<Text fontSize="12" fontWeight="bold">{`0 shares`}</Text>
				</Box>
				<Spacer />
				<Box
					backgroundColor="#E9CFCC"
					borderColor="#FF523E"
					borderRadius={4}
					borderWidth={1}
					paddingLeft={18}
					paddingRight={18}
					justifyContent={"space-between"}
					alignItems={"center"}
				>
					<Text fontSize="15">{`NO ${roundValueTwoDP(
						market.probability0
					)}`}</Text>
					<Text fontSize="12" fontWeight="bold">{`0 shares`}</Text>
				</Box>
				<Spacer />
			</Flex>
		);
	}

	function TwoColTitleInfo({ title, info }) {
		return (
			<Flex>
				<Text fontSize="12">{title}</Text>
				<Spacer />
				<Text fontSize="12">{info}</Text>
			</Flex>
		);
	}

	function TradeInterface() {
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
							<TradePrices />
							<NumberInput
								onChange={(val) => {
									setInputBuyAmount(val);
								}}
								placeholder="Amount"
								value={inputBuyAmount}
							>
								<NumberInputField />
							</NumberInput>
							<Text
								marginTop="1"
								fontSize="10"
								fontWeight="bold"
							>{`${slippage}% slippage`}</Text>
							<Slider
								onChange={(val) => {
									setSlippage(val);
								}}
								value={slippage}
								min={0}
								max={5}
								step={0.5}
							>
								<SliderTrack bg="red.100">
									<Box position="relative" right={10} />
									<SliderFilledTrack bg="tomato" />
								</SliderTrack>
								<SliderThumb boxSize={4} />
							</Slider>
							<TwoColTitleInfo
								title="Estimated shares bought"
								info={formatBNToDecimal(tokenOutAmountBn)}
							/>
							<TwoColTitleInfo
								title="Avg. Price per share"
								info={getAvgPrice(
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
								marginTop="2"
								width="100%"
								backgroundColor="green.100"
								onClick={() => {
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
							<TradePrices />
							<NumberInput
								onChange={(val) => {
									setInputSellAmount(val);
								}}
								placeholder="Amount"
								value={inputSellAmount}
							>
								<NumberInputField />
							</NumberInput>
							<NumberInput placeholder="Slippage %">
								<NumberInputField />
							</NumberInput>
							<Text>{`Amount C ${formatBNToDecimal(
								amountCOutBn
							)}`}</Text>
							{/* <Text>{`Avg sell price`}</Text>
							<Text>{`Max. potential profit ${convertIntToDecimalStr(
								tokenOutAmount -
									convertDecimalStrToInt(inputBuyAmount)
							)}`}</Text> */}
							<Button
								onClick={() => {
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
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Flex>
		);
	}

	function StakeInterface() {
		return (
			<Flex flexDirection="column">
				<p>{`YES ${roundValueTwoDP(market.probability1)}`}</p>
				<p>{`NO ${roundValueTwoDP(market.probability0)}`}</p>
				<p>
					{`${outcomeDisplayName(
						getTempOutcomeInChallengePeriod(market)
					)} will declared as final decision, if not challenged before ${formatTimeInSeconds(
						convertBlocksToSeconds(market.stateMetadata.blocksLeft)
					)}`}
				</p>
				<p>{`${
					Number(market.donEscalationLimit) -
					Number(market.donEscalationCount)
				} challenges left`}</p>

				<Text>
					{parseDecimalToBN(market.lastAmountStaked).isZero()
						? "You can challenge with any amount > 0"
						: `Min amount to challenge >= ${formatBNToDecimal(
								parseDecimalToBN(market.lastAmountStaked).mul(
									TWO_BN
								)
						  )}`}
				</Text>
				<NumberInput
					onChange={(val) => {
						// setInputBuyAmount(val);
					}}
					placeholder="Amount"
					value={inputBuyAmount}
				>
					<NumberInputField />
				</NumberInput>

				<Button onClick={() => {}}>
					<Text
						color="white"
						fontSize="md"
						fontWeight="medium"
						mr="2"
					>
						Challenge
					</Text>
				</Button>

				<p>Challenge history</p>
			</Flex>
		);
	}

	function RedeemWinsInterface() {
		const finalOutcome = determineOutcome(market);
		const winningsArr = getTradeWinningsArr(tradePosition, finalOutcome);
		const stakeArr = getStakeWinArr(stakePosition, finalOutcome);
		return (
			<Flex flexDirection="column">
				<Text>Claim Winnings</Text>
				<Text>{`Final decision - ${finalOutcome}`}</Text>
				<Text>You receive</Text>
				{winningsArr.map((winning) => {
					return (
						<Text>
							{`
				${formatBNToDecimal(winning.amountC)} for ${formatBNToDecimal(
								winning.amountT
							)} ${winning.outcome} tokens
			`}
						</Text>
					);
				})}
				<Button>
					<Text>Claim trade winnings</Text>
				</Button>
				{stakeArr.map((obj) => {
					if (obj.amountSR.isZero()) {
						return;
					}
					return (
						<Text>
							{`
							${formatBNToDecimal(obj.amountSR)} challenge amount used in favor of outcome ${
								obj.outcome
							}
							`}
						</Text>
					);
				})}
				{finalOutcome == Number(market.lastOutcomeStaked) &&
				account.toLowerCase() ==
					(finalOutcome == 0 ? market.staker0 : market.staker1) ? (
					<Text>
						{`${
							finalOutcome == 0
								? market.stakingReserve0
								: market.stakingReserve1
						} from loser's stake`}
					</Text>
				) : undefined}
				<Button>
					<Text>Claim stake winnings</Text>
				</Button>
			</Flex>
		);
	}
	console.log(market, " market here");
	return (
		<Flex>
			<Flex flexDirection={"column"}>
				<PostDisplay market={market} />
				<Table size="sm" variant="simple">
					<TableCaption>Trade History</TableCaption>
					<Thead>
						<Tr>
							<Th>Direction</Th>
							<Th>Amount 0</Th>
							<Th>Amount 0</Th>
							<Th>Amount 1</Th>
						</Tr>
					</Thead>
					<Tbody>
						{tradeHistories.map((row) => {
							return (
								<Tr>
									<Td>{row.buy ? "BUY" : "SELL"}</Td>
									<Td>{row.amount0}</Td>
									<Td>{row.amount1}</Td>
									<Td>{row.amountC}</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
				<Table size="sm" variant="simple">
					<TableCaption>Stake History</TableCaption>
					<Thead>
						<Tr>
							<Th>Outcome</Th>
							<Th>Amount</Th>
						</Tr>
					</Thead>
					<Tbody>
						{stakeHistories.map((row) => {
							return (
								<Tr>
									<Td>{row.outcomeStaked}</Td>
									<Td>{row.amountC}</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</Flex>
			{market && market.stateMetadata.stage == 1 ? (
				<TradeInterface />
			) : undefined}
			{market && market.stateMetadata.stage == 2 ? (
				<StakeInterface />
			) : undefined}
			{/* <RedeemWinsInterface /> */}
			<TradeInterface />
		</Flex>
	);
}

export default Page;
