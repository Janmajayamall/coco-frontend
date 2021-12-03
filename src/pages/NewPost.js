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
} from "./../utils";
import { useCreateNewMarket } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";
import { useNavigate } from "react-router";

function Page() {
	const toast = useToast();
	const navigate = useNavigate();

	const [imageFile, setImageFile] = useState(null);
	const [s3ImageUrl, setS3ImageUrl] = useState(null);
	const [selectModerator, setSelectModerator] = useState(null);
	const [fundingAmount, setFundingAmount] = useState(0);
	const [betAmount, setBetAmount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [moderators, setModerators] = useState([]);
	const [newPostLoading, setNewPostLoading] = useState(false);

	const { account } = useEthers();

	const { state, send } = useCreateNewMarket();

	useEffect(async () => {
		let res = await findModerators({});
		setModerators(res.moderators);
	}, []);

	useEffect(async () => {
		if (state.receipt) {
			const res = await newPost(selectModerator, s3ImageUrl);

			setTimeout(() => {
				// TODO give a success message & navigate to explorer
				displayToast("Post created", "success");

				// end new post loading
				setNewPostLoading(false);

				navigate("/explore");
			}, 5000);
		}
	}, [state]);

	useEffect(async () => {
		if (state.status == "Exception" || state.status == "Fail") {
			// TODO tell user about the exception
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

	async function uploadImageHelper() {
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
		const s3Url = "ht7cfvgybuhj16730";
		if (s3Url == undefined) {
			// TODO give error
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
		<Flex>
			<Spacer />
			<Flex
				width="40%"
				height="100vh"
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
							<Button leftIcon={<Icon as={FiFile} />}>
								Choose Image
							</Button>
						</FileUpload>
					</Flex>
				) : undefined}
				{imageFile != null ? (
					<Image src={URL.createObjectURL(imageFile)} width="90%" />
				) : undefined}
				{imageFile != null ? (
					<Button
						onClick={() => {
							setImageFile(null);
						}}
					>
						Remove
					</Button>
				) : undefined}
			</Flex>
			<Flex
				width="40%"
				flexDirection="column"
				justifyContent="center"
				alignItems="center"
				height="100vh"
			>
				<Select
					onChange={(e) => {
						setSelectModerator(e.target.value);
					}}
					placeholder="Select Page"
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

				<NumberInput
					onChange={(val) => {
						setFundingAmount(val);
					}}
					defaultValue={0}
					precision={2}
				>
					<NumberInputField />
				</NumberInput>

				<NumberInput
					onChange={(val) => {
						setBetAmount(val);
					}}
					defaultValue={0}
					precision={2}
				>
					<NumberInputField />
				</NumberInput>

				<Button
					isLoading={newPostLoading}
					loadingText="Posting..."
					onClick={uploadImageHelper}
				>
					Submit
				</Button>
			</Flex>
			<Spacer />
		</Flex>
	);
}

export default Page;
