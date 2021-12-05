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
	useToast,
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
	selectUserProfile,
} from "../redux/reducers";
import PostDisplay from "../components/PostDisplay";
import { useNavigate, useParams } from "react-router";
import Loader from "../components/Loader";

function Page() {
	const { account, chainId } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile;

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const urlParams = useParams();
	const toast = useToast();
	const oracleId = urlParams.pageId;

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const { result: oracleResult } = useQueryOracleById(oracleId);
	const { send, state } = useUpdateMarketConfig(oracleId);

	const [oracleData, setOracleData] = useState({});

	// loading states
	const [loadingOracleData, setLoadingOracleData] = useState(true);
	const [loadingUpdateMetadata, setLoadingUpdateMetadata] = useState(false);
	const [loadingUpdateOracle, setLoadingUpdateOracle] = useState(false);

	/**
	 * Meta data states
	 */
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [groupImageUrl, setGroupImageUrl] = useState(null);
	const [uploadedImage, setUploadedImage] = useState(null);

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
		if (state.status === "Exception" || state.status === "Fail") {
			toast({
				title: "Metamask err!",
				status: "error",
				isClosable: true,
			});
		}
		if (state.receipt != undefined) {
			toast({
				title: "Success!",
				status: "success",
				isClosable: true,
			});
		}
		setLoadingUpdateOracle(false);
	}, [state]);

	useEffect(() => {
		if (
			oracleResult.data == undefined ||
			oracleResult.data.oracle == undefined
		) {
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
		setName(oracleData.name);
		setDescription(oracleData.description);
		setGroupImageUrl(oracleData.groupImageUrl);
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
					<Flex flexDirection="column" marginTo="5" marginBottom="5">
						<Avatar
							size="2xl"
							name="Chosen Pic"
							src={
								groupImageUrl == undefined
									? uploadImage == undefined
										? "https://bit.ly/dan-abramov"
										: URL.createObjectURL(uploadImage)
									: groupImageUrl
							}
						/>

						{groupImageUrl == undefined &&
						uploadImage == undefined ? (
							<FileUpload
								accept={"image/*"}
								onFileUpload={(file) => {
									if (!validateFile(file)) {
										toast({
											title:
												"File size limit (10MB) exceeded",
											status: "error",
											isClosable: true,
										});
										return;
									}
									setUploadedImage(file);
								}}
							>
								<Button leftIcon={<Icon as={FiFile} />}>
									Choose Image
								</Button>
							</FileUpload>
						) : (
							<Button
								onClick={() => {
									setGroupImageUrl(null);
									setUploadedImage(null);
								}}
							>
								Remove
							</Button>
						)}
					</Flex>
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
					isLoading={loadingUpdateMetadata}
					loadingText={"Processing..."}
					onClick={async () => {
						setLoadingUpdateMetadata(true);

						// validate rights
						if (
							!isAuthenticated ||
							account.toLowerCase() != oracleData.manager
						) {
							toast({
								title: "Unauthenticated!",
								error: "error",
								isClosable: true,
							});
							return;
						}

						let updates = {
							name,
							description,
						};

						// check whether to upload image
						if (image != undefined) {
							// TODO upload image
							console.log("image uploaded");
						}

						const res = await updateModerator(
							oracleData.id,
							updates
						);

						if (res) {
							toast({
								title: "Info updated!",
								status: "success",
								isClosable: true,
							});
						} else {
							toast({
								title: "Unknown err!",
								status: "error",
								isClosable: true,
							});
						}
						setLoadingUpdateMetadata(false);
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
						loadingText={"Processing..."}
						isLoading={loadingUpdateOracle}
						onClick={() => {
							setLoadingUpdateOracle(true);

							// validate access rights
							if (
								!isAuthenticated ||
								account.toLowerCase() != oracleData.delegate
							) {
								toast({
									title: "Unauthenticated!",
									error: "error",
									isClosable: true,
								});
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
