import Web3 from "web3";

const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");

export function convertHoursToBlocks(chainId, hours) {
	if (chainId == 421611) {
		return Math.ceil((3600 * hours) / 15);
	}
	return 0;
}

export function convertBlocksToHours(chainId, blocks) {
	if (chainId == 421611) {
		return (blocks * 15) / 3600;
	}
	return 0;
}

export function retrieveOracleAddressFormLogs(logs) {
	const oracleAddress = logs[2].topics[1];
	return `0x${oracleAddress.slice(26)}`.toLowerCase();
}
export async function getOracleDetails(address) {
	// try {
	// 	const oracleContract = new web3.eth.Contract(OracleAbi, address);
	// 	const params = await oracleContract.methods.getMarketParams().call();
	// 	const delegate = await oracleContract.methods.getDelegate().call();

	// 	return {
	// 		tokenC: params[0],
	// 		isActive: params[1],
	// 		feeNumerator: params[2],
	// 		feeDenominator: params[3],
	// 		donEscalationLimit: params[4],
	// 		expireBufferBlocks: params[5],
	// 		donBufferBlocks: params[6],
	// 		resolutionBufferBlocks: params[7],
	// 		delegate,
	// 	};
	// } catch (e) {
	// 	return undefined;
	// }
	return;
}

export function getFunctionSignature(functionStr) {
	return web3.eth.abi.encodeFunctionSignature(functionStr);
}

export function isValidAddress(address) {
	return web3.utils.isAddress(address);
}
