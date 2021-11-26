import { toCheckSumAddress } from "./auth";
import Web3 from "web3";
import { BigNumber, utils } from "ethers";

const web3 = new Web3();
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
	convertDecimalStrToBigNumber(value);
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

export function convertDecimalStrToBigNumber(str, dp = 8, base = 18) {
	// str = parseFloat(str).toFixed(dp) * 10 ** dp;
	// console.log(str);
	// let bn = BigNumber.from(str)
	// 	.mul(BigNumber.from(10).pow(base))
	// 	.div(BigNumber.from(10).pow(dp));
	// console.log(bn.toString());

	console.log(utils.parseUnits("0.01", 18));
}

export function convertBigNumberToDecimalStr(value, base = 18) {}

export function isValidTradeEq(r0, r1, a0, a1, a, isBuy) {
	if (typeof isBuy !== "boolean") {
		return false;
	}
	if (isBuy && r0 + a - a0 >= 0 && r1 + a - a1 >= 0) {
		return true;
	} else if (!isBuy && r0 + a0 - a >= 0 && r1 + a1 - a >= 0) {
		return true;
	}
	return false;
}

export function getTokenAmountToBuyWithAmountC(r0, r1, a, tokenIndex) {
	if (
		!BigNumber.isBigNumber(r0) ||
		!BigNumber.isBigNumber(r1) ||
		!BigNumber.isBigNumber(a)
	) {
		return { amount: 0, err: true };
	}

	if (tokenIndex > 1 || tokenIndex < 0) {
		return { amount: 0, err: true };
	}
	let tokenAmount = BigNumber.from(0);
	if (tokenIndex == 0) {
		tokenAmount = r0.add(a).sub(r0.mul(r1).div(r1.add(a)));
	} else {
		tokenAmount = r1.add(a).sub(r0.mul(r1).div(r0.add(a)));
	}
	tokenAmount = tokenAmount.add(BigNumber.from(1));
	return {
		amount: tokenAmount,
		err: false,
	};
}

export function getAmountCBySellTokenAmount(r0, r1, tA, tokenIndex) {
	if (tokenIndex > 1 || tokenIndex < 0) {
		return { amount: 0, err: true };
	}

	if (
		!BigNumber.isBigNumber(r0) ||
		!BigNumber.isBigNumber(r1) ||
		!BigNumber.isBigNumber(tA)
	) {
		return { amount: 0, err: true };
	}

	let a0 = tokenIndex == 0 ? tA : 0;
	let a1 = tokenIndex == 1 ? tA : 0;

	let b = r0 + a0 + r1 + a1;
	let c = r0 * a1 + a1 * a0 - r1 * a0;
	let root = Math.sqrt(b ** 2 - 4 * c);
	let a = (b + root) / 2;

	if (isValidTradeEq(r0, r1, a0, a1, a, false)) {
		return {
			amount: a,
			err: false,
		};
	}
	a = (b - root) / 2;

	if (isValidTradeEq(r0, r1, a0, a1, a, false)) {
		return {
			amount: a,
			err: false,
		};
	}
	return {
		amount: 0,
		err: true,
	};
}

export function getAmountCToBuyTokens(r0, r1, a0, a1) {
	let b = r0 + r1 - (a0 + a1);
	let c = a0 * a1 - r0 * a1 - r1 * a0;

	let root = b ** 2 - 4 * c;
	console.log(root, "kk");
	if (root < 0) {
		return { amount: 0, err: true };
	}
	root = Math.sqrt(root);

	let a = (-1 * b + root) / 2;
	console.log(a + 1, false);
	if (isValidTradeEq(r0, r1, a0, a1, a, true)) {
		return { amount: a + 1, err: false };
	}

	a = (-1 * b - root) / 2;
	console.log(a + 1, false);
	if (isValidTradeEq(r0, r1, a0, a1, a, true)) {
		return { amount: a + 1, err: false };
	}

	return 0, true;
}

export function getAvgPriceOfOutcomeToken(tokenAmountOut, AmountCIn) {
	return AmountCIn / tokenAmountOut;
}

export function getAvgPriceOfAmountC(tokenAmountIn, AmountCOut) {
	return AmountCOut / tokenAmountIn;
}

export function convertDecimalStrToInt(value, base = 10 ** 18) {
	return parseFloat(value) * base;
}

export function convertIntToDecimalStr(value, base = 10 ** 18) {
	return `${value / 10 ** 18}`;
}
