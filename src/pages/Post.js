import { useDispatch, useSelector } from "react-redux";
import {
	selectOracleInfoObj,
	selectMarketsMetadata,
	selectGroupsFollowed,
	selectRinkebyLatestBlockNumber,
} from "../redux/reducers";
import { Text, Flex, Spacer } from "@chakra-ui/react";
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
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";
import Loader from "../components/Loader";

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

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(postId);
	const {
		result: mSATResult,
		reexecuteQuery: mSATReexecuteQuery,
	} = useQueryMarketTradeAndStakeInfoByUser(
		postId,
		account ? account.toLowerCase() : ""
	);

	const [market, setMarket] = useState(undefined);
	const [loadingMarket, setLoadingMarket] = useState(true);
	const [tradeHistories, setTradeHistories] = useState([]);
	const [stakeHistories, setStakeHistories] = useState([]);
	const [tradePosition, setTradePosition] = useState({
		amount0: ZERO_BN,
		amount1: ZERO_BN,
	});
	const [stakePosition, setStakePosition] = useState({
		amount0: ZERO_BN,
		amount1: ZERO_BN,
	});

	const erc1155ApprovalForAll = useERC1155ApprovalForAll(
		market ? market.oracle.id : undefined,
		account
	);

	useEffect(async () => {
		if (!result.data || !result.data.market) {
			return;
		}
		const _market = result.data.market;

		await stateSetupOraclesInfo(
			filterOracleIdsFromMarketsGraph([_market]),
			dispatch
		);
		await stateSetupMarketsMetadata(
			filterMarketIdentifiersFromMarketsGraph([_market]),
			dispatch
		);
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
		setLoadingMarket(false);
	}, [
		result,
		oraclesInfoObj,
		marketsMetadata,
		groupsFollowed,
		rinkebyLatestBlockNumber,
	]);

	useEffect(() => {
		setTradeHistories(
			mSATResult.data && mSATResult.data.tradeHistories
				? mSATResult.data.tradeHistories
				: []
		);

		setStakeHistories(
			mSATResult.data && mSATResult.data.stakeHistories
				? mSATResult.data.stakeHistories
				: []
		);

		const tokenBalances = mSATResult.data
			? mSATResult.data.tokenBalances
			: [];

		setTradePosition({
			amount0: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.oToken0Id : undefined
			),
			amount1: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.oToken1Id : undefined
			),
		});

		setStakePosition({
			amount0: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.sToken0Id : undefined
			),
			amount1: findTokenIdBalanceInTokenArr(
				tokenBalances,
				market ? market.sToken1Id : undefined
			),
		});
	}, [mSATResult, market]);

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

	return (
		<Flex style={{ maxWidth: 1650, marginTop: 5 }}>
			<Spacer />
			<Flex width="50%" flexDirection={"column"} marginRight={5}>
				{loadingMarket == true ? <Loader /> : undefined}
				{market && market.oracleInfo != undefined ? (
					<PostDisplay market={market} />
				) : undefined}
			</Flex>

			<Spacer />
		</Flex>
	);
}

export default Page;
