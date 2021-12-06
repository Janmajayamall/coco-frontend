import { BigNumber } from "ethers";
import { ZERO_BN, TWO_BN, FOUR_BN, ONE_BN } from "./constants";

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

	if (tokenAmount.lt(ZERO_BN)) {
		tokenAmount = ZERO_BN;
	}

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
			amount: a.lt(ZERO_BN) ? ZERO_BN : a.sub(ONE_BN),
			err: false,
		};
	}

	a = b.sub(root).div(TWO_BN);
	if (isValidTradeEq(r0, r1, a0, a1, a, false)) {
		return {
			amount: a.lt(ZERO_BN) ? ZERO_BN : a.sub(ONE_BN),
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
