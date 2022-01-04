import { BigNumber, ethers, utils } from "ethers";
import { useState } from "react";
import { useEffect } from "react";
import { parse } from "graphql";
import { ZERO_BN, TWO_BN } from "./constants";
import { useTab } from "@chakra-ui/tabs";
import { CURR_SYMBOL } from ".";

export function populateMarketWithMetadata(
	market,
	oraclesInfo,
	marketsMetadata,
	groupsFollowed,
	latestBlockNumber
) {
	let _market = {
		...market,

		outcomeReserve0: parseDecimalToBN(market.outcomeReserve0),
		outcomeReserve1: parseDecimalToBN(market.outcomeReserve1),
		probability0: Number(market.probability0),
		probability1: Number(market.probability1),
		stakingReserve0: parseDecimalToBN(market.stakingReserve0),
		stakingReserve1: parseDecimalToBN(market.stakingReserve1),

		feeNumerator: Number(market.feeNumerator),
		feeDenominator: Number(market.feeDenominator),
		fee: Number(market.fee),
		expireAtBlock: Number(market.expireAtBlock),
		donBufferEndsAtBlock: Number(market.donBufferEndsAtBlock),
		resolutionEndsAtBlock: Number(market.resolutionEndsAtBlock),
		donBufferBlocks: Number(market.donBufferBlocks),
		resolutionBufferBlocks: Number(market.resolutionBufferBlocks),
		donEscalationCount: Number(market.donEscalationCount),
		donEscalationLimit: Number(market.donEscalationLimit),
		outcome: Number(market.outcome),
		stage: Number(market.stage),

		lastAmountStaked: parseDecimalToBN(market.lastAmountStaked),
		lastOutcomeStaked: Number(market.lastOutcomeStaked),

		tradeVolume: parseDecimalToBN(market.tradeVolume),
		stakeVolume: parseDecimalToBN(market.stakeVolume),
		totalVolume: parseDecimalToBN(market.totalVolume),

		oracleInfo: oraclesInfo[market.oracle.id],
		marketMetadata: marketsMetadata[market.marketIdentifier],
		following: groupsFollowed[market.oracle.id] ? true : false,
	};

	let optimisticState = determineOptimisticMarketState(
		_market,
		latestBlockNumber
	);

	return {
		..._market,
		optimisticState,
		probability0:
			optimisticState.stage !== 4 || _market.stage === 4
				? _market.probability0
				: optimisticState.outcome === 2
				? 0.5
				: optimisticState.outcome === 0
				? 1
				: 0,
		probability1:
			optimisticState.stage !== 4 || _market.stage === 4
				? _market.probability1
				: optimisticState.outcome === 2
				? 0.5
				: optimisticState.outcome === 1
				? 1
				: 0,
	};
}

