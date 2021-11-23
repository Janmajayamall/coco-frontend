import axios from "axios";
import { signMessage } from ".";
import { generateRequestSignatures } from "./auth";
const baseInstance = axios.create({
	baseURL: "http://localhost:5000",
	timeout: 1000,
	headers: { "Content-Type": "application/json" },
});

export async function getAccountNonce(coldAddress) {
	try {
		const { data } = await baseInstance.request({
			url: "/user/accountNonce",
			method: "POST",
			data: {
				coldAddress,
			},
		});
		return data.response;
	} catch (e) {}
}

export async function getUser() {
	const msg = {
		value: "profile",
	};
	const signatures = generateRequestSignatures(msg);

	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/user/profile",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});
		return data.response;
	} catch (e) {}
}

export async function loginUser(keySignature, hotAddress, accountNonce) {
	try {
		const { data } = await baseInstance.request({
			url: "/user/login",
			method: "POST",
			data: {
				hotAddress,
				accountNonce,
				keySignature,
			},
		});
		console.log(data);
		return data.response;
	} catch (e) {}
}

export async function newPost(oracleAddress, eventIdentifierStr) {
	const msg = {
		oracleAddress,
		eventIdentifierStr,
	};
	const signatures = generateRequestSignatures(msg);

	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/post/new",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});
		console.log(data);
		return data.response;
	} catch (e) {}
}

export async function findPosts(filter) {
	try {
		const { data } = await baseInstance.request({
			url: "/post/find",
			method: "POST",
			data: {
				filter,
			},
		});
		console.log(data);
		return data.response;
	} catch (e) {}
}

export async function findPostsByMarketIdentifierArr(identifiers) {
	const filter = {
		marketIdentifier: {
			$in: identifiers,
		},
	};
	try {
		const { data } = await baseInstance.request({
			url: "/post/find",
			method: "POST",
			data: {
				filter,
			},
		});
		return data.response;
	} catch (e) {}
}

export async function updateModerator(oracleAddress, details) {
	const msg = {
		oracleAddress,
		details,
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/moderator/update",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});

		return data.response;
	} catch (e) {
		// console.log(e, ",aldmakom");
	}
}

export async function uploadImage() {
	return "adwadiuahwo";
}

export async function findModerators(filter) {
	try {
		const { data } = await baseInstance.request({
			url: "/moderator/find",
			method: "POST",
			data: {
				filter,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function findModeratorsByIdArr(ids) {
	const filter = {
		oracleAddress: {
			$in: ids,
		},
	};

	try {
		const { data } = await baseInstance.request({
			url: "/moderator/find",
			method: "POST",
			data: {
				filter,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function findPopularModerators(ignoreList) {
	try {
		const { data } = await baseInstance.request({
			url: "/moderator/popular",
			method: "POST",
			data: {
				ignoreList,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function findModeratorsDetails(moderatorIds) {
	try {
		const { data } = await baseInstance.request({
			url: "/moderator/findDetails",
			method: "POST",
			data: {
				moderatorIds,
			},
		});

		return data.response;
	} catch (e) {
		// console.log(e, ",aldmakom");
	}
}

export async function followModerator(moderatorAddress) {
	const msg = {
		moderatorAddress,
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/follow/add",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});

		return data.response;
	} catch (e) {
		// console.log(e, ",aldmakom");
	}
}

export async function unfollowModerator(moderatorAddress) {
	const msg = {
		moderatorAddress,
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/follow/remove",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});

		return data.response;
	} catch (e) {
		// console.log(e, ",aldmakom");
	}
}

export async function findAllFollows() {
	const msg = {
		msg: "follows",
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/follow/all",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});

		return data.response;
	} catch (e) {
		// console.log(e, ",aldmakom");
	}
}

// export async function getFeed() {
// 	const msg = {
// 		txHash,
// 		imageUrl,
// 		categoryId,
// 	};
// 	const signatures = generateRequestSignatures(msg);

// 	if (!signatures) {
// 		return;
// 	}

// 	try {
// 		const { data } = await baseInstance.request({
// 			url: "/post/new",
// 			method: "POST",
// 			data: {
// 				signatures,
// 				msg,
// 			},
// 		});
// 		console.log(data);
// 		return data.response;
// 	} catch (e) {}
// }

/**
 * To be removed
 */
export async function newPostTrial(oracleAddress, eventIdentifierStr) {
	const msg = {
		oracleAddress,
		eventIdentifierStr,
	};
	const signatures = generateRequestSignatures(msg);

	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/post/newPostTrial",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});
		console.log(data);
		return data.response;
	} catch (e) {}
}
