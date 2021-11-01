import logo from "./logo.svg";
import "./App.css";
import ConnectButton from "./components/ConnectButton";
import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { utils } from "ethers";
import {
	useContractFunction,
	useEthers,
	TransactionState,
} from "@usedapp/core";
import { Contract } from "@ethersproject/contracts";
import MarkerRouterAbi from "./contracts/MarketRouter.json";
const marketRouterInterface = new utils.Interface(MarkerRouterAbi);
const marketRouterAddress = "0x8EfE5a96eaE05D72492d9A0296794adB0EF76d78";
const marketRouterContract = new Contract(
	marketRouterAddress,
	marketRouterInterface
);

function App() {
	const { account, chainId } = useEthers();
	const { state, send } = useContractFunction(
		marketRouterContract,
		"createAndPlaceBetOnMarket"
	);

	console.log(account);
	console.log(state, " stsate of createAndPlaceBetOnMa");
	return (
		<div>
			<ConnectButton />
			<div>{state.status}</div>
			<Button
				onClick={() => {
					try {
						send(
							account,
							"0x2d102ED735c39F2060D9057056eC68e1430744de",
							utils.keccak256(
								utils.toUtf8Bytes(`${"dad21ad1212ada"}:${"2"}`)
							),
							utils.parseEther("1"),
							utils.parseEther("1"),
							1
						);
					} catch (e) {
						console.log(e);
					}
				}}
				bg="gray.800"
				border="1px solid transparent"
				_hover={{
					border: "1px",
					borderStyle: "solid",
					borderColor: "blue.400",
					backgroundColor: "gray.700",
				}}
				borderRadius="xl"
				m="1px"
				px={3}
				height="38px"
			>
				<Text color="white" fontSize="md" fontWeight="medium" mr="2">
					Send
				</Text>
			</Button>
		</div>
	);
}

export default App;
