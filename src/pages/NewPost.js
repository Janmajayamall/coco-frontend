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
} from "@chakra-ui/react";
import FileUpload from "./../components/FileUpload";
import {
	keccak256,
	newPost,
	findModerators,
	getPresignedUrl,
	validateCreationAmount,
	useBNInput,
	CURR_SYMBOL,
	uploadImageFile,
	GRAPH_BUFFER_MS,
} from "./../utils";
import {
	useCreateNewMarket,
	useCheckTokenApprovals,
	useTokenBalance,
} from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { BigNumber, utils } from "ethers";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile, sUpdateLoginModalIsOpen } from "../redux/reducers";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import ApprovalInterface from "../components/ApprovalInterface";

function Page() {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const wEthTokenBalance = useTokenBalance(account);

	const [imageFile, setImageFile] = useState(null);
	const [s3ImageUrl, setS3ImageUrl] = useState(null);
	const [selectModerator, setSelectModerator] = useState(null);
	const {
		input: creationAmount,
		bnValue: creationAmountBn,
		setInput: setCreationAmount,
		err: creationAmountErr,
		errText: creationAmountErrText,
	} = useBNInput();

	const [moderators, setModerators] = useState([]);
	const [newPostLoading, setNewPostLoading] = useState(false);
	const [selectErr, setSelectErr] = useState(false);
	const [imageErr, setImageErr] = useState(false);

	const { state, send } = useCreateNewMarket();

	const tokenApproval = useCheckTokenApprovals(
		0,
		account,
		undefined,
		creationAmountBn
	);

	useEffect(async () => {
		let res = await findModerators({});
		setModerators(res.moderators);
	}, []);

	useEffect(async () => {
		if (state.status === "Success") {
			await newPost(selectModerator, s3ImageUrl);
			setTimeout(() => {
				displayToast("Post created", "success");

				// end new post loading
				setNewPostLoading(false);

				navigate("/home");
			}, GRAPH_BUFFER_MS);
		} else if (state.status == "Exception" || state.status == "Fail") {
			displayToast("Metamask error!", "error");
			setS3ImageUrl("");
			setNewPostLoading(false);
		}
	}, [state]);

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
		if (selectModerator == undefined || selectModerator == "") {
			setSelectErr(true);
			return false;
		}
		if (imageFile == undefined) {
			setImageErr(true);
			return false;
		}

		if (
			!validateCreationAmount(creationAmountBn, wEthTokenBalance).valid ||
			wEthTokenBalance == undefined
		) {
			return false;
		}

		return true;
	}

	async function uploadImageHelper() {
		if (!isAuthenticated || !tokenApproval) {
			return;
		}

		// start new post loading
		setNewPostLoading(true);

		// validate inputs
		if (!validateInputs()) {
			setNewPostLoading(false);
			displayToast("Invalid Inputs!", "error");
			return;
		}

		const { presignedUrl } = await getPresignedUrl();
		const s3Url = await uploadImageFile(presignedUrl, imageFile);

		if (s3Url == undefined) {
			displayToast("Something went wrong!", "error");
			setNewPostLoading(false);
		}

		setS3ImageUrl(s3Url);
	}

	async function newPostTxHelper() {
		// validation checks
		if (!validateInputs()) {
			setNewPostLoading(false);
			displayToast("Invalid Inputs!", "error");
			setS3ImageUrl("");
			return;
		}

		send(
			keccak256(s3ImageUrl),
			selectModerator,
			creationAmountBn.div(BigNumber.from(2)), // liquidity = 0.5 * creation amount
			creationAmountBn.div(BigNumber.from(2)), // yes bet amount = 0.5 * creation amount
			1
		);
	}

	return (
		<Flex flexDirection="column">
			<Flex padding={10} justifyContent="center">
				<Heading size="lg">New post</Heading>
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
										setImageErr(false);
										setImageFile(file);
									}}
								>
									<Flex flexDirection="column">
										<PrimaryButton title={"Choose Image"} />
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
					<Flex
						width="40%"
						flexDirection="column"
						alignItems="center"
					>
						<Flex width="100%" flexDirection="column">
							<Select
								onChange={(e) => {
									setSelectErr(false);
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

						{InputWithTitle(
							"Creation Amount",
							2,
							creationAmount,
							creationAmountBn,
							setCreationAmount,
							validateCreationAmount,
							{
								defaultValue: 1,
							},
							wEthTokenBalance,
							CURR_SYMBOL
						)}

						<PrimaryButton
							title={"Post"}
							isLoading={newPostLoading}
							loadingText="Processing..."
							onClick={uploadImageHelper}
							style={{
								marginTop: 20,
							}}
							disabled={!tokenApproval || !isAuthenticated}
						/>
						<ApprovalInterface
							marginTop={5}
							tokenType={0}
							erc20AmountBn={creationAmountBn}
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
			) : undefined}
		</Flex>
	);
}

export default Page;
