import { Button, Box, Text, Flex, Spacer } from "@chakra-ui/react";
import {
	useEthers,
	useEtherBalance,
	useTokenBalance,
	useContractFunction,
} from "@usedapp/core/packages/core";
import { formatEther } from "@ethersproject/units";
import { utils } from "ethers";

function Component() {
	const { chainId } = useEthers();

	if (chainId != 421611) {
		return (
			<Flex bg="red.100">
				<Spacer />{" "}
				<Text fontSize="xl">Please connect to Arbitrum RPC</Text>
				<Spacer />
			</Flex>
		);
	} else {
		return <div />;
	}
}

export default Component;
