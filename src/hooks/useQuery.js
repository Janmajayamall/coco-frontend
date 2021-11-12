import { useQuery } from "urql";

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
