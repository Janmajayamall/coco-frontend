import axios from "axios";

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
    
	try {
		const { data } = await baseInstance.request({
			url: "/user/profile",
			method: "POST",
			data: {
				signatures: {
                    keySignature:"",
                    
                },
			},
		});
	}
}
