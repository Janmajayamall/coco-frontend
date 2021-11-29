import {
	filterMarketIdentifiersFromMarketsGraph,
	filterOracleIdsFromMarketsGraph,
	findModeratorsByIdArr,
	findPostsByMarketIdentifierArr,
} from ".";
import {
	sUpdateMarketsMetadata,
	sUpdateOraclesInfoObj,
} from "../redux/reducers";

export async function stateSetupOraclesInfo(oracleIds, dispatch) {
	let res = await findModeratorsByIdArr(oracleIds);

	if (res == undefined) {
		return;
	}
	dispatch(sUpdateOraclesInfoObj(res.moderators));
}

export async function stateSetupMarketsMetadata(marketIdentifiers, dispatch) {
	let res = await findPostsByMarketIdentifierArr(marketIdentifiers);
	if (res == undefined) {
		return;
	}
	dispatch(sUpdateMarketsMetadata(res.posts));
}
