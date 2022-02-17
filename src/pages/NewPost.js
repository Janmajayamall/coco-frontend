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
	COLORS,
	validatePostTitle,
	validateLinkURL,
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
	const [postType, setPostType] = useState(0);
	const [imageFile, setImageFile] = useState(null);

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

	async function postHelper() {
		try {
			// throw error if user isn't authenticated
			if (!isAuthenticated) {
				toast({
					title: "Please Sign In!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// start new post loading
			setNewPostLoading(true);

			// Checks:
			// valid group is selected
			// user profile exists
			// postType is either 0 or 1
			// post title is valid
			if (
				selectGroup == undefined ||
				selectGroup == "" ||
				userProfile == undefined ||
				postType > 1 ||
				postType < 0 ||
				validatePostTitle(title).valid == false
			) {
				// set select group error
				if (selectGroup == undefined || selectGroup == "") {
					setSelectErr(true);
				}
				toast({
					title: "Invalid Input!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// If postType == 0 then upload image file.
			// If image file is null image file will not
			// be uploaded. The next check takes care of throwing
			// error.
			let s3Url = "";
			if (postType == 0 && imageFile != undefined) {
				const { presignedUrl } = await getPresignedUrl();
				s3Url = await uploadImageFile(presignedUrl, imageFile);
			}

			// Checks
			// if postType == 0, then s3Ur exists OR
			// if postType == 1, then link is valid
			if (
				(postType == 0 && (s3Url == undefined || s3Url == "")) ||
				(postType == 1 && validateLinkURL(link).valid == false)
			) {
				toast({
					title: "Invalid Input!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// checks that token approval is given
			if (wETHTokenAllowance == false) {
				toast({
					title:
						"Please give WETH approval to app before proceeding!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// checks that sufficient balance if present
			if (CREATION_AMOUNT.add(ONE_BN).gt(wEthTokenBalance)) {
				toast({
					title:
						"min. of 0.05 WETH required! Refer to rules on the side",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// create post body
			let groupAddress = selectGroup;
			let bodyObject = {
				creatorColdAddress: userProfile.coldAddress,
				groupAddress: groupAddress,
				postType,
				link,
				imageUrl: s3Url,
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
				toast({
					title: "Something went wrong!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}
		} catch (e) {
			setNewPostLoading(false);
		}
	}

	return (
		<Flex width={"100%"}>
			<Flex width={"70%"} padding={5} flexDirection={"column"}>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					justifyContent="flex-start"
					marginBottom={4}
				>
					<Heading size="md">Create post</Heading>
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
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					flexDirection={"column"}
				>
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
					<Flex>
						<Flex padding={5}>
							<Text
								onClick={() => {
									setPostType(0);
								}}
								fontSize={14}
								fontWeight={"bold"}
								_hover={{
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								Image
							</Text>
						</Flex>
						<Flex padding={5}>
							<Text
								fontSize={14}
								fontWeight={"bold"}
								onClick={() => {
									setPostType(1);
								}}
								_hover={{
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								Link
							</Text>
						</Flex>
					</Flex>
					{InputWithTitle(
						"Title",
						0,
						title,
						title,
						setTitle,
						validatePostTitle,
						{}
					)}

					{postType == 0 ? (
						<Flex
							flexDirection="column"
							justifyContent="center"
							alignItems="center"
							padding={5}
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
											<Text
												fontSize={14}
												fontWeight={"bold"}
												_hover={{
													cursor: "pointer",
													textDecoration: "underline",
												}}
											>
												Select an Image
											</Text>
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
								<Text
									onClick={() => {
										setImageFile(null);
									}}
									fontSize={14}
									fontWeight={"bold"}
									_hover={{
										cursor: "pointer",
										textDecoration: "underline",
									}}
									marginTop={2}
								>
									Remove
								</Text>
							) : undefined}
						</Flex>
					) : undefined}
					{postType == 1 ? (
						<>
							{InputWithTitle(
								"Link URL",
								0,
								link,
								link,
								setLink,
								validateLinkURL,
								{}
							)}
						</>
					) : undefined}
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
			</Flex>
			<Flex width="30%" padding={5} flexDirection={"column"}>
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
				>
					<Text>Ready to post?</Text>
					<Text>Put in some rules</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Page;
