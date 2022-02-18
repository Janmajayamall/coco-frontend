import SafeServiceClient from "@gnosis.pm/safe-service-client";
import { ethers } from "ethers";
import Safe from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import axios from "axios";

const transactionServiceUrl = "http://18.185.94.213/txs/";
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
	// check sum addresses
	safeAddress = ethers.utils.getAddress(safeAddress.toLowerCase());
	account = ethers.utils.getAddress(account.toLowerCase());
	toAddress = ethers.utils.getAddress(toAddress.toLowerCase());

	const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
	const safeOwner = web3Provider.getSigner(0);

	const ethAdapter = new EthersAdapter({
		ethers,
		signer: safeOwner,
	});
	const safeSdk = await Safe.create({
		ethAdapter: ethAdapter,
		safeAddress: safeAddress,
		contractNetworks: {
			421611: {
				multiSendAddress: "0x4e7814db1b8df375b2311c5321edcd5473e548bc",
			},
		},
	});

	// create the tx
	const tx = await safeSdk.createTransaction({
		to: toAddress,
		data: calldata,
		value: value,
	});

	// owner1 signs the tx
	await safeSdk.signTransaction(tx);

	// ge tx hash for proposing it
	const txHash = await safeSdk.getTransactionHash(tx);

	// get owner1's signature from tx
	const signature = tx.signatures.get(account.toLowerCase()).data;

	// make API req to transaction service for proposing the tx
	const res = await axios({
		url: `${transactionServiceUrl}api/v1/safes/${safeAddress}/multisig-transactions`,
		method: "POST",
		data: {
			...tx.data,
			contractTransactionHash: txHash,
			sender: account,
			signature,
		},
		headers: { "Content-Type": "application/json" },
	});
}
