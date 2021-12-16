import { useDispatch, useSelector } from "react-redux";
import {
	selectLoginModalState,
	sUpdateLoginModalIsOpen,
} from "../redux/reducers";
import {
	Flex,
	Spacer,
	Heading,
	Modal,
	ModalOverlay,
	ModalContent,
	Image,
	Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import { createHotAccount, getAccountNonce, loginUser } from "../utils";
import { useNavigate } from "react-router";
import MetamaskFox from "./../metamask_fox.svg";

function LoginModal() {
	const dispatch = useDispatch();

	const isOpen = useSelector(selectLoginModalState).isOpen;
	const { activateBrowserWallet, account } = useEthers();

	const [stage, setStage] = useState(0);
	const [chainId, setChainId] = useState(null);

	async function login() {
		if (!account || !window.ethereum) {
			return;
		}

		let res = await getAccountNonce(account.toLowerCase());
		if (!res) {
			return;
		}
		let accountNonce = Math.ceil(Number(res.accountNonce) + 1);
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

		window.location.reload();
	}

	useEffect(async () => {
		if (account && window.ethereum) {
			setStage(1);
			if (isOpen) {
				login();
			}
		}
	}, [account, isOpen]);

	useEffect(async () => {
		if (window.ethereum) {
			const id = await window.ethereum.request({
				method: "eth_chainId",
			});
			setChainId(parseInt(id, 16));
		}
	}, []);

	useEffect(() => {
		if (window.ethereum) {
			window.ethereum.on("chainChanged", (id) => {
				setChainId(parseInt(id, 16));
			});
		}
	}, [window.ethereum]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				dispatch(sUpdateLoginModalIsOpen(false));
			}}
		>
			<ModalOverlay />
			<ModalContent
				paddingLeft={5}
				paddingRight={5}
				paddingTop={3}
				paddingBottom={8}
			>
				<Flex
					paddingLeft={2}
					paddingRight={2}
					paddingTop={2}
					paddingBottom={2}
					alignItems="center"
					borderBottomWidth={1}
					borderColor="#E0E0E0"
				>
					<Heading size="xl">Sign In</Heading>
					<Spacer />
					<CloseIcon
						onClick={() => {
							dispatch(sUpdateLoginModalIsOpen(false));
						}}
						marginRight={2}
						w={3}
						h={3}
						color="#0B0B0B"
					/>
				</Flex>

				<Flex
					style={{
						backgroundColor: "#F3F5F7",
						borderRadius: 8,
						marginTop: 20,
						paddingTop: 40,
						paddingBottom: 40,
						justifyContent: "center",
						alignItems: "center",
					}}
					flexDirection="column"
				>
					<Image width="30%" src={MetamaskFox} />
					<Heading size="xl">Metamask</Heading>
					{chainId === 421611 && stage == 1 ? (
						<>
							<Text
								style={{
									...styles.actionText,
								}}
								onClick={login}
								_hover={{
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								Sign login message
							</Text>
							<Text
								style={{
									...styles.actionText,
									fontSize: 16,
								}}
								onClick={login}
							>
								Sign message on Metamask wallet to login
							</Text>
						</>
					) : undefined}
					{chainId === 421611 && stage == 0 ? (
						<Text
							style={{
								...styles.actionText,
							}}
							onClick={async () => {
								activateBrowserWallet();
							}}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							Connect your wallet
						</Text>
					) : undefined}
					{chainId !== 421611 ? (
						<Text
							style={{
								...styles.actionText,
							}}
							onClick={async () => {
								if (window.ethereum) {
									await window.ethereum.request({
										method: "wallet_addEthereumChain",
										params: [
											{
												chainId: "0x66EEB",
												chainName: "Rinkeby-arbitrum",
												nativeCurrency: {
													name: "Ethereum",
													symbol: "ETH",
													decimals: 18,
												},
												rpcUrls: [
													"https://rinkeby.arbitrum.io/rpc",
												],
												blockExplorerUrls: [
													"https://testnet.arbiscan.io/",
												],
											},
										],
									});
								}
							}}
						>
							Switch to Rinkeby-Arbitrum
						</Text>
					) : undefined}
				</Flex>

				{chainId === -1 || true ? (
					<Flex
						justifyContent="center"
						paddingTop={5}
						alignItems="center"
					>
						<Text
							marginRight={1}
							color="#337DCF"
							fontSize={18}
							onClick={async () => {
								window.open(
									"https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
								);
							}}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							Get Metamask
						</Text>
						<ExternalLinkIcon
							marginLeft={1}
							height={18}
							color="#337DCF"
						/>
					</Flex>
				) : undefined}
			</ModalContent>
		</Modal>
	);
}

const styles = {
	actionText: {
		fontSize: 28,
		color: "#828282",
		marginTop: 10,
	},
};

export default LoginModal;
