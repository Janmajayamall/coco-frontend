import { useEffect, useState } from "react";
import {
	Select,
	Image,
	useToast,
	Flex,
	Spacer,
	Heading,
	Text,
	Box,
	Input,
} from "@chakra-ui/react";
import FileUpload from "./../components/FileUpload";
import {
	keccak256,
	newPost,
	getPresignedUrl,
	validateCreationAmount,
	useBNInput,
	CURR_SYMBOL,
	uploadImageFile,
	GRAPH_BUFFER_MS,
	findGroups,
	CREATION_AMOUNT,
	postSignTypedDataV4Helper,
	getMarketIdentifierOfPost,
	TWO_BN,
	ONE_BN,
} from "./../utils";
import {
	useCreateNewMarket,
	useERC20TokenAllowanceWrapper,
	useERC20TokenBalance,
} from "./../hooks";
import { ChainStateProvider, useEthers } from "@usedapp/core/packages/core";
import { BigNumber, utils } from "ethers";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile, sUpdateLoginModalIsOpen } from "../redux/reducers";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import ApprovalInterface from "../components/ApprovalInterface";
import { addresses } from "../contracts";

function Page() {
	const { account, chainId } = useEthers();
	const userProfile = useSelector(selectUserProfile);

	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const wEthTokenBalance = useERC20TokenBalance(account, addresses.WETH);
	const wETHTokenAllowance = useERC20TokenAllowanceWrapper(
		addresses.WETH,
		account,
		addresses.GroupRouter,
		CREATION_AMOUNT.add(ONE_BN)
	);

	console.log(wETHTokenAllowance, " token allowance");

	const [title, setTitle] = useState("");
	const [link, setLink] = useState("");
	const [postType, setPostType] = useState("");
	const [imageFile, setImageFile] = useState(null);
	const [s3ImageUrl, setS3ImageUrl] = useState(null);

	const [selectGroup, setSelectGroup] = useState(null);

	const [groups, setGroups] = useState([]);
	const [newPostLoading, setNewPostLoading] = useState(false);
	const [selectErr, setSelectErr] = useState(false);
	const [imageErr, setImageErr] = useState(false);

	useEffect(async () => {
		let res = await findGroups({});
		if (res == undefined) {
			// TODO throw error
			return;
		}
		setGroups(res.groups);
	}, []);

	function validateFile(file) {
		const fsMb = file.size / (1024 * 1024);
		const MAX_FILE_SIZE = 10;
		if (fsMb > MAX_FILE_SIZE) {
			return false;
		}

		return true;
	}

	// function validateInputs() {
	// 	if (selectGroup == undefined || selectGroup == "") {
	// 		setSelectErr(true);
	// 		return false;
	// 	}
	// 	if (imageFile == undefined) {
	// 		setImageErr(true);
	// 		return false;
	// 	}

	// 	if (
	// 		!validateCreationAmount(creationAmountBn, wEthTokenBalance).valid ||
	// 		wEthTokenBalance == undefined
	// 	) {
	// 		return false;
	// 	}

	// 	return true;
	// }

	async function uploadImageHelper() {
		// if (!isAuthenticated || !tokenApproval) {
		// 	return;
		// }

		// start new post loading
		setNewPostLoading(true);

		// validate inputs
		// if (!validateInputs()) {
		// 	setNewPostLoading(false);
		// 	return;
		// }

		const { presignedUrl } = await getPresignedUrl();
		const s3Url = await uploadImageFile(presignedUrl, imageFile);

		if (s3Url == undefined) {
			setNewPostLoading(false);
		}

		setS3ImageUrl(s3Url);
	}

	async function postHelper() {
		// TODO validity checks

		// make sure token approval is given

		// make sure sufficient balance if present

		// create post body
		let groupAddress = selectGroup;
		let bodyObject = {
			creatorColdAddress: userProfile.coldAddress,
			groupAddress: groupAddress,
			postType,
			link,
			imageUrl: s3ImageUrl,
			title,
			timestamp: new Date().getTime().toString(),
		};
		let marketIdentifier = getMarketIdentifierOfPost(bodyObject);

		// signature for on-chain market
		const { marketData, dataToSign } = postSignTypedDataV4Helper(
			groupAddress,
			marketIdentifier,
			CREATION_AMOUNT.toString(),
			421611
		);
		const accounts = await window.ethereum.enable();
		const marketSignature = await window.ethereum.request({
			method: "eth_signTypedData_v3",
			params: [accounts[0], dataToSign],
		});
		console.log(dataToSign);
		console.log(marketSignature);
		// console.log(marketSignature, " Post helper data to sign ");
		// console.log(
		// 	selectGroup,
		// 	marketIdentifier,
		// 	JSON.stringify(bodyObject),
		// 	marketSignature,
		// 	JSON.stringify(marketData),
		// 	chainId
		// );

		let res = await newPost(
			selectGroup,
			marketIdentifier,
			JSON.stringify(bodyObject),
			marketSignature,
			JSON.stringify(marketData)
		);
		if (res == undefined) {
			// TODO throw error
			return;
		}
	}

	return (
		<Flex flexDirection="column">
			<Flex padding={10} justifyContent="flex-start">
				<Heading size="lg">Create post</Heading>
			</Flex>
			{/* {false ? (
				<Flex justifyContent="center">
					<PrimaryButton
						title="Please Sign In"
						onClick={() => {
							dispatch(sUpdateLoginModalIsOpen(true));
						}}
					/>
				</Flex>
			) : undefined} */}
			<Flex flexDirection={"row"}>
				<Spacer />
				<Flex width={"50%"} flexDirection={"column"}>
					<Flex width="100%" flexDirection="column">
						<Select
							onChange={(e) => {
								setSelectErr(false);
								setSelectGroup(e.target.value);
							}}
							placeholder="Choose Group"
						>
							{groups.map((obj) => {
								return (
									<>
										<option value={obj.groupAddress}>
											{`${obj.name}`}
										</option>
									</>
								);
							})}
						</Select>
						{selectErr === true ? (
							<Text
								style={{
									fontSize: 12,
									color: "#EB5757",
								}}
							>
								Please select a group
							</Text>
						) : undefined}
					</Flex>
					<Flex>
						<Flex padding={5} borderColor="blackAlpha.100">
							<Text
								onClick={() => {
									setPostType(0);
								}}
							>
								Image
							</Text>
						</Flex>
						<Flex padding={5} borderColor="blackAlpha.100">
							<Text
								onClick={() => {
									setPostType(1);
								}}
							>
								Link
							</Text>
						</Flex>
					</Flex>
					<Input
						placeholder="Title"
						value={title}
						onChange={(e) => {
							setTitle(e.target.value);
						}}
					/>
					{postType == 0 ? (
						<Flex
							flexDirection="column"
							justifyContent="center"
							alignItems="center"
						>
							{imageFile == null ? (
								<Flex>
									<FileUpload
										accept={"image/*"}
										onFileUpload={(file) => {
											if (!validateFile(file)) {
												//TODO throw mmax file size error
												return;
											}
											setImageErr(false);
											setImageFile(file);
										}}
									>
										<Flex flexDirection="column">
											<PrimaryButton
												title={"Choose Image"}
											/>
											{imageErr === true ? (
												<Text
													style={{
														fontSize: 12,
														color: "#EB5757",
													}}
												>
													Please select an image
												</Text>
											) : undefined}
										</Flex>
									</FileUpload>
								</Flex>
							) : undefined}
							{imageFile != null ? (
								<Image
									src={URL.createObjectURL(imageFile)}
									maxWidth="90%"
									maxHeight={500}
								/>
							) : undefined}
							{imageFile != null ? (
								<PrimaryButton
									onClick={() => {
										setImageFile(null);
									}}
									style={{
										marginTop: 20,
									}}
									title={"Remove"}
								/>
							) : undefined}
						</Flex>
					) : undefined}
					{postType == 1 ? (
						<Input
							placeholder="Link"
							value={link}
							onChange={(e) => {
								setLink(e.target.value);
							}}
						/>
					) : undefined}
					<Flex width={"30%"}>
						<PrimaryButton
							title={"Post"}
							isLoading={newPostLoading}
							loadingText="Processing..."
							onClick={postHelper}
							style={{
								marginTop: 20,
								flexDirection: "row",
							}}

							// disabled={!tokenApproval || !isAuthenticated}
						/>
						<ApprovalInterface
							marginTop={5}
							tokenType={0}
							erc20Address={addresses.WETH}
							erc20AmountBn={CREATION_AMOUNT.add(ONE_BN)}
							onSuccess={() => {
								toast({
									title: "Success!",
									status: "success",
									isClosable: true,
								});
							}}
							onFail={() => {
								toast({
									title: "Metamask err!",
									status: "error",
									isClosable: true,
								});
							}}
						/>
					</Flex>
					<Spacer />
				</Flex>
				<Spacer />
				<Flex>
					<Flex
						marginTop="1"
						marginBottom="1"
						flexDirection="column"
						padding={5}
						backgroundColor="gray.100"
					>
						<Text>Ready to post?</Text>
						<Text>Put in some rules</Text>
					</Flex>
				</Flex>
				<Spacer />
			</Flex>
		</Flex>
	);
}

export default Page;
