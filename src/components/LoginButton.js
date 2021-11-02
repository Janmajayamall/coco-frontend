import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { formatEther } from "@ethersproject/units";
import { utils } from "ethers";
import { createHotAccount } from "./../utils";

function LoginButton() {
	const { account } = useEthers();

	return account ? (
		<Button
			onClick={() => {
				const { privateKey, address } = createHotAccount();

				// sign address & nonce with cold wallet (i.e. using Metamask)

				// send login request {address, nonce, signature}

				// store signature, hot private key in local storage
			}}
			bg="blue.800"
			color="blue.300"
			fontSize="lg"
			fontWeight="medium"
			borderRadius="xl"
			border="1px solid transparent"
			_hover={{
				borderColor: "blue.700",
				color: "blue.400",
			}}
			_active={{
				backgroundColor: "blue.800",
				borderColor: "blue.700",
			}}
		>
			Login
		</Button>
	) : (
		<Button
			bg="blue.800"
			color="blue.300"
			fontSize="lg"
			fontWeight="medium"
			borderRadius="xl"
			border="1px solid transparent"
			_hover={{
				borderColor: "blue.700",
				color: "blue.400",
			}}
			_active={{
				backgroundColor: "blue.800",
				borderColor: "blue.700",
			}}
		>
			Connect
		</Button>
	);
}

export default ConnectButton;
