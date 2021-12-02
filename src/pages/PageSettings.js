import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Image,
	Text,
	Flex,
	Input,
	Spacer,
	Avatar,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "../components/FileUpload";
import {
	uploadImage,
	keccak256,
	newPost,
	newPostTrial,
	stateSetupMarketsMetadata,
	stateSetupOraclesInfo,
	filterMarketIdentifiersFromMarketsGraph,
	populateMarketWithMetadata,
	ZERO_DECIMAL_STR,
	parseDecimalToBN,
	formatBNToDecimal,
	updateModerator,
	convertHoursToBlocks,
	convertBlocksToHours,
} from "../utils";
import {
	useCreateNewMarket,
	useQueryOraclesByManager,
	useQueryMarketsAtStage3ByOracles,
	useQueryOracleById,
	useUpdateMarketConfig,
} from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import {
	selectGroupsFollowed,
	selectMarketsMetadata,
	selectOracleInfoObj,
} from "../redux/reducers";
import PostDisplay from "../components/PostDisplay";
import { useNavigate, useParams } from "react-router";
import Loader from "../components/Loader";

/**
 * Things left -
 * 1. Upload & set image
 * 2. Loading & error handling of inputs
 */
function Page() {
	const { account, chainId } = useEthers();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const urlParams = useParams();
	const oracleId = urlParams.pageId;

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const { result: oracleResult } = useQueryOracleById(oracleId);
	const { send, state } = useUpdateMarketConfig(oracleId);

	const [oracleData, setOracleData] = useState({});
	const [loadingOracleData, setLoadingOracleData] = useState(true);

	/**
	 * Meta data states
	 */
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState(null);
	const [imageS3Url, setImageS3Url] = useState(null);

	/**
	 * Oracle config states
	 */
	const [fee, setFee] = useState(0);
	const [escalationLimit, setEscalationLimit] = useState(0);
	const [expireHours, setExpireHours] = useState(0);
	const [bufferHours, setBufferHours] = useState(0);
	const [resolutionHours, setResolutionHours] = useState(0);

	useEffect(async () => {
		if (oracleResult.data == undefined) {
			return;
		}
		await stateSetupOraclesInfo([oracleResult.data.oracle.id], dispatch);
	}, [oracleResult]);

	useEffect(() => {
		if (oracleResult.data == undefined) {
			return;
		}
		setOracleData({
			...oracleResult.data.oracle,
			...oraclesInfoObj[oracleResult.data.oracle.id],
			fee:
				Number(oracleResult.data.oracle.feeNumerator) /
				Number(oracleResult.data.oracle.feeDenominator),
		});
		setLoadingOracleData(false);
	}, [oracleResult, oraclesInfoObj]);

	useEffect(() => {
		console.log(oracleData, " oracleData");
		setName(oracleData.name);
		setDescription(oracleData.description);
		setImage(oracleData.image);
		setFee(oracleData.fee);
		setEscalationLimit(oracleData.donEscalationLimit);
		setExpireHours(
			convertBlocksToHours(chainId, oracleData.expireBufferBlocks)
		);
		setBufferHours(
			convertBlocksToHours(chainId, oracleData.donBufferBlocks)
		);
		setResolutionHours(
			convertBlocksToHours(chainId, oracleData.resolutionBufferBlocks)
		);
	}, [oracleData]);

	if (oracleData == undefined) {
		return <div />;
	}

	function validateFile(file) {
		const fsMb = file.size / (1024 * 1024);
		const MAX_FILE_SIZE = 10;
		if (fsMb > MAX_FILE_SIZE) {
			return false;
		}

		return true;
	}

	return (
		<Flex flexDirection="row" marginTop="20">
			<Spacer />
			<Flex width="40%" flexDirection="column">
				<Flex justifyContent="center" alignItems="center">
					{imageS3Url == null && image == null ? (
						<FileUpload
							accept={"image/*"}
							onFileUpload={(file) => {
								if (!validateFile(file)) {
									//TODO throw mmax file size error
									return;
								}
								setImage(file);
							}}
						>
							<Button leftIcon={<Icon as={FiFile} />}>
								Choose Image
							</Button>
						</FileUpload>
					) : (
						<Flex flexDirection="column">
							<Avatar
								size="2xl"
								name="Chosen Pic"
								src={
									imageS3Url == null
										? URL.createObjectURL(image)
										: imageS3Url
								}
							/>

							<Button
								onClick={() => {
									setImageS3Url(null);
									setImage(null);
								}}
							>
								Remove
							</Button>
						</Flex>
					)}
				</Flex>
				<Input
					placeholder="Name"
					onChange={(e) => {
						setName(e.target.value);
					}}
					value={name}
				/>
				<Input
					placeholder="Description"
					onChange={(e) => {
						setDescription(e.target.value);
					}}
					value={description}
				/>
				<Button
					disabled={
						account == undefined ||
						account.toLowerCase() != oracleData.manager
					}
					onClick={async () => {
						if (
							account == undefined ||
							account.toLowerCase() != oracleData.manager
						) {
							return;
						}
						const res = await updateModerator(oracleData.id, {
							name,
							description,
						});
					}}
				>
					<Text>Update Metadata</Text>
				</Button>
			</Flex>
			<Spacer />
			<Flex width="40%" flexDirection="column">
				<Flex flexDirection="column">
					<NumberInput
						onChange={(val) => {
							setFee(val);
						}}
						defaultValue={0}
						precision={3}
						value={fee}
						max={1}
					>
						<NumberInputField />
					</NumberInput>

					<NumberInput
						onChange={(val) => {
							setEscalationLimit(val);
						}}
						defaultValue={0}
						precision={0}
						value={escalationLimit}
					>
						<NumberInputField />
					</NumberInput>

					<NumberInput
						onChange={(val) => {
							setExpireHours(val);
						}}
						defaultValue={0}
						precision={2}
						value={expireHours}
					>
						<NumberInputField />
					</NumberInput>

					<NumberInput
						onChange={(val) => {
							setBufferHours(val);
						}}
						defaultValue={0}
						precision={2}
						value={bufferHours}
					>
						<NumberInputField />
					</NumberInput>

					<NumberInput
						onChange={(val) => {
							setResolutionHours(val);
						}}
						defaultValue={0}
						precision={2}
						value={resolutionHours}
					>
						<NumberInputField />
					</NumberInput>
					<Button
						disabled={
							account == undefined ||
							account.toLowerCase() != oracleData.delegate
						}
						onClick={() => {
							if (
								account == undefined ||
								account.toLowerCase() != oracleData.delegate
							) {
								return;
							}

							const feeNumerator = Number(fee) * 1000;
							const feeDenominator = 1000;

							send(
								true,
								feeNumerator,
								feeDenominator,
								escalationLimit,
								convertHoursToBlocks(chainId, expireHours),
								convertHoursToBlocks(chainId, bufferHours),
								convertHoursToBlocks(chainId, resolutionHours)
							);
						}}
					>
						<Text>Update Config</Text>
					</Button>
				</Flex>
			</Flex>

			<Spacer />
		</Flex>
	);
}

export default Page;
