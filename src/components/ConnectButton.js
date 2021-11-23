import { Button, Box, Text, Flex } from "@chakra-ui/react";
import {
	useEthers,
	useEtherBalance,
	useTokenBalance,
	useContractFunction,
} from "@usedapp/core/packages/core";
import { formatEther } from "@ethersproject/units";
import { utils } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import {
	selectUserProfile,
	sUpdateLoginModalIsOpen,
} from "./../redux/reducers";
// const fakeUSDInterface = new utils.Interface(abi);
// const fakeUSDContract = new Contract(fakeUSDContractAddress, fakeUSDInterface);

function ConnectButton() {
	const userProfile = useSelector(selectUserProfile);
	const dispatch = useDispatch();

	const { account } = useEthers();
	return (
		<Flex m={2}>
			<Box
				display="flex"
				alignItems="center"
				background="gray.700"
				borderRadius="xl"
				py="0"
			>
				<Button
					onClick={() => {
						if (userProfile && account) {
							return;
						}
						dispatch(sUpdateLoginModalIsOpen(true));
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
					<Text
						color="white"
						fontSize="md"
						fontWeight="medium"
						mr="2"
					>
						{userProfile && account
							? `${account.slice(0, 6)}...${account.slice(
									account.length - 4,
									account.length
							  )}`
							: "Sign In"}
					</Text>
				</Button>
			</Box>
		</Flex>
	);
}

export default ConnectButton;