export function roundDecimalStr(value, dp = 3) {
	let _value = value;
	try {
		if (typeof _value == "string") {
			_value = Number(_value);
		}
	} catch (e) {
		return 0;
	}

	return _value.toFixed(dp);
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

export function sliceAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(
		address.length - 4,
		address.length
	)}`;
}

export function parseDecimalToBN(val, base = 18) {
	return ethers.utils.parseUnits(val, base);
}

export function formatBNToDecimal(val, base = 18, round = true, dp = 3) {
	val = ethers.utils.formatUnits(val, base);
	if (round === true) {
		val = roundDecimalStr(val, dp);
	}
	return val;
}

export function formatBNToDecimalCurr(val, base = 18, dp = 3) {
	return `${formatBNToDecimal(val, base, true, dp)} ${CURR_SYMBOL}`;
}

export function formatDecimalToCurr(value, dp = 3) {
	return `${roundDecimalStr(value, dp)} ${CURR_SYMBOL}`;
}

export function formatDecimalToPercentage(value, dp = 3) {
	let roundedValue = roundDecimalStr(value, dp);
	return `${roundedValue * 100}%`;
}

export function getDecStrAvgPriceBN(amountIn, amountOut) {
	if (!BigNumber.isBigNumber(amountIn) || !BigNumber.isBigNumber(amountOut)) {
		return "0.00";
	}
	if (amountIn.isZero() || amountOut.isZero()) {
		return "0.00";
	}
	let val = amountIn.mul(BigNumber.from("1000")).div(amountOut).toString();

	if (val.length == 3) {
		return "0." + val;
	}
	if (val.length == 2) {
		return "0.0" + val;
	}
	if (val.length == 1) {
		return "0.00" + val;
	}
	if (val.length == 0) {
		return "0.000";
	}

	return val.slice(0, val.length - 3) + "." + val.slice(val.length - 3);
}

export function useBNInput(validationFn) {
	const [input, setInput] = useState("0");
	const [bnValue, setBnValue] = useState(BigNumber.from("0"));
	const [err, setErr] = useState(false);
	const [errText, setErrText] = useState("");

	useEffect(() => {
		try {
			let bn = parseDecimalToBN(
				`${input == "" || input == "." ? "0" : input}`
			);

			setBnValue(bn);
			if (validationFn != undefined) {
				let { valid, expStr } = validationFn(bn);
				if (!valid) {
					throw Error(expStr);
				}
			}
			setErr(false);
			setErrText("");
		} catch (e) {
			setErr(true);
			setErrText(e.message);
		}
	}, [input]);

	return {
		input,
		bnValue,
		setInput,
		err,
		errText,
	};
}

export function determineTradeWinAmount(tradePosition, finalOutcome) {
	if (tradePosition == undefined || finalOutcome == undefined) {
		return ZERO_BN;
	}
	if (finalOutcome === 0) {
		return tradePosition.amount0;
	} else if (finalOutcome == 1) {
		return tradePosition.amount1;
	} else if (finalOutcome == 2) {
		return tradePosition.amount0
			.div(TWO_BN)
			.add(tradePosition.amount1.div(TWO_BN));
	}

	return ZERO_BN;
}

export function determineOptimisticMarketState(market, blockNumber) {
	let stage = 0;
	let blocksLeft = 0;
	let outcome = 2;

	// market stage = closed
	if (market.stage == 4) {
		stage = 4;
		blocksLeft = 0;
		outcome = market.outcome;
	}

	// resolution period expired, thus market expires
	if (market.stage == 3 && blockNumber >= market.resolutionEndsAtBlock) {
		stage = 4;
		blocksLeft = 0;
		outcome = determineOutcomeInExpiry(market);
	}

	// in market resolve stage
	if (market.stage == 3 && blockNumber < market.resolutionEndsAtBlock) {
		stage = 3;
		blocksLeft = market.resolutionEndsAtBlock - blockNumber;
	}

	// buffer period expired before reaching escalation limit, thus market closes
	if (
		blockNumber >= market.donBufferEndsAtBlock &&
		market.donEscalationLimit > market.donEscalationCount
	) {
		stage = 4;
		blocksLeft = 0;
		outcome = determineOutcomeInExpiry(market);
	}

	// in buffer period, when buffer period is > 0 and escalation limit > 0
	if (
		blockNumber >= market.expireAtBlock &&
		blockNumber < market.donBufferEndsAtBlock &&
		market.donEscalationLimit > 0 &&
		market.donEscalationLimit > market.donEscalationCount
	) {
		stage = 2;
		blocksLeft = market.donBufferEndsAtBlock - blockNumber;
	}

	// market expired and escalation limit == 0, thus market is in resolve stage
	if (
		blockNumber >= market.expireAtBlock &&
		market.donEscalationLimit === 0 &&
		blockNumber < market.resolutionEndsAtBlock
	) {
		stage = 3;
		blocksLeft = market.resolutionEndsAtBlock - blockNumber;
	}

	// market expired and escalation limit == 0 and resolution period expired, thus market closes
	if (
		blockNumber >= market.expireAtBlock &&
		market.donEscalationLimit === 0 &&
		blockNumber >= market.resolutionEndsAtBlock
	) {
		stage = 4;
		blocksLeft = 0;
		outcome = determineOutcomeInExpiry(market);
	}

	// market expired and donBufferBufferBlocks == 0, thus market closes
	if (blockNumber >= market.expireAtBlock && market.donBufferBlocks == 0) {
		stage = 4;
		blocksLeft = 0;
		outcome = determineOutcomeInExpiry(market);
	}

	if (blockNumber < market.expireAtBlock && market.stage == 1) {
		// active trading period
		stage = 1;
		blocksLeft = market.expireAtBlock - blockNumber;
	}

	// market hasn't been funded
	if (market.stage == 0) {
		stage = 0;
		blocksLeft = 0;
	}

	return {
		stage,
		blocksLeft,
		outcome,
	};
}

/**
 * Assumes that it's only called when market closed by expiry
 */
export function determineOutcomeInExpiry(market) {
	if (!market.lastAmountStaked.isZero()) {
		return market.lastOutcomeStaked;
	} else {
		if (market.outcomeReserve0.gt(market.outcomeReserve1)) {
			return 1;
		} else if (market.outcomeReserve1.gt(market.outcomeReserve0)) {
			return 0;
		}
		return 2;
	}
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
	let sec = parseInt(seconds, 10);

	let days = Math.floor(sec / 86400);
	if (days > 0) {
		let hours = Math.floor((sec - days * 86400) / 3600);
		return `${days}d ${hours}h`;
	}

	let hours = Math.floor(sec / 3600);
	if (hours > 0) {
		let minutes = Math.floor((sec - hours * 3600) / 60);
		return `${hours}h ${minutes}m`;
	}

	let minutes = Math.floor(sec / 60);
	if (minutes > 0) {
		sec = Math.floor(sec - minutes * 60);
		return `${minutes}m ${sec}s`;
	}

	return `${sec}s`;
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

export function determineTotalAmountStakeRedeem(
	market,
	stakePosition,
	account
) {
	let stakeWinnings = determineStakeWinnings(market, account);
	let finalOutcome = market.optimisticState.outcome;
	let stake;
	if (finalOutcome == 0) {
		stake = stakePosition ? stakePosition.amount0 : ZERO_BN;
	} else if (finalOutcome == 1) {
		stake = stakePosition ? stakePosition.amount1 : ZERO_BN;
	} else if (finalOutcome == 2) {
		stake = stakePosition ? stakePosition.amount0 : ZERO_BN;
		stake.add(stakePosition ? stakePosition.amount1 : ZERO_BN);
	}
	return stake.add(stakeWinnings);
}

export function determineStakeWinnings(market, account) {
	if (market == undefined || account == undefined) {
		return ZERO_BN;
	}
	if (
		market.optimisticState.outcome != 2 &&
		account.toLowerCase() ==
			(market.optimisticState.outcome === 0
				? market.staker0
				: market.staker1)
	) {
		return market.optimisticState.outcome === 0
			? market.stakingReserve1
			: market.stakingReserve0;
	}
	return ZERO_BN;
}

export function findTokenIdBalanceInTokenArr(tokenObjArr, tokenId) {
	if (!tokenObjArr || !Array.isArray(tokenObjArr) || !tokenId) {
		return ZERO_BN;
	}

	let tokenObj = tokenObjArr.find((obj) => obj.tokenId == tokenId);
	if (!tokenObj) {
		return ZERO_BN;
	}
	return parseDecimalToBN(tokenObj.balance);
}

export function calculateResolveFee(market, setOutcomeTo) {
	if (market == undefined || setOutcomeTo > 1) {
		return ZERO_BN;
	}

	let fee = ZERO_BN;
	if (setOutcomeTo === 0) {
		fee = market.stakingReserve1
			.mul(BigNumber.from(market.feeNumerator))
			.div(BigNumber.from(market.feeDenominator));
	} else {
		fee = market.stakingReserve0
			.mul(BigNumber.from(market.feeNumerator))
			.div(BigNumber.from(market.feeDenominator));
	}
	return fee;
}

export function filterMarketsByStage(markets, stage) {
	return markets.filter((market) => market.optimisticState.stage === stage);
}

export function filterMarketsByClaim(markets, tokenBalancesObj) {
	let res = [];
	markets.forEach((market) => {
		if (market.optimisticState.stage === 4) {
			let outcome = market.optimisticState.outcome;
			let oAmount0 = tokenBalancesObj[market.oToken0Id]
				? tokenBalancesObj[market.oToken0Id].balance
				: ZERO_BN;
			let oAmount1 = tokenBalancesObj[market.oToken1Id]
				? tokenBalancesObj[market.oToken1Id].balance
				: ZERO_BN;
			let sAmount0 = tokenBalancesObj[market.sToken0Id]
				? tokenBalancesObj[market.sToken0Id].balance
				: ZERO_BN;
			let sAmount1 = tokenBalancesObj[market.sToken1Id]
				? tokenBalancesObj[market.sToken1Id].balance
				: ZERO_BN;

			if (outcome == 0 && (!oAmount0.isZero() || !sAmount0.isZero())) {
				res.push(market);
			} else if (
				outcome == 1 &&
				(!oAmount1.isZero() || !sAmount1.isZero())
			) {
				res.push(market);
			} else if (
				outcome == 2 &&
				(!oAmount1.isZero() ||
					!sAmount1.isZero() ||
					!oAmount0.isZero() ||
					!sAmount0.isZero())
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

export function toBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
}

export function generateProfileInitials(name) {
	if (typeof name !== "string" || name.length === 0) {
		return "";
	}

	let initials = name[0];
	for (let i = 1; i < name.length; i++) {
		let char = name[i];
		if (char.toUpperCase() === char) {
			initials += ` ${char}`;
		}
	}
	return initials;
}

export function minAmountAfterSlippageBn(bnAmount, slippagePercentage) {
	if (
		!BigNumber.isBigNumber(bnAmount) ||
		slippagePercentage <= 0 ||
		slippagePercentage >= 100
	) {
		return bnAmount;
	}

	let remainingValuePer = BigNumber.from(
		(1 - Number(slippagePercentage / 100)) * 10000
	);
	let minValueBn = bnAmount
		.mul(remainingValuePer)
		.div(BigNumber.from("10000"));
	return minValueBn;
}
