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
    		}
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
	console.log(first, skip, timestamp, pause);
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
	// console.log(first, skip, oracles, pause, "121s");
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

export function useQueryFeedByModeratorList(moderators) {
	const [result, reexecuteQuery] = useQuery({
		query: QueryFeedByModeratorList,
		variables: { moderators },
	});
	return {
		result,
		reexecuteQuery,
	};
}
