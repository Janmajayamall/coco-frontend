import { Button, Box, Text, Flex } from "@chakra-ui/react";
import {
	useEthers,
	useEtherBalance,
	useTokenBalance,
	useContractFunction,
} from "@usedapp/core/packages/core";
import { formatEther } from "@ethersproject/units";
import { utils } from "ethers";

// const fakeUSDInterface = new utils.Interface(abi);
// const fakeUSDContract = new Contract(fakeUSDContractAddress, fakeUSDInterface);

function ConnectButton() {
	const { activateBrowserWallet, account, chainId } = useEthers();

	// const { state, send } = useContractFunction(fakeUSDContract, "mint", {
	// 	transactionName: "Wrap",
	// });

	// const etherBalance = useEtherBalance(account);
	// const fakeUSDBalance = useTokenBalance(fakeUSDContractAddress, account);
	return account ? (
		<Flex m={2}>
			<Box
				display="flex"
				alignItems="center"
				background="gray.700"
				borderRadius="xl"
				py="0"
			>
				{/* <Box px="3">
					<Text fontWeight="semibold" color="white" fontSize="md">
						{chainId === 5
							? "Georli Test Network (L1) Acc."
							: "Connect to Georli Test Network"}
					</Text>
				</Box> */}
				{/* <Box px="3">
					<Text color="white" fontSize="md">
						{fakeUSDBalance && formatAmount(fakeUSDBalance)} USD
					</Text>
				</Box> */}
				<Button
					// onClick={handleOpenModal}
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
					<Text
						color="white"
						fontSize="md"
						fontWeight="medium"
						mr="2"
					>
						{account &&
							`${account.slice(0, 6)}...${account.slice(
								account.length - 4,
								account.length
							)}`}
					</Text>
				</Button>
			</Box>
		</Flex>
	) : (
		<Button
			m={2}
			onClick={() => {
				activateBrowserWallet();
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
			Connect your wallet
		</Button>
	);
}

export default ConnectButton;
