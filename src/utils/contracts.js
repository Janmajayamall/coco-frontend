import { addresses } from "./../contracts";
import { utils, Contract } from "ethers";
import GroupRouterAbi from "../contracts/abis/GroupRouter.json";
import OracleFactoryAbi from "../contracts/abis/OracleFactory.json";
import GroupAbi from "../contracts/abis/Group.json";
import ERC20Abi from "../contracts/abis/ERC20.json";

export const oracleFactoryInterface = new utils.Interface(OracleFactoryAbi);
export const erc20Interface = new utils.Interface(ERC20Abi);
export const groupInterface = new utils.Interface(GroupAbi);

export const groupRouterContract = new Contract(
	addresses.GroupRouter,
	new utils.Interface(GroupRouterAbi)
);
export const oracleFactoryContract = new Contract(
	addresses.OracleFactory,
	oracleFactoryInterface
);

export const erc20Contract = (erc20Address) =>
	new Contract(erc20Address, erc20Interface);
export const groupContract = (address) => new Contract(address, groupInterface);
