import { useDispatch, useSelector } from "react-redux";
import {
	selectOracleInfoObj,
	selectMarketsMetadata,
	selectGroupsFollowed,
	selectRinkebyLatestBlockNumber,
} from "../redux/reducers";
import {
	Text,
	Flex,
	Spacer,
	HStack,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { useEffect } from "react";
import { useState } from "react";
import {
	useERC1155ApprovalForAll,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
} from "../hooks";
import {
	convertBlocksToSeconds,
	filterMarketIdentifiersFromMarketsGraph,
	filterOracleIdsFromMarketsGraph,
	populateMarketWithMetadata,
	formatTimeInSeconds,
	findTokenIdBalanceInTokenArr,
	stateSetupOraclesInfo,
	stateSetupMarketsMetadata,
	ZERO_BN,
	findPostsByMarketIdentifierArr,
	useBNInput,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";
import Loader from "../components/Loader";
import PrimaryButton from "../components/PrimaryButton";
import ChallengeHistoryTable from "../components/ChallengeHistoryTable";

function Page() {
	const urlParams = useParams();
	// const postId = urlParams.postId;
	const postId =
		"0xef8906d4604cef88d0727015ed8537ad3f6620a9b16d10b5810de729ade04dd4";

	const dispatch = useDispatch();

	const { account } = useEthers();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(postId);

	// const erc1155ApprovalForAll = useERC1155ApprovalForAll(
	// 	market ? market.oracle.id : undefined,
	// 	account
	// );

	const [post, setPost] = useState(null);

	const { input, bnValue, setInput, err, errText } = useBNInput(
		validateInput
	);

	// get post details using postId; postId == marketIdentifier
	useEffect(async () => {
		let res = await findPostsByMarketIdentifierArr([postId]);
		if (res == undefined || res.posts.length == 0) {
			// TODO set error
			return;
		}
		setPost(res.posts[0]);
	}, [postId]);

	// useEffect(() => {
	// 	const tokenApprovals =
	// 		tokenApprovalsResult.data &&
	// 		tokenApprovalsResult.data.tokenApprovals
	// 			? tokenApprovalsResult.data.tokenApprovals
	// 			: [];
	// 	const obj = tokenApprovals.find(
	// 		(obj) =>
	// 			obj.operator == addresses.MarketRouter.toLowerCase() &&
	// 			obj.approved == true
	// 	);
	// 	setTokenApproval(obj != undefined);
	// }, [tokenApprovalsResult]);

	function refreshPost() {
		window.location.reload();
	}

	function validateInput(bnValue) {
		// if (market.lastAmountStaked.isZero() && bnValue.isZero()) {
		// 	return {
		// 		valid: false,
		// 		expStr: "Challenge amount should be greater than 0",
		// 	};
		// }

		// if (bnValue.lt(market.lastAmountStaked.mul(TWO_BN))) {
		// 	return {
		// 		valid: false,
		// 		expStr: `Challenge amount should be min ${formatBNToDecimalCurr(
		// 			market.lastAmountStaked.mul(TWO_BN)
		// 		)}`,
		// 	};
		// }

		// if (wEthTokenBalance == undefined || bnValue.gt(wEthTokenBalance)) {
		// 	return {
		// 		valid: false,
		// 		expStr: "Insufficient Balance",
		// 	};
		// }

		return {
			valid: true,
			expStr: "",
		};
	}

	return (
		<Flex style={{ maxWidth: 1650, marginTop: 5 }}>
			<Spacer />
			<Flex width="50%" flexDirection={"column"} marginRight={5}>
				{/* {loadingMarket == true ? <Loader /> : undefined} */}
				<PostDisplay post={post} />
				<ChallengeHistoryTable stakeHistories={[]} />
			</Flex>
			<Flex width="20%" flexDirection={"column"}>
				<Flex
					flexDirection={"column"}
					padding={2}
					backgroundColor="gray.100"
					marginTop={5}
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
				<Text>Challenge the post</Text>
				<Text>YES</Text>
				<Text>Min. Amount to Challenge 1000</Text>
				<Text>Time left to challenge 12H</Text>

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
				<PrimaryButton
					loadingText="Processing..."
					// isLoading={stakeLoading}
					// disabled={!isAuthenticated || !tokenApproval}
					onClick={() => {
						// if (!isAuthenticated && tokenApproval) {
						// 	return;
						// }
						// // TODO validation checks
						// // favored outcome can't be 2
						// if (favoredOutcome == 2) {
						// 	return;
						// }
						// setStakeLoading(true);
						// send(
						// 	favoredOutcome,
						// 	bnValue,
						// 	market.oracle.id,
						// 	market.marketIdentifier
						// );
					}}
					// title={`Outcome is ${outcomeDisplayName(
					// 	favoredOutcome
					// )}, I challenge`}
					title="Challenge"
					style={{
						marginTop: 5,
					}}
				/>
			</Flex>
			<Spacer />
		</Flex>
	);
}

export default Page;

// const {
// 	result: mSATResult,
// 	reexecuteQuery: mSATReexecuteQuery,
// } = useQueryMarketTradeAndStakeInfoByUser(
// 	postId,
// 	account ? account.toLowerCase() : ""
// );

// const [market, setMarket] = useState(undefined);
// const [loadingMarket, setLoadingMarket] = useState(true);
// const [tradeHistories, setTradeHistories] = useState([]);
// const [stakeHistories, setStakeHistories] = useState([]);
// const [tradePosition, setTradePosition] = useState({
// 	amount0: ZERO_BN,
// 	amount1: ZERO_BN,
// });
// const [stakePosition, setStakePosition] = useState({
// 	amount0: ZERO_BN,
// 	amount1: ZERO_BN,
// });
