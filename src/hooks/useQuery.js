import { useQuery } from "urql";

const QueryExploreMarkets = `
	query ($first: Int!, $skip: Int!, $timestamp: BigInt!) {
		markets(first: $first, skip: $skip, orderBy: totalVolume, orderDirection: desc, where:{timestamp_gt: $timestamp}){
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			tradeVolume
			stakeVolume
			totalVolume
			lastActionTimestamp
			oracle {
     			id
    		}
		}
	}
`;

const QueryMarketsByOracles = `
	query ($first: Int!, $skip: Int!, $oracles: [String!]!) {
		markets(first: $first, skip: $skip, where:{oracle_in: $oracles}, orderBy: timestamp, orderDirection: desc) {
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			oracle{
     			id
    		}
		}
	}
`;

const QueryMarketByMarketIdentifier = `
	query ($marketIdentifier: Bytes!) {
		market(id: $marketIdentifier) {
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			oracle{
     			id
				delegate
    		}
			oToken0Id
			oToken1Id
			sToken0Id
			sToken1Id
		}
	}
`;

const QueryMarketsAtStage3ByOracles = `
	query ($oracles: [Bytes!]!) {
		markets(where: {oracle_in: $oracles}) {
			id
			creator
			eventIdentifier
			marketIdentifier
			outcomeReserve0
			outcomeReserve1
			probability0
			probability1
			stakingReserve0
			stakingReserve1
			tokenC
			feeNumerator
			feeDenominator
			fee
			expireAtBlock
			donBufferEndsAtBlock
			resolutionEndsAtBlock
			donBufferBlocks
			resolutionBufferBlocks
			donEscalationCount
			donEscalationLimit
			outcome
			stage
			staker0
			staker1
			lastAmountStaked
			lastOutcomeStaked
			timestamp
			oracle{
     			id
    		}
			oToken0Id
			oToken1Id
			sToken0Id
			sToken1Id
		}
	}
`;

const QueryMarketTradeAndStakeInfoByUser = `
	query ($user: Bytes!, $marketIdentifier: Bytes!, $positionIdentifier: Bytes!){
			tradeHistories(where:{user: $user, market: $marketIdentifier}, orderBy: tradeIndex, orderDirection: desc){
				id
				amount0
				amount1
				amountC
				buy
				timestamp
				tradeIndex
			}
			stakeHistories(where: {market: $marketIdentifier}, orderBy: stakeIndex, orderDirection: desc){
				id
				user {
					id
				}
				amountC
				outcomeStaked
				timestamp
				stakeIndex
			}

			tokenBalances(where:{user: $user, market: $marketIdentifier}){
				id
				user
				oracle
				market
				tokenId
				balance
			}

			tradePosition(id: $positionIdentifier) {
				id
				amount0
				amount1
				timestamp
			}
			stakePosition(id: $positionIdentifier){
				id
				amountStaked0
				amountStaked1
				timestamp
			}
		}
`;

const QueryOraclesByManager = `
  query ($manager: Bytes!) {
	oracles(where:{manager: $manager}){
		id
		delegate
		manager
		collateralToken
		isActive
		feeNumerator
		feeDenominator
		donEscalationLimit
		expireBufferBlocks
		donBufferBlocks
		resolutionBufferBlocks
		factory
	}
  }
`;

const QueryMarketsByUserInteraction = `
  query ($user: Bytes!) {
	user(id: $user){
		markets{
			market{
				id
				marketIdentifier
				creator
				eventIdentifier
				marketIdentifier
				outcomeReserve0
				outcomeReserve1
				probability0
				probability1
				stakingReserve0
				stakingReserve1
				tokenC
				feeNumerator
				feeDenominator
				fee
				expireAtBlock
				donBufferEndsAtBlock
				resolutionEndsAtBlock
				donBufferBlocks
				resolutionBufferBlocks
				donEscalationCount
				donEscalationLimit
				outcome
				stage
				staker0
				staker1
				lastAmountStaked
				lastOutcomeStaked
				timestamp
				oracle{
					id
				}
				oToken0Id
				oToken1Id
				sToken0Id
				sToken1Id
			}
		}
	}
  }
`;

const QueryTokenApprovalsByUserAndOracle = `
  query ($user: Bytes!, $oracle: Bytes) {
	tokenApprovals(where:{user: $user, oracle: $oracle}){
		id
		user
		oracle
		operator
		approved
	}
  }
`;

const QueryTokenBalancesByUser = `
  query ($user: Bytes!) {
	  tokenBalances(where:{user: $user}){
		id
		user
		oracle
		market
		tokenId
		balance
	}
  }
`;

const QueryAllOracles = `
  query {
    oracles{
        id
    }
  }
`;

const QueryOracleByDelegate = `
  query ($delegate: Bytes!) {
    oracles(where:{delegate: $delegate }){
        id,
        delegate
    }
  }
`;

const QueryOracleById = `
  query ($id: String!){
    oracle(id:$id){
		id
		delegate
		manager
		collateralToken
		isActive
		feeNumerator
		feeDenominator
		donEscalationLimit
		expireBufferBlocks
		donBufferBlocks
		resolutionBufferBlocks
		tokenBalances
		factory
    }
  }
`;

const QueryFeedByModeratorList = `
  query ($moderators: [Bytes!]!){
    markets(where:{creator_in:$moderators}) {
        id
        factory {
        id
        }
        creator
        oracle
      }
    }
`;

export function useQueryExploreMarkets(first, skip, timestamp, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryExploreMarkets,
		variables: {
			first,
			skip,
			timestamp,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketByOracles(first, skip, oracles, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsByOracles,
		variables: {
			first,
			skip,
			oracles,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketsOrderedByLatest() {
	const [result, reexecuteQuery] = useQuery({
		query: QueryExploreMarkets,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketByMarketIdentifier(marketIdentifier, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketByMarketIdentifier,
		variables: {
			marketIdentifier,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryMarketTradeAndStakeInfoByUser(
	marketIdentifier,
	user,
	pause
) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketTradeAndStakeInfoByUser,
		variables: {
			user,
			marketIdentifier,
			positionIdentifier: `${user}-${marketIdentifier}`,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryTokenApprovalsByUserAndOracle(user, oracle, pause) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryTokenApprovalsByUserAndOracle,
		variables: {
			user,
			oracle,
		},
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryOraclesByManager(manager, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryOraclesByManager,
		variables: { manager },
		pause,
	});
	return { result, reexecuteQuery };
}

export function useQueryMarketsAtStage3ByOracles(oracles, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsAtStage3ByOracles,
		variables: { oracles },
		pause,
	});
	return { result, reexecuteQuery };
}

export function useQueryMarketsByUserInteraction(user, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryMarketsByUserInteraction,
		variables: { user },
		pause,
	});
	return { result, reexecuteQuery };
}
export function useQueryTokenBalancesByUser(user, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryTokenBalancesByUser,
		variables: { user },
		pause,
	});
	return { result, reexecuteQuery };
}

export function useQueryOracleById(id, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryOracleById,
		variables: { id },
		pause,
	});
	return {
		result,
		reexecuteQuery,
	};
}

/**
 * Below are the old ones
 */

export function useQueryAllOracles() {
	const [result, reexecuteQuery] = useQuery({
		query: QueryAllOracles,
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryOracleByDelegate(delegateAddress) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryOracleByDelegate,
		variables: { delegate: delegateAddress },
	});
	return {
		result,
		reexecuteQuery,
	};
}

export function useQueryFeedByModeratorList(moderators, pause = false) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryFeedByModeratorList,
		variables: { moderators },
	});
	return {
		result,
		reexecuteQuery,
	};
}
