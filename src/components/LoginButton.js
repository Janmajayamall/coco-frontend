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
import { selectUserProfile } from "./../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { sUpdateProfile } from "./../redux/reducers";

function LoginButton() {
	const { account } = useEthers();
	// const [userProfile, setUserProfile] = useState();
	const userProfile = useSelector(selectUserProfile);
	const dispatch = useDispatch();

	async function loginUserHelper() {
		const accounts = await window.ethereum.enable();
		if (accounts.length == 0) {
			return;
		}

		// account Nonce
		var res = await getAccountNonce(toCheckSumAddress(accounts[0]));
		if (!res) {
			//TODO show error & return
			return;
		}
		console.log(res);
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

		// login User
		res = await loginUser(signature, address, accountNonce);
		if (!res) {
			//TODO error
			return;
		}

		localStorage.setItem("hotPvKey", privateKey);
		localStorage.setItem("keySignature", signature);

		// set updated user profile
		dispatch(sUpdateProfile(res.user));
	}

	async function logoutUserHelper() {
		localStorage.removeItem("hotPvKey");
		localStorage.removeItem("keySignature");
		dispatch(sUpdateProfile(undefined));
	}


	if (!account) {
		return <div />;
	}

	return (
		<Button
			m={2}
			onClick={async () => {
				if (userProfile) {
					logoutUserHelper();
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
	);
}

export default LoginButton;
