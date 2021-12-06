import { MAX_LENGTH_DESCRIPTION, MAX_LENGTH_NAME } from ".";

export function validateIsNumber(val) {
	let value = Number(val);
	if (Number.isNaN(value)) {
		return {
			valid: false,
			expText: "Invalid value!",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateEscalationLimit(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend Escalation limit to be at least 1",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateExpireHours(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend Trading period to be at least 1",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateBufferHours(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend Challenge period to be at least 1",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateResolutionHours(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend Resolution period to be at least 1",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateFee(val) {
	let isNum = validateIsNumber(val);
	return isNum;
}

export function validateGroupName(val) {
	if (typeof val != "string") {
		return {
			valid: false,
			expText: "Invalid Input!",
		};
	}

	if (val.split(" ").length !== 1) {
		return {
			valid: false,
			expText: "Name cannot have spaces!",
		};
	}

	if (val.length > MAX_LENGTH_NAME) {
		return {
			valid: false,
			expText: `Char count should be smaller than ${MAX_LENGTH_NAME}`,
		};
	}

	return {
		valid: true,
		expTex: "",
	};
}

export function validateGroupDescription(val) {
	if (typeof val != "string") {
		return {
			valid: false,

			expText: "Invalid Input!",
		};
	}

	if (val.length > MAX_LENGTH_DESCRIPTION) {
		return {
			valid: false,
			expText: `Char count should be smaller than ${MAX_LENGTH_DESCRIPTION}`,
		};
	}

	return {
		valid: true,
		expText: "",
	};
}

export function validateUpdateMarketConfigTxInputs(
	fee,
	escalationLimit,
	expireHours,
	bufferHours,
	resolutionHours
) {
	if (
		validateFee(fee).valid &&
		validateEscalationLimit(escalationLimit).valid &&
		validateBufferHours(bufferHours).valid &&
		validateExpireHours(expireHours).valid &&
		validateResolutionHours(resolutionHours).valid
	) {
		return {
			valid: true,
			expText: "",
		};
	}
	return {
		valid: false,
		expText: "Invalid inputs!",
	};
}

export function validateFundingAmount(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}

	if (val < 1) {
		return {
			valid: false,
			expText:
				"We recommend initial liquidity to be at least 1 MEME. This helps attract more users to your post",
		};
	}

	return {
		valid: true,
		expText: "",
	};
}

export function validateInitialBetAmount(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}

	if (val < 1) {
		return {
			valid: false,
			expText:
				"We recommend initial YES bet amount to be at least 1 MEME. This shows others that you are confident that your post belongs to group's feed.",
		};
	}

	return {
		valid: true,
		expText: "",
	};
}
