import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "./../components/FileUpload";
import { uploadImage, keccak256, newPost } from "./../utils";
import { useCreateNewMarket } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";

function Page() {
	const [selectImage, setSelectImage] = useState(null);
	const [selectModerator, setSelectModerator] = useState(null);
	const [fundingAmount, setFundingAmount] = useState(0);
	const [betAmount, setBetAmount] = useState(0);
	const [imageUrl, setImageUrl] = useState("");

	const { account } = useEthers();

	const { state, send } = useCreateNewMarket();

	useEffect(async () => {
		if (state.receipt) {
			console.log(state, "jiji");
			// const txHash = state.receipt.transactionHash;
			const res = await newPost(selectModerator, imageUrl);
			console.log(res, " ml");
			// console.log(txHash, " Post added");
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
		const _imageUrl = await uploadImage();
		setImageUrl(_imageUrl);
		newPostTxHelper();
	}

	async function newPostTxHelper() {
		console.log(selectModerator, fundingAmount, betAmount);

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
			<FileUpload
				accept={"image/*"}
				onFileUpload={(file) => {
					if (!validateFile(file)) {
						//TODO throw mmax file size error
						return;
					}
					setSelectImage(file);
				}}
			>
				<Button leftIcon={<Icon as={FiFile} />}>Upload</Button>
			</FileUpload>

			<Select
				onChange={(e) => {
					setSelectModerator(e.target.value);
				}}
				placeholder="Select Page"
			>
				<option value="0xc227040739b85272e4d8231664dcfd7cb15f35f7">
					Top 10 Dank
				</option>
				<option value="0xc227040739b85272e4d8231664dcfd7cb15f35f7">
					Top 50 KI
				</option>
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
