import {} from "./auth";
import { BigNumber, ethers, utils } from "ethers";
import { useState } from "react";
import { useEffect } from "react";
export const ZERO_BN = BigNumber.from("0");
export const ONE_BN = BigNumber.from("1");
export const TWO_BN = BigNumber.from("2");
export const FOUR_BN = BigNumber.from("4");
export const ZERO_DECIMAL_STR = "0";

/**
 * Filters oracle ids from market schema returns by Graph index
 * @note Oracle ids are oracle addresses, thus the value returned
 * is checksummed
 */
export function filterOracleIdsFromMarketsGraph(markets) {
	const oracleIds = [];
	markets.forEach((market) => {
		if (market.oracle && market.oracle.id) {
			oracleIds.push(market.oracle.id);
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
	groupsFollowed,
	latestBlockNumber
) {
	const { stage, blocksLeft } = determineMarketState(
		getMarketStateDetails(market),
		latestBlockNumber
	);

	return {
		...market,
		oracleInfo: oraclesInfo[market.oracle.id],
		imageUrl: marketsMetadata[market.marketIdentifier]
			? marketsMetadata[market.marketIdentifier].eventIdentifierStr
			: undefined,
		follow: groupsFollowed[market.oracle.id] ? market.oracle.id : false,
		stateMetadata: {
			stage,
			blocksLeft,
		},
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

export function parseDecimalToBN(val, base = 18) {
	return ethers.utils.parseUnits(val, base);
}

export function formatBNToDecimal(val, base = 18, dp = 2) {
	val = ethers.utils.formatUnits(val, base);
	return parseFloat(val).toFixed(2);
}

export function convertBigNumberToDecimalStr(value, base = 18) {}

export function isValidTradeEq(r0, r1, a0, a1, a, isBuy) {
	if (typeof isBuy !== "boolean") {
		return false;
	}

	if (
		!BigNumber.isBigNumber(r0) ||
		!BigNumber.isBigNumber(r1) ||
		!BigNumber.isBigNumber(a) ||
		!BigNumber.isBigNumber(a0) ||
		!BigNumber.isBigNumber(a1)
	) {
		return false;
	}

	if (
		isBuy &&
		r0.add(a).sub(a0).gte(ZERO_BN) &&
		r1.add(a).sub(a1).gte(ZERO_BN)
	) {
		return true;
	} else if (
		!isBuy &&
		r0.add(a0).sub(a).gte(ZERO_BN) &&
		r1.add(a1).sub(a).gte(ZERO_BN)
	) {
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
	if (tokenIndex === 0) {
		tokenAmount = r0.add(a).sub(r0.mul(r1).div(r1.add(a)));
	} else {
		tokenAmount = r1.add(a).sub(r0.mul(r1).div(r0.add(a)));
	}
	tokenAmount = tokenAmount.sub(ONE_BN);

	return {
		amount: tokenAmount,
		err: false,
	};
}

/**
 * @ref https://github.com/Uniswap/sdk-core/blob/76b41d349ef7f9e0555383b1b11f95872e91e975/src/utils/sqrt.ts#L14
 */
export function sqrtBn(value) {
	if (!BigNumber.isBigNumber(value) || value.lte(ZERO_BN)) {
		return 0;
	}

	if (value.lte(BigNumber.from(Number.MAX_SAFE_INTEGER - 1))) {
		return BigNumber.from(Math.sqrt(Number(value.toString())));
	}

	let z;
	let x;
	z = value;
	x = value.div(TWO_BN).add(ONE_BN);
	while (x.lt(z)) {
		z = x;
		x = value.div(x).add(x).div(TWO_BN);
	}
	return z;
}

export function getAmountCBySellTokenAmount(r0, r1, tA, tokenIndex) {
	if (tokenIndex > 1 || tokenIndex < 0) {
		return { amount: ZERO_BN, err: true };
	}

	if (
		!BigNumber.isBigNumber(r0) ||
		!BigNumber.isBigNumber(r1) ||
		!BigNumber.isBigNumber(tA)
	) {
		return { amount: ZERO_BN, err: true };
	}

	let a0 = tokenIndex == 0 ? tA : ZERO_BN;
	let a1 = tokenIndex == 1 ? tA : ZERO_BN;

	let b = r0.add(a0).add(r1).add(a1);
	let c = r0.mul(a1).add(a1.mul(a0)).add(r1.mul(a0));
	let root = sqrtBn(b.pow(TWO_BN).sub(c.mul(FOUR_BN)));

	let a = b.add(root).div(TWO_BN);
	if (isValidTradeEq(r0, r1, a0, a1, a, false)) {
		return {
			amount: a.sub(ONE_BN),
			err: false,
		};
	}

	a = b.sub(root).div(TWO_BN);
	if (isValidTradeEq(r0, r1, a0, a1, a, false)) {
		return {
			amount: a.sub(ONE_BN),
			err: false,
		};
	}
	return {
		amount: ZERO_BN,
		err: true,
	};
}

export function getAmountCToBuyTokens(r0, r1, a0, a1) {
	let b = r0 + r1 - (a0 + a1);
	let c = a0 * a1 - r0 * a1 - r1 * a0;

	let root = b ** 2 - 4 * c;

	if (root < 0) {
		return { amount: 0, err: true };
	}
	root = Math.sqrt(root);

	let a = (-1 * b + root) / 2;

	if (isValidTradeEq(r0, r1, a0, a1, a, true)) {
		return { amount: a + 1, err: false };
	}

	a = (-1 * b - root) / 2;

	if (isValidTradeEq(r0, r1, a0, a1, a, true)) {
		return { amount: a + 1, err: false };
	}

	return 0, true;
}

export function getMarketStateDetails(market) {
	return {
		expireAtBlock: Number(market.expireAtBlock),
		donBufferEndsAtBlock: Number(market.donBufferEndsAtBlock),
		resolutionEndsAtBlock: Number(market.resolutionEndsAtBlock),
		donBufferBlocks: Number(market.donBufferBlocks),
		resolutionBufferBlocks: Number(market.resolutionBufferBlocks),
		donEscalationCount: Number(market.donEscalationCount),
		donEscalationLimit: Number(market.donEscalationLimit),
		outcome: Number(market.outcome),
		stage: Number(market.stage),
	};
}

export function getAvgPrice(amountIn, amountOut) {
	if (!BigNumber.isBigNumber(amountIn) || !BigNumber.isBigNumber(amountOut)) {
		return "0.00";
	}
	if (amountIn.isZero() || amountOut.isZero()) {
		return "0.00";
	}
	let val = amountIn.mul(BigNumber.from("1000")).div(amountOut).toString();
	if (val.length <= 3) {
		return "0." + val;
	}
	return val.slice(0, val.length - 3) + "." + val.slice(val.length - 3);
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

export function useBNInput() {
	const [input, setInput] = useState("0");
	const [bnValue, setBnValue] = useState(BigNumber.from("0"));
	const [err, setErr] = useState(false);

	useEffect(() => {
		try {
			let bn = parseDecimalToBN(`${input == "" ? "0" : input}`);
			setBnValue(bn);
			setErr(false);
		} catch (e) {
			// TODO set invalid input error
			setErr(true);
		}
	}, [input]);

	return {
		input,
		bnValue,
		setInput,
		err,
	};
}

export function getTradeWinAmount(tradePosition, finalOutcome) {
	if (tradePosition == undefined || finalOutcome == undefined) {
		return "0";
	}
	if (finalOutcome == 0) {
		return roundValueTwoDP(tradePosition.amount0);
	} else if (finalOutcome == 1) {
		return roundValueTwoDP(tradePosition.amount1);
	} else if (finalOutcome == 2) {
		return formatBNToDecimal(
			parseDecimalToBN(tradePosition.amount0)
				.div(TWO_BN)
				.add(parseDecimalToBN(tradePosition.amount1).div(TWO_BN))
		);
	}

	return 0;
}

export function getTradeWinningsArr(tradePosition, finalOutcome) {
	if (!tradePosition || !finalOutcome) {
		return [];
	}

	let amountT;
	let outcome;

	if (finalOutcome == 0) {
		amountT = parseDecimalToBN(tradePosition.amount0);
		outcome = 0;
	} else if (finalOutcome == 1) {
		amountT = parseDecimalToBN(tradePosition.amount1);
		outcome = 1;
	} else if (finalOutcome == 2) {
		let amountT0 = parseDecimalToBN(tradePosition.amount0);
		let amountT1 = parseDecimalToBN(tradePosition.amount1);
		return [
			{
				outcome: 0,
				amountT: amountT0,
				amountC: amountT0.div(TWO_BN),
			},
			{
				outcome: 1,
				amountT: amountT1,
				amountC: amountT1.div(TWO_BN),
			},
		];
	}

	if (amountT.isZero()) {
		return [];
	}

	return [
		{
			outcome,
			amountT,
			amountC: amountT,
		},
	];
}

export function getStakeWinArr(stakePosition, finalOutcome) {
	if (!stakePosition || !finalOutcome) {
		return [];
	}
	let stake0 = parseDecimalToBN(stakePosition.amount0);
	let stake1 = parseDecimalToBN(stakePosition.amount1);
	let arr = [];
	if (finalOutcome == 0) {
		arr.push({
			outcome: 0,
			amountS: stake0,
			amountSR: stake0,
		});
	} else if (finalOutcome == 1) {
		arr.push({ outcome: 1, amountS: stake1, amountSR: stake1 });
	} else if (finalOutcome == 2) {
		arr.push({
			outcome: 0,
			amountS: stake0,
			amountSR: stake0.div(TWO_BN),
		});
		arr.push({
			outcome: 1,
			amountS: stake1,
			amountSR: stake1.div(TWO_BN),
		});
	}
	return arr;
}

/**
 * Assumes that it's called at optimistic stage == 4 only
 */
export function determineOutcome(market) {
	let stateDetails = getMarketStateDetails(market);

	if (stateDetails.stage == 4) {
		return Number(market.outcome);
	}

	if (!parseDecimalToBN(market.lastAmountStaked).isZero()) {
		return Number(market.lastOutcomeStaked);
	} else {
		return determineFavoredOutcome(market);
	}

	// // resolution period expired & moderator was supposed to resolve, thus market resolves to last outcome staked
	// // OR
	// // buffer period expired, thus market resolves to last staked outcome.
	// if (
	// 	(blockNumber >= stateDetails.resolutionEndsAtBlock &&
	// 		stateDetails.stage == 3) ||
	// 	blockNumber >= stateDetails.donBufferEndsAtBlock
	// ) {
	// 	// if last amount staked > 0, then resolve to last outcome staked. Otherwise resolve to favored outcome.
	// 	if (!parseDecimalToBN(market.lastAmountStaked).isZero()) {
	// 		return Number(market.lastOutcomeStaked);
	// 	} else {
	// 		return determineFavoredOutcome(market);
	// 	}
	// }
}

export function determineFavoredOutcome(market) {
	if (Number(market.outcomeReserve0) < Number(market.outcomeReserve1)) {
		return 0;
	} else if (
		Number(market.outcomeReserve0) > Number(market.outcomeReserve1)
	) {
		return 1;
	}
	return 2;
}

// export function

export function determineMarketState(stateDetails, blockNumber) {
	let stage = 0;
	let blocksLeft = 0;

	// market stage = closed
	if (stateDetails.stage == 4) {
		stage = 4;
		blocksLeft = 0;
	}

	// resolution period expired, thus market expires
	if (
		stateDetails.stage == 3 &&
		blockNumber >= stateDetails.resolutionEndsAtBlock
	) {
		stage = 4;
		blocksLeft = 0;
	}

	// Escalation limit reached, in market resolve
	if (
		stateDetails.stage == 3 &&
		blockNumber < stateDetails.resolutionEndsAtBlock
	) {
		stage = 3;
		blocksLeft = stateDetails.resolutionEndsAtBlock - blockNumber;
	}

	// buffer period expired before reaching escalation limit, thus market closes
	if (
		blockNumber >= stateDetails.donBufferEndsAtBlock &&
		stateDetails.donEscalationLimit > stateDetails.donEscalationCount
	) {
		stage = 4;
		blocksLeft = 0;
	}

	// in buffer period, when buffer period is > 0 and escalation limit > 0
	if (
		blockNumber >= stateDetails.expireAtBlock &&
		blockNumber < stateDetails.donBufferEndsAtBlock &&
		stateDetails.donEscalationLimit > 0 &&
		stateDetails.donEscalationLimit > stateDetails.donEscalationCount
	) {
		stage = 2;
		blocksLeft = stateDetails.donBufferEndsAtBlock - blockNumber;
	}

	// active trading period
	if (blockNumber < stateDetails.expireAtBlock && stateDetails.stage == 1) {
		stage = 1;
		blocksLeft = stateDetails.expireAtBlock - blockNumber;
	}

	// market hasn't been funded
	if (stateDetails.stage == 0) {
		stage = 0;
		blocksLeft = 0;
	}

	return {
		stage,
		blocksLeft,
	};
}

export function getMarketStageName(stage) {
	if (stage == 0) {
		return "CREATED";
	}
	if (stage == 1) {
		return "ACTIVE_TRADING";
	}
	if (stage == 2) {
		return "IN_BUFFER";
	}
	if (stage == 3) {
		return "WAITING_FOR_RESOLUTION";
	}
	if (stage == 4) {
		return "RESOLVED";
	}
	return "LOADING";
}

export function convertBlocksToSeconds(blocks) {
	return blocks * 15;
}

export function formatTimeInSeconds(seconds) {
	return `${seconds} seconds`;
}

export function getTempOutcomeInChallengePeriod(market) {
	if (parseDecimalToBN(market.lastAmountStaked).isZero()) {
		if (Number(market.outcomeReserve0) < Number(market.outcomeReserve1)) {
			return 0;
		} else if (
			Number(market.outcomeReserve0) > Number(market.outcomeReserve1)
		) {
			return 1;
		}
		return 2;
	}
	return Number(market.lastOutcomeStaked);
}

export function outcomeDisplayName(outcome) {
	if (outcome == 0) {
		return "NO";
	}
	if (outcome == 1) {
		return "YES";
	}
	return "UNDECIDED";
}

export function marketStageDisplayName(stage) {
	if (stage == 1) {
		return "TRADING PERIOD";
	} else if (stage == 2) {
		return "CHALLENGE PERIOD";
	} else if (stage == 3) {
		return "RESOLVE";
	} else if (stage == 4) {
		return "FINALIZED";
	}
	return "";
}

export function totalAmountReceivedInStakeRedeem(
	market,
	finalOutcome,
	stakePosition,
	account
) {
	let stakeWinnings = parseDecimalToBN(
		determineStakeWinnings(market, finalOutcome, account)
	);

	let stake;
	if (finalOutcome == 0) {
		stake = parseDecimalToBN(stakePosition ? stakePosition.amount0 : "0");
	} else if (finalOutcome == 1) {
		stake = parseDecimalToBN(stakePosition ? stakePosition.amount1 : "0");
	} else if (finalOutcome == 2) {
		stake = parseDecimalToBN(stakePosition ? stakePosition.amount0 : "0");
		stake.add(
			parseDecimalToBN(stakePosition ? stakePosition.amount1 : "0")
		);
	}

	return stake.add(stakeWinnings);
}

export function determineStakeWinnings(market, finalOutcome, account) {
	if (
		market == undefined ||
		finalOutcome == undefined ||
		account == undefined
	) {
		return "0";
	}
	if (
		finalOutcome != 2 &&
		account.toLowerCase() ==
			(finalOutcome == 0 ? market.staker0 : market.staker1)
	) {
		return finalOutcome == 0
			? market.stakingReserve1
			: market.stakingReserve0;
	}
	return "0";
	// 	) ? (
	// 	<Text>
	// 		{`${
	// 			finalOutcome == 0
	// 				? market.stakingReserve0
	// 				: market.stakingReserve1
	// 		} from loser's stake`}
	// 	</Text>
	// ) : undefined;
}

export function tokenIdBalance(tokenObjArr, tokenId) {
	if (!tokenObjArr || !Array.isArray(tokenObjArr) || !tokenId) {
		return ZERO_DECIMAL_STR;
	}

	let tokenObj = tokenObjArr.find((obj) => obj.tokenId == tokenId);
	if (!tokenObj) {
		return ZERO_DECIMAL_STR;
	}
	return tokenObj.balance;
}

export function calculateResolveFee(market, outcome) {
	if (market == undefined || outcome == undefined || outcome > 1) {
		return ZERO_DECIMAL_STR;
	}

	let fee = ZERO_BN;
	const feeRatio = parseDecimalToBN(market.feeNumerator).div(
		market.feeDenominator
	);
	if (outcome == 0) {
		fee = parseDecimalToBN(market.stakingReserve1).mul(feeRatio);
	} else {
		fee = parseDecimalToBN(market.stakingReserve0).mul(feeRatio);
	}
	return formatBNToDecimal(fee);
}

export function filterMarketsByStage(markets, stage) {
	return markets.filter((market) => market.stateMetadata.stage == stage);
}

export function filterMarketsByClaim(markets, tokenBalancesObj) {
	let res = [];
	markets.forEach((market) => {
		if (market.stateMetadata.stage == 4) {
			let outcome = determineOutcome(market);
			let oAmount0 = tokenBalancesObj[market.oToken0Id]
				? tokenBalancesObj[market.oToken0Id].balance
				: ZERO_DECIMAL_STR;
			let oAmount1 = tokenBalancesObj[market.oToken1Id]
				? tokenBalancesObj[market.oToken1Id].balance
				: ZERO_DECIMAL_STR;
			let sAmount0 = tokenBalancesObj[market.sToken0Id]
				? tokenBalancesObj[market.sToken0Id].balance
				: ZERO_DECIMAL_STR;
			let sAmount1 = tokenBalancesObj[market.sToken1Id]
				? tokenBalancesObj[market.sToken1Id].balance
				: ZERO_DECIMAL_STR;
			if (
				outcome == 0 &&
				(!parseDecimalToBN(oAmount0).isZero() ||
					!parseDecimalToBN(sAmount0))
			) {
				res.push(market);
			}
			if (
				outcome == 1 &&
				(!parseDecimalToBN(oAmount1).isZero() ||
					!parseDecimalToBN(sAmount1))
			) {
				res.push(market);
			}
			if (
				outcome == 2 &&
				(!parseDecimalToBN(oAmount1).isZero() ||
					!parseDecimalToBN(sAmount1) ||
					!parseDecimalToBN(oAmount0).isZero() ||
					!parseDecimalToBN(sAmount0))
			) {
				res.push(market);
			}
		}
	});
	return res;
}

export function filterMarketsByCreator(markets, account) {
	if (!account) {
		return [];
	}
	return markets.filter((market) => market.creator == account.toLowerCase());
}
