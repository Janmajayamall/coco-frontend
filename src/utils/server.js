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

export async function newPost(txHash, imageUrl) {
	const msg = {
		txHash,
		imageUrl,
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

export async function updateModerator(address, details) {
	const msg = {
		address,
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
	return "ada";
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
