import Web3 from "web3";

const web3 = new Web3();

export function createHotAccount() {
	const acc = web3.eth.accounts.create();
	return acc;
}

export function signMessage(pk, msg) {
	const signature = web3.eth.accounts.sign(msg, pk);
	return signature;
}

export function generateRequestSignatures() {
	const hotPvKey = "";
}
