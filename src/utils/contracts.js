import addresses from "./../contracts/addresses.json";
import { utils, Contract } from "ethers";
import MarkerRouterAbi from "../contracts/abis/MarketRouter.json";
import OracleFactoryAbi from "../contracts/abis/OracleFactory.json";
import OracleAbi from "../contracts/abis/Oracle.json";
import MemeTokenAbi from "../contracts/abis/MemeToken.json";
import TokenDistributorAbi from "../contracts/abis/TokenDistributor.json";

export const oracleFactoryInterface = new utils.Interface(OracleFactoryAbi);
export const memeTokenInterface = new utils.Interface(MemeTokenAbi);
export const tokenDistributorInterface = new utils.Interface(
	TokenDistributorAbi
);
export const oracleInterface = new utils.Interface(OracleAbi);

export const marketRouterContract = new Contract(
	addresses.MarketRouter,
	new utils.Interface(MarkerRouterAbi)
);
export const oracleFactoryContract = new Contract(
	addresses.OracleFactory,
	oracleFactoryInterface
);
export const tokenDistributorContract = new Contract(
	addresses.TokenDistributor,
	new utils.Interface(TokenDistributorAbi)
);
export const memeTokenContract = new Contract(
	addresses.MemeToken,
	new utils.Interface(MemeTokenAbi)
);
export const oracleContract = (address) =>
	new Contract(address, new utils.Interface(OracleAbi));
