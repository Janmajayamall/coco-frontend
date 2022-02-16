import SafeServiceClient from "@gnosis.pm/safe-service-client";
import { ethers } from "ethers";
import Safe, { SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Web3Adapter from "@gnosis.pm/safe-web3-lib";
import Web3 from "web3";

const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");

const transactionServiceUrl = "http://18.159.101.163:8000/txs";
export const safeService = new SafeServiceClient(transactionServiceUrl);

export function createUpdateGlobalConfigTx(
	isActive,
	fee,
	donBuffer,
	resolutionBuffer
) {
	const intf = new ethers.utils.Interface([
		"function updateGlobalConfig(bool isActive, uint64 fee, uint64 donBuffer, uint64 resolutionBuffer)",
	]);

	return intf.encodeFunctionData("updateGlobalConfig", [
		isActive,
		fee,
		donBuffer,
		resolutionBuffer,
	]);
}

export async function createSafeTx(
	toAddress,
	calldata,
	value,
	safeAddress,
	account
) {
	const web3Provider = new ethers.providers.JsonRpcProvider(
		"https://arb-rinkeby.g.alchemy.com/v2/Mk6VvurgNanO_UUi008rNJcZfbjn8R9O"
	);
	const provider = new ethers.providers.Web3Provider(web3Provider);
	const safeOwner = provider.getSigner(account);

	const ethAdapter = new EthersAdapter({
		ethers,
		signer: safeOwner,
	});
	const safeSdk = await Safe.create({
		ethAdapter: ethAdapter,
		safeAddress: safeAddress,
	});
	const tx = await safeSdk.createTransaction({
		to: toAddress,
		data: calldata,
		value: value,
	});
	return tx;
}
