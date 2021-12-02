import { useDisclosure } from "@chakra-ui/hooks";
import { useDispatch, useSelector } from "react-redux";
import {
	selectLoginModalState,
	sUpdateLoginModalIsOpen,
} from "../redux/reducers";
import {
	Button,
	Flex,
	Spacer,
	Heading,
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import { createHotAccount, getAccountNonce, loginUser } from "../utils";
import { useNavigate } from "react-router";

function LoginModal() {
	const navigate = useNavigate();

	const dispatch = useDispatch();

	const isOpen = useSelector(selectLoginModalState).isOpen;
	const { activateBrowserWallet, account, chainId } = useEthers();

	const [stage, setStage] = useState(0);

	async function login() {
		if (!account || !window.ethereum) {
			return;
		}

		let res = await getAccountNonce(account.toLowerCase());
		if (!res) {
			return;
		}
		let accountNonce = Math.ceil(Number(res.accountNonce) + 1);
		console.log(accountNonce, "dwa");
		const { privateKey, address } = createHotAccount();

		const signature = await window.ethereum.request({
			method: "personal_sign",
			params: [
				account,
				`Sign your hot wallet with address ${address} and nonce ${accountNonce} to login Mimi`,
			],
		});

		// login user
		res = await loginUser(signature, address, accountNonce);
		if (!res) {
			return;
		}

		// store creds locally
		localStorage.setItem("hotPvKey", privateKey);
		localStorage.setItem("keySignature", signature);

		// close modal
		dispatch(sUpdateLoginModalIsOpen(false));

		navigate("/explore");
	}

	useEffect(async () => {
		if (account && window.ethereum) {
			setStage(1);
		}
	}, [account]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				dispatch(sUpdateLoginModalIsOpen(false));
			}}
		>
			<ModalOverlay />
			<ModalContent paddingLeft={5} paddingRight={5} paddingTop={3}>
				<Flex
					paddingLeft={2}
					paddingRight={2}
					paddingTop={2}
					alignItems="center"
					borderBottomWidth={1}
					borderColor="#E0E0E0"
				>
					<Heading size="xl">Sign In</Heading>
					<Spacer />
					<CloseIcon marginRight={2} w={3} h={3} color="#0B0B0B" />
				</Flex>
				{stage == 1 ? (
					<Button onClick={login}>Please sign message</Button>
				) : (
					<Button onClick={activateBrowserWallet}>
						Connect your wallet
					</Button>
				)}
				<ModalBody>{/* <Lorem count={2} /> */}</ModalBody>
			</ModalContent>
		</Modal>
	);
}

export default LoginModal;
