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
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinTokensForExactCTokens,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
} from "../hooks";
import {
	convertDecimalStrToBigNumber,
	convertDecimalStrToInt,
	convertIntToDecimalStr,
	filterMarketIdentifiersFromMarketsGraph,
	filterOraclesFromMarketsGraph,
	findModeratorsByIdArr,
	findPostsByMarketIdentifierArr,
	getAmountCBySellTokenAmount,
	getAmountCToBuyTokens,
	getAvgPriceOfOutcomeToken,
	getTokenAmountToBuyWithAmountC,
	populateMarketWithMetadata,
	roundValueTwoDP,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";
import { BigNumber } from "@ethersproject/abi/node_modules/@ethersproject/bignumber";

/**
 * You haven't checked errors returned on graph queries. (For example when postId is wrong)
 * Try putting in some validation check for postId (i.e. marketIdentifier)?
 */
function Page() {
	const urlParams = useParams();
	const postId = urlParams.postId;
	console.log(postId, " postId");
	const dispatch = useDispatch();

	const { account } = useEthers();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);

	const { state: stateBuy, send: sendBuy } = useBuyMinTokensForExactCTokens();
	console.log(stateBuy, " stateBuy");
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

		setMarket(_market);
	}, [result]);

	console.log(postId, market, "marketIdentifier is here");
	console.log(mSATResult, " market stake and trade result");
	const [tabIndex, setTabIndex] = useState(0);

	const [tokenActionIndex, setTokenActionIndex] = useState(0);

	/**
	 * Buy side states
	 */
	const [inputBuyAmount, setInputBuyAmount] = useState(0);
	const [tokenOutAmount, setTokenOutAmount] = useState(BigNumber.from(0));

	/**
	 * Sell side states
	 */
	const [inputSellAmount, setInputSellAmount] = useState(0);
	const [amountCOut, setAmountCOut] = useState(0);

	useEffect(() => {
		if (
			!market ||
			tabIndex != 0 ||
			tokenActionIndex > 1 ||
			tokenActionIndex < 0 ||
			inputBuyAmount <= 0
		) {
			return;
		}

		let { amount, err } = getTokenAmountToBuyWithAmountC(
			convertDecimalStrToBigNumber(market.outcomeReserve0),
			convertDecimalStrToBigNumber(market.outcomeReserve1),
			convertDecimalStrToBigNumber(inputBuyAmount),
			tokenActionIndex
		);

		if (err) {
			// TODO set error
			return;
		}

		setTokenOutAmount(amount);
	}, [inputBuyAmount, tokenActionIndex]);

	useEffect(() => {
		if (
			!market ||
			tabIndex != 1 ||
			tokenActionIndex > 1 ||
			tokenActionIndex < 0 ||
			inputSellAmount <= 0
		) {
			return;
		}

		let { amount, err } = getAmountCBySellTokenAmount(
			convertDecimalStrToBigNumber(market.outcomeReserve0),
			convertDecimalStrToBigNumber(market.outcomeReserve1),
			convertDecimalStrToBigNumber(inputSellAmount),
			tokenActionIndex
		);
		console.log(amount, err);

		if (err) {
			// TODO set error
			return;
		}

		setAmountCOut(amount);
	}, [inputSellAmount, tokenActionIndex]);

	if (!market || !postId) {
		return <div />;
	}

	function TradePrices() {
		return (
			<>
				{" "}
				<p>{`YES ${roundValueTwoDP(market.probability1)}`}</p>
				<p>{`NO ${roundValueTwoDP(market.probability0)}`}</p>
			</>
		);
	}

	return (
		<Flex>
			<PostDisplay
				market={populateMarketWithMetadata(
					market,
					oraclesInfoObj,
					marketsMetadata,
					groupsFollowed
				)}
			/>
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
							>
								<NumberInputField />
							</NumberInput>
							<NumberInput placeholder="Slippage %">
								<NumberInputField />
							</NumberInput>
							<Text>{`Amount ${convertIntToDecimalStr(
								tokenOutAmount
							)}`}</Text>
							<Text>{`Avg. Price ${getAvgPriceOfOutcomeToken(
								tokenOutAmount,
								convertDecimalStrToInt(inputBuyAmount)
							)}`}</Text>
							<Text>{`Max. potential profit ${convertIntToDecimalStr(
								tokenOutAmount -
									convertDecimalStrToInt(inputBuyAmount)
							)}`}</Text>
							<Button
								onClick={() => {
									let a0 =
										tokenActionIndex == 0
											? tokenOutAmount
											: 0;
									let a1 =
										tokenActionIndex == 1
											? tokenOutAmount
											: 0;
									console.log(
										a0,
										a1,
										convertDecimalStrToBigNumber(
											inputBuyAmount
										),
										1 - tokenActionIndex,
										market.oracle.id,
										market.marketIdentifier
									);
									sendBuy(
										a0,
										a1,
										convertDecimalStrToBigNumber(
											inputBuyAmount
										),
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
							>
								<NumberInputField />
							</NumberInput>
							<NumberInput placeholder="Slippage %">
								<NumberInputField />
							</NumberInput>
							<Text>{`Amount C ${convertIntToDecimalStr(
								amountCOut
							)}`}</Text>
							<Text>{`Avg sell price`}</Text>
							{/* <Text>{`Max. potential profit ${convertIntToDecimalStr(
								tokenOutAmount -
									convertDecimalStrToInt(inputBuyAmount)
							)}`}</Text> */}
							<Button>
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
		</Flex>
	);
}

export default Page;
