import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Image,
	useToast,
	Flex,
	Spacer,
	Heading,
	Text,
	Box,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "./../components/FileUpload";
import {
	uploadImage,
	keccak256,
	newPost,
	newPostTrial,
	findModerators,
	getPresignedUrl,
	uploadImageFileCloudinary,
	toBase64,
	validateInitialBetAmount,
	validateFundingAmount,
	MAX_UINT_256,
} from "./../utils";
import {
	useCreateNewMarket,
	useTokenAllowance,
	useTokenApprove,
} from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile, sUpdateLoginModalIsOpen } from "../redux/reducers";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import addresses from "../contracts/addresses.json";
function Page() {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const tokenAllowance = useTokenAllowance(account);

	const [imageFile, setImageFile] = useState(null);
	const [s3ImageUrl, setS3ImageUrl] = useState(null);
	const [selectModerator, setSelectModerator] = useState(null);
	const [fundingAmount, setFundingAmount] = useState(1);
	const [betAmount, setBetAmount] = useState(1);

	const [loading, setLoading] = useState(false);
	const [moderators, setModerators] = useState([]);
	const [newPostLoading, setNewPostLoading] = useState(false);
	const [approvalLoading, setApprovalLoading] = useState(false);

	const { state, send } = useCreateNewMarket();
	const {
		state: stateTokenApprove,
		send: sendTokenApprove,
	} = useTokenApprove();

	useEffect(async () => {
		let res = await findModerators({});
		setModerators(res.moderators);
	}, []);

	useEffect(async () => {
		if (state.status === "Success") {
			const res = await newPost(selectModerator, s3ImageUrl);

			setTimeout(() => {
				displayToast("Post created", "success");

				// end new post loading
				setNewPostLoading(false);

				navigate("/home");
			}, 5000);
		} else if (state.status == "Exception" || state.status == "Fail") {
			displayToast("Metamask error!", "error");
			setS3ImageUrl("");
			setNewPostLoading(false);
		}
	}, [state]);

	// handling token approve tx state
	useEffect(() => {
		if (stateTokenApprove.status === "Success") {
			setApprovalLoading(false);
			toast({
				title: "Success!",
				status: "success",
				isClosable: true,
			});
			window.location.reload();
		} else if (
			stateTokenApprove.status === "Exception" ||
			stateTokenApprove.status === "Fail"
		) {
			setApprovalLoading(false);
			toast({
				title: "Metamask Err!",
				status: "error",
				isClosable: true,
			});
		}
	}, [stateTokenApprove]);

	useEffect(() => {
		if (s3ImageUrl == undefined || s3ImageUrl == "") {
			return;
		}
		newPostTxHelper();
	}, [s3ImageUrl]);

	function displayToast(title, status) {
		toast({
			title: title,
			status: status,
			isClosable: true,
		});
	}

	function validateFile(file) {
		const fsMb = file.size / (1024 * 1024);
		const MAX_FILE_SIZE = 10;
		if (fsMb > MAX_FILE_SIZE) {
			return false;
		}

		return true;
	}

	function validateInputs() {
		if (
			selectModerator == undefined ||
			fundingAmount === "" ||
			betAmount === "" ||
			fundingAmount <= 0 ||
			imageFile == undefined
		) {
			setNewPostLoading(false);
			return false;
		}
		return true;
	}

	function approvalGiven() {
		if (!tokenAllowance) {
			return true;
		}

		const totalAmount = utils
			.parseEther(String(Number(fundingAmount)))
			.add(utils.parseEther(String(Number(betAmount))));
		if (totalAmount.gt(tokenAllowance)) {
			return false;
		}
		return true;
	}

	async function uploadImageHelper() {
		if (!isAuthenticated) {
			return;
		}

		// start new post loading
		setNewPostLoading(true);

		// validate inputs
		if (!validateInputs()) {
			// TODO give error
			displayToast("Invalid Inputs!", "error");
			return;
		}

		// const presignedUrl = await getPresignedUrl();
		// const s3Url = await uploadImageFile(presignedUrl);

		const formData = new FormData();
		formData.append("file", imageFile);
		formData.append("upload_preset", "yow5vd7c");
		const s3Url = await uploadImageFileCloudinary(formData);
		// const s3Url = "ht7cfvgybuhj16730";
		if (s3Url == undefined) {
			displayToast("Something went wrong!", "error");
			setNewPostLoading(false);
		}
		setS3ImageUrl(s3Url);
	}

	async function newPostTxHelper() {
		// validation checks
		if (!validateInputs()) {
			displayToast("Invalid Inputs!", "error");
			setS3ImageUrl("");
			return;
		}

		send(
			keccak256(s3ImageUrl),
			selectModerator,
			utils.parseEther(String(fundingAmount)),
			utils.parseEther(String(betAmount)),
			1
		);
	}

	return (
		<Flex flexDirection="column">
			<Flex padding={10} justifyContent="center">
				<Heading size="lg">Create new post</Heading>
			</Flex>
			{isAuthenticated !== true ? (
				<Flex justifyContent="center">
					<PrimaryButton
						title="Please Sign In"
						onClick={() => {
							dispatch(sUpdateLoginModalIsOpen(true));
						}}
					/>
				</Flex>
			) : undefined}
			{isAuthenticated === true ? (
				<Flex>
					<Spacer />
					<Flex
						width="40%"
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
										setImageFile(file);
									}}
								>
									<PrimaryButton title={"Choose Image"} />
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
					<Flex
						width="40%"
						flexDirection="column"
						alignItems="center"
					>
						<Select
							onChange={(e) => {
								setSelectModerator(e.target.value);
							}}
							placeholder="Select Group"
						>
							{moderators.map((obj) => {
								return (
									<>
										<option value={obj.oracleAddress}>
											{`${obj.name}`}
										</option>
									</>
								);
							})}
						</Select>

						{InputWithTitle(
							"Liquidity",
							false,
							fundingAmount,
							setFundingAmount,
							validateFundingAmount,
							{
								defaultValue: 1,
								precision: 3,
							}
						)}

						{InputWithTitle(
							"Bet for YES",
							false,
							betAmount,
							setBetAmount,
							validateInitialBetAmount,
							{
								defaultValue: 1,
								precision: 3,
							}
						)}

						<PrimaryButton
							title={"Post"}
							isLoading={newPostLoading}
							loadingText="Posting..."
							onClick={uploadImageHelper}
							style={{
								marginTop: 20,
							}}
							disabled={!approvalGiven()}
						/>
						{approvalGiven() !== true ? (
							<Flex flexDirection={"column"} marginTop={5}>
								<Box
									padding={2}
									backgroundColor="red.300"
									borderRadius={20}
								>
									<Text fontSize={12}>
										To post, you will have to first give
										MEME token approval to the app. This is
										only needed once.
									</Text>
								</Box>
								<PrimaryButton
									style={{ marginTop: 5 }}
									disabled={approvalGiven() === true}
									loadingText="Processing..."
									isLoading={approvalLoading}
									onClick={() => {
										if (approvalGiven() !== true) {
											setApprovalLoading(true);
											sendTokenApprove(
												addresses.MarketRouter,
												MAX_UINT_256
											);
										}
									}}
									title={"Set approval"}
								/>
							</Flex>
						) : undefined}
					</Flex>
					<Spacer />
				</Flex>
			) : undefined}
		</Flex>
	);
}

export default Page;
