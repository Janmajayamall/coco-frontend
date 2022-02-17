import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile } from "../redux/reducers";
import {
	Text,
	Flex,
	Spacer,
	HStack,
	NumberInput,
	NumberInputField,
	useToast,
	Heading,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { useEffect } from "react";
import { useState } from "react";
import {
	useChallenge,
	useCreateAndChallengeMarket,
	useERC1155ApprovalForAll,
	useERC20TokenAllowanceWrapper,
	useERC20TokenBalance,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
	useQueryUserPositionsByMarketIdentifier,
} from "../hooks";
import {
	formatTimeInSeconds,
	ZERO_BN,
	findPostsByMarketIdentifierArr,
	useBNInput,
	formatBNToDecimalCurr,
	formatBNToDecimal,
	TWO_BN,
	ONE_BN,
	decodeGroupAddressFromGroupProxyFactoryCall,
	parseDecimalToBN,
	findUserStakes,
	formatDecimalToCurr,
	formatMarketData,
	calculateRedeemObj,
	COLORS,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";
import Loader from "../components/Loader";
import PrimaryButton from "../components/PrimaryButton";
import ChallengeHistoryTable from "../components/ChallengeHistoryTable";
import { BigNumber } from "ethers";
import { addresses } from "../contracts";
import ApprovalInterface from "../components/ApprovalInterface";
import TwoColTitleInfo from "../components/TwoColTitleInfo";

function Page() {
	const urlParams = useParams();
	const postId = urlParams.postId ? urlParams.postId : undefined;
	// const postId =
	// 	"0xd8f23d7fd4c7fd7e97ddfb9a846f7ad112f37b7478ca26685dcefc2f9acf01e4";

	const { account, chainId } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();

	const {
		send: sendCreateAndChallenge,
		state: stateCreateAndChallenge,
	} = useCreateAndChallengeMarket();
	const { send: sendChallenge, state: stateChallenge } = useChallenge();

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(
		postId,
		false
	);

	// CA - You might need to trigger this
	const {
		result: rUserPositions,
		reexecuteQuery: reUserPositions,
	} = useQueryUserPositionsByMarketIdentifier(
		account ? account.toLowerCase() : undefined,
		postId,
		false
	);

	const [post, setPost] = useState(null);
	// main market data
	// contains a flag whether it is on-chain or off-chain
	const [marketData, setMarketData] = useState(null);

	// state of the market
	// 0 -> hasn't been created
	// 1 -> buffer period
	// 2 -> resolution period
	// 3 -> expired
	const [marketState, setMarketState] = useState(0);

	// challenge states
	const [marketExists, setMarketExists] = useState(false);
	const [groupAddress, setGroupAddress] = useState(null);
	const [marketIdentifier, setMarketIdentifier] = useState(null);
	const [temporaryOutcome, setTemporaryOutcome] = useState(1);
	const [currentAmountBn, setCurrentAmountBn] = useState(ZERO_BN);
	const [timeLeftToChallenge, setTimeLeftToChallenge] = useState(null);
	const [timeLeftToResolve, setTimeLeftToResolve] = useState(null);

	// state for redeem
	// user's stakes
	const [userPositions, setUserPositions] = useState(null);

	// stake history
	const [stakes, setStakes] = useState([]);

	const { input, bnValue, setInput, err, errText } = useBNInput(
		validateInput
	);

	// check WETH balance and allowance
	const wETHTokenBalance = useERC20TokenBalance(account, addresses.WETH);
	const wETHTokenAllowance = useERC20TokenAllowanceWrapper(
		addresses.WETH,
		account,
		addresses.GroupRouter,
		bnValue
	);

	useEffect(() => {
		// check whether market exists on chain
		if (result.data && result.data.market) {
			// market exists on chain
			const _marketData = formatMarketData(result.data.market, true);
			setMarketExists(true);
			setGroupAddress(_marketData.group.id);
			setMarketIdentifier(_marketData.marketIdentifier);
			setTemporaryOutcome(_marketData.outcome);
			setCurrentAmountBn(_marketData.lastAmountStaked);

			// set market state and, if applicable, time left for either challenge or resolution
			let donBufferEndsAtN = _marketData.donBufferEndsAt;
			let resolutionBufferEndAtN = _marketData.resolutionBufferEndAt;
			let timestamp = new Date() / 1000;
			if (donBufferEndsAtN - timestamp > 0) {
				// state is in buffer period
				setMarketState(1);
				setTimeLeftToChallenge(donBufferEndsAtN - timestamp);
			} else if (resolutionBufferEndAtN - timestamp > 0) {
				// state is in resolution period
				setMarketState(2);
				setTimeLeftToResolve(resolutionBufferEndAtN - timestamp);
			} else {
				// state expired
				setMarketState(3);
			}

			// set stakes history
			setStakes(_marketData.stakes);

			// set min amount to challenge as input amount
			setInput(
				formatBNToDecimal(_marketData.lastAmountStaked.mul(TWO_BN))
			);

			// set market data
			setMarketData({
				..._marketData,
				onChain: true,
			});
		} else if (post != null) {
			// market does not exists on chain
			// populate challenge using creator's market data obj
			const _marketData = formatMarketData(
				JSON.parse(post.marketData),
				false
			);
			setMarketExists(false);
			setGroupAddress(_marketData.group);
			setMarketIdentifier(_marketData.marketIdentifier);
			setTemporaryOutcome(1);
			setCurrentAmountBn(_marketData.amount1);

			// set market state to 0
			setMarketState(0);

			// set min amount to challenge as input amount
			setInput(formatBNToDecimal(_marketData.amount1.mul(TWO_BN)));

			// set market data
			setMarketData({
				..._marketData,
				onChain: false,
			});
		}
	}, [result, post]);

	// set user postions
	useEffect(() => {
		if (
			rUserPositions.data &&
			rUserPositions.data.userPositions.length != 0
		) {
			setUserPositions({
				...rUserPositions.data.userPositions[0],
				amount0: parseDecimalToBN(
					rUserPositions.data.userPositions[0].amount0
				),
				amount1: parseDecimalToBN(
					rUserPositions.data.userPositions[0].amount1
				),
			});
		}
	}, [rUserPositions]);

	// get post details using postId;
	// note: postId == marketIdentifier
	useEffect(async () => {
		console.log(postId, " yoyoyo");
		let res = await findPostsByMarketIdentifierArr([postId]);
		console.log(res, " received posts");
		if (res == undefined || res.posts.length == 0) {
			// TODO set error
			return;
		}
		setPost(res.posts[0]);
	}, [postId]);

	function refreshPost() {
		window.location.reload();
	}

	function validateInput(bnValue) {
		// check bnValue is not zero
		if (bnValue.isZero()) {
			return {
				valid: false,
				expStr: "Challenge amount should be greater than 0",
			};
		}

		// check bnValue is gte currentAmountBn * 2
		if (!bnValue.gte(currentAmountBn.mul(TWO_BN))) {
			return {
				valid: false,
				expStr: `Challenge amount should be atleast ${formatBNToDecimalCurr(
					currentAmountBn.mul(TWO_BN)
				)}`,
			};
		}

		// check bnValue is lte tokenBalance
		if (!bnValue.lte(wETHTokenBalance)) {
			return {
				valid: false,
				expStr: "Insuffcient Balance",
			};
		}

		return {
			valid: true,
			expStr: "",
		};
	}

	return (
		<Flex width={"100%"}>
			<Flex width="70%" flexDirection={"column"} padding={5}>
				{/* {loadingMarket == true ? <Loader /> : undefined} */}
				<PostDisplay post={post} />
				<ChallengeHistoryTable stakes={stakes} />
			</Flex>
			<Flex width="30%" flexDirection={"column"} paddingTop={5}>
				<Flex
					flexDirection={"column"}
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={5}
				>
					<Text fontWeight={"bold"}>Rules for challenge</Text>
					<Text>
						1. YES means post is suitable and NO means otherwise
					</Text>
					<Text>
						2. You can challenge exisiting YES/NO by putting amount
						at stake
					</Text>
					<Text>
						3. Every post starts with creator staking for YES
					</Text>
					<Text>
						4. In order to challenge exisitng decision you need to
						stake double the amount staked
					</Text>
					<Text>5. Blah blah all the rules</Text>
				</Flex>
				<Flex
					flexDirection={"column"}
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
				>
					{marketState < 2 ? (
						<>
							<Heading size="sm" marginBottom={2}>
								Challenge post
							</Heading>
							<Text>{temporaryOutcome == 1 ? "YES" : "NO"}</Text>
							<Text>{`Min. Amount to Challenge: ${formatBNToDecimalCurr(
								currentAmountBn.mul(TWO_BN)
							)}`}</Text>
							{timeLeftToChallenge != undefined ? (
								<Text>{`Time left to challenge ${formatTimeInSeconds(
									timeLeftToChallenge
								)}`}</Text>
							) : undefined}

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
								// isLoading={stakeLoading}
								disabled={
									!isAuthenticated || !wETHTokenAllowance
								}
								onClick={() => {
									if (
										!isAuthenticated ||
										!wETHTokenAllowance
									) {
										return;
									}

									const newOutcome = 1 - temporaryOutcome;

									// validate values
									if (
										!validateInput(bnValue).valid ||
										groupAddress == undefined ||
										newOutcome > 1 ||
										newOutcome < 0 ||
										marketIdentifier == undefined ||
										marketData == undefined
									) {
										// TODO throw error
										return;
									}

									if (marketData.onChain == true) {
										// call challenge
										sendChallenge(
											groupAddress,
											marketIdentifier,
											newOutcome,
											bnValue
										);
									} else {
										sendCreateAndChallenge(
											[
												marketData.group,
												marketData.marketIdentifier,
												marketData.amount1,
											],
											post.marketSignature,
											0,
											bnValue
										);
									}
								}}
								// title={`Outcome is ${outcomeDisplayName(
								// 	favoredOutcome
								// )}, I challenge`}
								title="Challenge"
								style={{
									marginTop: 5,
								}}
							/>
						</>
					) : undefined}
					{marketState == 2 ? (
						<Heading size="sm" marginBottom={2}>
							Post is under review
						</Heading>
					) : undefined}
					{marketState == 3 ? (
						<>
							<Heading size="sm" marginBottom={2}>
								Post Resolved
							</Heading>
							<TwoColTitleInfo
								title={"Final outcome:"}
								info={`${temporaryOutcome == 0 ? "NO" : "YES"}`}
								marginBottom={1}
							/>

							<Text fontSize={14} fontWeight="bold">
								Your challenges
							</Text>
							<TwoColTitleInfo
								title={"In favour of YES:"}
								info={`${formatBNToDecimalCurr(
									userPositions != undefined
										? userPositions.amount1
										: ZERO_BN
								)}`}
							/>
							<TwoColTitleInfo
								title={"In favour of NO:"}
								info={`${formatBNToDecimalCurr(
									userPositions != undefined
										? userPositions.amount0
										: ZERO_BN
								)}`}
								marginBottom={1}
							/>
							<TwoColTitleInfo
								title={"You win:"}
								info={`${formatBNToDecimalCurr(
									calculateRedeemObj(
										marketData,
										account,
										userPositions
									).wins
								)}`}
							/>
							<TwoColTitleInfo
								title={"You get back in total:"}
								info={`${formatBNToDecimalCurr(
									calculateRedeemObj(
										marketData,
										account,
										userPositions
									).total
								)}`}
								marginBottom={1}
							/>

							<PrimaryButton
								loadingText="Processing..."
								disabled={
									!isAuthenticated || !wETHTokenAllowance
								}
								onClick={() => {
									if (
										!isAuthenticated ||
										!wETHTokenAllowance
									) {
										return;
									}
								}}
								title="Redeeem"
								style={{
									marginTop: 5,
								}}
							/>
						</>
					) : undefined}
				</Flex>
				<ApprovalInterface
					marginTop={5}
					tokenType={0}
					erc20Address={addresses.WETH}
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
		</Flex>
	);
}

export default Page;
