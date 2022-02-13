import { addresses } from "./../contracts";
import { utils, Contract } from "ethers";
import GroupRouterAbi from "../contracts/abis/GroupRouter.json";
import GroupProxyFactoryAbi from "../contracts/abis/OracleFactory.json"; // TODO change it GroupProxyFactoryAbi
import GroupAbi from "../contracts/abis/Group.json";
import ERC20Abi from "../contracts/abis/ERC20.json";

export const groupProxyFactoryInterface = new utils.Interface(
	GroupProxyFactoryAbi
);
export const erc20Interface = new utils.Interface(ERC20Abi);
export const groupInterface = new utils.Interface(GroupAbi);

export const groupProxyFactoryContract = new Contract(
	addresses.GroupProxyFactory,
	groupProxyFactoryInterface
);

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
