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
import { uploadImage, keccak256 } from "./../utils";
import { useCreateNewMarket } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";

function Page() {
	const [selectImage, setSelectImage] = useState(null);
	const [selectModerator, setSelectModerator] = useState(null);
	const [fundingAmount, setFundingAmount] = useState(0);
	const [betAmount, setBetAmount] = useState(0);

	const { account } = useEthers();

	const { state, send } = useCreateNewMarket();

	useEffect(() => {
		if (state.receipt) {
			console.log(state, "jiji");
			const txHash = state.receipt.transactionHash;
			console.log(txHash, " Post added");
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

	async function newPostHelper() {
		console.log(selectModerator, fundingAmount, betAmount);

		// upload image
		const imageUrl = await uploadImage();

		// validation checks

		send(
			account,
			selectModerator,
			keccak256(imageUrl),
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
				<option value="0x3A8ed689D382Fe98445bf73c087A2F6102B75ECe">
					Top 10 Dank
				</option>
				<option value="0x3A8ed689D382Fe98445bf73c087A2F6102B75ECe">
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
					setFundingAmount(val);
				}}
				defaultValue={0}
				precision={2}
			>
				<NumberInputField />
			</NumberInput>

			<Button onClick={newPostHelper}>Submit</Button>
		</>
	);
}

export default Page;
