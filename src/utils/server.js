import axios from "axios";

import { generateRequestSignatures } from "./auth";
import { getMarketIdentifierOfPost } from ".";

export const baseInstance = axios.create({
	baseURL: (() => {
		if (process.env.REACT_APP_VERCEL_ENV === "production") {
			return "https://cocoproduction.efprivacyscaling.org";
		} else if (process.env.REACT_APP_VERCEL_ENV === "preview") {
			return "https://cocostaging.efprivacyscaling.org";
		} else {
			return "http://65.108.59.231:8080";
		}
	})(),
	timeout: 10000,
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

		return data.response;
	} catch (e) {
		console.log(e);
	}
}

export async function newPost(
	groupAddress,
	marketIdentifier,
	body,
	marketSignature,
	marketData
) {
	const msg = {
		groupAddress,
		marketIdentifier,
		body,
		marketSignature,
		marketData,
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

		return data.response;
	} catch (e) {
		console.log(e);
	}
}

export async function findPosts(filter, sort) {
	try {
		const { data } = await baseInstance.request({
			url: "/post/find",
			method: "POST",
			data: {
				filter,
				sort,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function getExploreFeed() {
	try {
		const { data } = await baseInstance.request({
			url: "/post/exploreFeed",
			method: "POST",
			data: {},
		});

		return data.response;
	} catch (e) {
		console.log(e);
	}
}

export async function getHomeFeed() {
	const msg = {
		value: "upload",
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}
	try {
		const { data } = await baseInstance.request({
			url: "/post/homeFeed",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});
		return data.response;
	} catch (e) {
		console.log(e);
	}
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
				sort: {
					createdAt: -1,
				},
			},
		});
		return data.response;
	} catch (e) {
		console.log(e);
	}
}

export async function updateGroup(groupAddress, details) {
	const msg = {
		groupAddress,
		details,
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}

	try {
		const { data } = await baseInstance.request({
			url: "/group/update",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function getPresignedUrl() {
	const msg = {
		value: "upload",
	};
	const signatures = generateRequestSignatures(msg);
	if (!signatures) {
		return;
	}
	try {
		const { data } = await baseInstance.request({
			url: "/post/upload",
			method: "POST",
			data: {
				signatures,
				msg,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function uploadImageFile(presignedUrl, imageFile) {
	try {
		const { data } = await axios.request({
			url: presignedUrl,
			method: "PUT",
			headers: {
				"Content-type": "multipart/form-data",
			},
			data: imageFile,
		});
		return presignedUrl.split("?")[0];
	} catch (e) {}
}

export async function findGroups(filter) {
	try {
		const { data } = await baseInstance.request({
			url: "/group/find",
			method: "POST",
			data: {
				filter,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function findGroupsByIdArr(ids) {
	const filter = {
		groupAddress: {
			$in: ids,
		},
	};
	try {
		const { data } = await baseInstance.request({
			url: "/group/find",
			method: "POST",
			data: {
				filter,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function findPopularGroups(ignoreList) {
	try {
		const { data } = await baseInstance.request({
			url: "/group/popular",
			method: "POST",
			data: {
				ignoreList,
			},
		});

		return data.response;
	} catch (e) {}
}

export async function findAllGroups() {
	try {
		const { data } = await baseInstance.request({
			url: "/group/all",
			method: "POST",
			data: {},
		});

		return data.response;
	} catch (e) {}
}

export async function findGroupsDetails(groupIds) {
	try {
		const { data } = await baseInstance.request({
			url: "/group/findDetails",
			method: "POST",
			data: {
				groupIds,
			},
		});

		return data.response;
	} catch (e) {
		console.log(e);
	}
}

export async function followGroup(groupAddress) {
	const msg = {
		groupAddress,
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
	} catch (e) {}
}

export async function unfollowGroup(groupAddress) {
	const msg = {
		groupAddress,
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
	} catch (e) {}
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
	} catch (e) {}
}

export async function getRinkebyLatestBlockNumber() {
	try {
		const { data } = await baseInstance.request({
			url: "/latestBlockNumber",
			method: "GET",
		});

		return data.response;
	} catch (e) {}
}

export async function groupCheckNameUniqueness(name, groupAddress = undefined) {
	try {
		const { data } = await baseInstance.request({
			url: "/group/checkNameUniqueness",
			method: "POST",
			data: {
				name,
				groupAddress,
			},
		});

		return data.response;
	} catch (e) {}
}
