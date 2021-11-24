import { toCheckSumAddress } from "./auth";

/**
 * Filters oracle ids from market schema returns by Graph index
 * @note Oracle ids are oracle addresses, thus the value returned
 * is checksummed
 */
export function filterOraclesFromMarketsGraph(markets) {
	const oracleIds = [];
	markets.forEach((market) => {
		if (market.oracle && market.oracle.id) {
			oracleIds.push(toCheckSumAddress(market.oracle.id));
		}
	});
	return oracleIds;
}

export function filterMarketIdentifiersFromMarketsGraph(markets) {
	const identifiers = [];
	markets.forEach((market) => {
		if (market.marketIdentifier) {
			identifiers.push(market.marketIdentifier);
		}
	});
	return identifiers;
}

export function populateMarketWithMetadata(
	market,
	oraclesInfo,
	marketsMetadata,
	groupsFollowed
) {
	return {
		...market,
		oracleInfo: oraclesInfo[toCheckSumAddress(market.oracle.id)],
		imageUrl: marketsMetadata[market.marketIdentifier]
			? marketsMetadata[market.marketIdentifier].eventIdentifierStr
			: undefined,
		follow: groupsFollowed[toCheckSumAddress(market.oracle.id)]
			? toCheckSumAddress(market.oracle.id)
			: false,
	};
}

export function roundValueTwoDP(value) {
	let _value = value;
	try {
		if (typeof _value == "string") {
			_value = Number(_value);
		}
	} catch (e) {
		return 0;
	}

	// TODO finish this
	return _value.toFixed(2);
}

export function numStrFormatter(value, digits = 1) {
	let _value = value;
	try {
		if (typeof _value == "string") {
			_value = Number(_value);
		}
	} catch (e) {
		return 0;
	}

	if (_value > 1000000) {
		_value = (_value / 1000000).toFixed(digits) + "M";
	} else if (_value > 1000) {
		_value = (_value / 1000).toFixed(digits) + "K";
	} else {
		_value = String(_value);
	}
	return _value;
}
