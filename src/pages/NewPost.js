import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Image,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "./../components/FileUpload";
import {
	uploadImage,
	keccak256,
	newPost,
	newPostTrial,
	findModerators,
} from "./../utils";
import { useCreateNewMarket } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";

function Page() {
	const [imageFile, setImageFile] = useState(null);
	const [imageURL, setImageURL] = useState(null);
	const [selectModerator, setSelectModerator] = useState(null);
	const [fundingAmount, setFundingAmount] = useState(0);
	const [betAmount, setBetAmount] = useState(0);
	const [imageUrl, setImageUrl] = useState("");

	const [moderators, setModerators] = useState([]);

	const { account } = useEthers();

	const { state, send } = useCreateNewMarket();

	useEffect(async () => {
		let res = await findModerators({});
		setModerators(res.moderators);
	}, []);

	useEffect(async () => {
		if (state.receipt) {
			const res = await newPost(selectModerator, imageUrl);
		}
	}, [state]);

	function validateFile(file) {
		const fsMb = file.size / (1024 * 1024);
		const MAX_FILE_SIZE = 10;
		if (fsMb > MAX_FILE_SIZE) {
			return false;
		}

		return true;
	}

	async function uploadImageHelper() {
		// await newPostTrial(
		// 	"0xb9181365C266cD4e361a455567B77a16bd8044a8",
		// 	"0x4838e42180000000000000000000000000000000000000000000000000000000"
		// );
		// return;

		// const _imageUrl = await uploadImage();
		const _imageUrl =
			"https://www.figmakets-for-Content?node-id=137%3A16730";
		setImageUrl(_imageUrl);
		newPostTxHelper();
	}

	async function newPostTxHelper() {
		// upload image
		// await uploadImageHelper();

		// validation checks
		// check image url is not empty
		// check rest of the values are fine as well

		send(
			keccak256(imageUrl),
			selectModerator,
			utils.parseEther(String(fundingAmount)),
			utils.parseEther(String(betAmount)),
			1
		);
	}

	return (
		<>
			{imageFile == null ? (
				<FileUpload
					accept={"image/*"}
					onFileUpload={(file) => {
						if (!validateFile(file)) {
							//TODO throw mmax file size error
							return;
						}
						setImageURL(URL.createObjectURL(file));
						setImageFile(file);
					}}
				>
					<Button leftIcon={<Icon as={FiFile} />}>
						Choose Image
					</Button>
				</FileUpload>
			) : undefined}
			{imageURL != null ? (
				<Image src={imageURL} width={500} />
			) : undefined}
			{imageFile != null ? (
				<Button
					onClick={() => {
						setImageFile(null);
						setImageURL(null);
					}}
				>
					Remove
				</Button>
			) : undefined}
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

			<Button onClick={uploadImageHelper}>Submit</Button>
		</>
	);
}

export default Page;
