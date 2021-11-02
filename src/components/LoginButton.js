import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { formatEther } from "@ethersproject/units";
import { utils } from "ethers";
import {
	createHotAccount,
	getAccountNonce,
	loginUser,
	toCheckSumAddress,
	getUser,
} from "./../utils";
import { useEthers } from "@usedapp/core/packages/core";
import { useEffect, useState } from "react";

function LoginButton() {
	const { account } = useEthers();
	const [userProfile, setUserProfile] = useState();

	useEffect(async () => {
		const res = await getUser();
		setUserProfile(res);
	}, []);

	async function loginUserHelper() {
		const accounts = await window.ethereum.enable();
		if (accounts.length == 0) {
			return;
		}

		// account Nonce
		var res = await getAccountNonce(toCheckSumAddress(accounts[0]));
		if (!res) {
			// show error & return
			return;
		}
		const accountNonce = Math.ceil(Number(res.accountNonce) + 1);

		const { privateKey, address } = createHotAccount();
		const signature = await window.ethereum.request({
			method: "personal_sign",
			params: [
				accounts[0],
				JSON.stringify({
					hotAddress: address,
					accountNonce,
				}),
			],
		});

		res = await loginUser(signature, address, accountNonce);
		if (!res) {
			// error
			return;
		}

		localStorage.setItem("hotPvKey", privateKey);
		localStorage.setItem("keySignature", signature);
	}

	return account ? (
		<Button
			onClick={async () => {
				if (userProfile) {
				} else {
					await loginUserHelper();
				}
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
			{userProfile == undefined ? "Login" : "Logout"}
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
			Connect Wallet
		</Button>
	);
}

export default LoginButton;
