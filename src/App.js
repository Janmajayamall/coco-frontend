import "./App.css";
import ConnectButton from "./components/ConnectButton";
import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";
import { useCreateNewMarket } from "./hooks";
import { getAccountNonce } from "./utils";
function App() {
	const { account, chainId } = useEthers();
	const { state, send } = useCreateNewMarket();

	async function trial() {
		const res = await getAccountNonce("dsjiowjdaoidjao");
		console.log(res, " This is here btw");
	}

	trial();

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
								utils.toUtf8Bytes(`${"12ddwijijaio"}:${"2"}`)
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
