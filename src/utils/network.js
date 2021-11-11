import Web3 from "web3";
import OracleAbi from "./../contracts/abis/Oracle.json";
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");

export function convertDaysToBlocks(chainId, hours) {
	if (chainId == 421611) {
		return Math.ceil((3600 * hours) / 15);
	}
	return 0;
}

export function retrieveOracleAddressFormLogs(logs) {
	const oracleAddress = logs[0].topics[1];
	return web3.utils.toChecksumAddress(`0x${oracleAddress.slice(26)}`);
}

export function toCheckSumAddress(address) {
	try {
		return web3.utils.toChecksumAddress(address);
	} catch (e) {
		return undefined;
	}
}

export async function getOracleDetails(address) {
	try {
		const oracleContract = new web3.eth.Contract(OracleAbi, address);
		const params = await oracleContract.methods.getMarketParams().call();
		const delegate = await oracleContract.methods.getDelegate().call();

		return {
			tokenC: params[0],
			isActive: params[1],
			feeNumerator: params[2],
			feeDenominator: params[3],
			donEscalationLimit: params[4],
			expireBufferBlocks: params[5],
			donBufferBlocks: params[6],
			resolutionBufferBlocks: params[7],
			delegate,
		};
	} catch (e) {
		return undefined;
	}
}
