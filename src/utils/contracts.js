import { addresses } from "./../contracts";
import { utils, Contract } from "ethers";
import MarkerRouterAbi from "../contracts/abis/MarketRouter.json";
import OracleProxyFactoryAbi from "../contracts/abis/OracleProxyFactory.json";
import OracleAbi from "../contracts/abis/Oracle.json";
import WETHAbi from "../contracts/abis/WETH.json";
import GnosisSafeAbi from "../contracts/GnosisSafe.json";

export const oracleProxyFactoryInterface = new utils.Interface(
	OracleProxyFactoryAbi
);
export const wEthInterface = new utils.Interface(WETHAbi);
export const oracleInterface = new utils.Interface(OracleAbi);
export const gnosisSafeInterface = new utils.Interface(GnosisSafeAbi);

export const marketRouterContract = new Contract(
	addresses.MarketRouter,
	new utils.Interface(MarkerRouterAbi)
);
export const oracleProxyFactoryContract = new Contract(
	addresses.OracleProxyFactory,
	oracleProxyFactoryInterface
);

export const wEthContract = new Contract(
	addresses.WETH,
	new utils.Interface(WETHAbi)
);
export const oracleContract = (address) =>
	new Contract(address, new utils.Interface(OracleAbi));

export function encodeFunctionCalldata(
	contractInterface,
	functionName,
	dataArr
) {
	return contractInterface.encodeFunctionData(functionName, dataArr);
}
