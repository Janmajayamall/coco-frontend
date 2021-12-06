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
	Heading,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "../components/FileUpload";
import InputWithTitle from "../components/InputWithTitle";
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
	validateEscalationLimit,
	validateExpireHours,
	validateBufferHours,
	validateResolutionHours,
	validateFee,
	validateGroupName,
	validateUpdateMarketConfigTxInputs,
	GRAPH_BUFFER_MS,
	validateGroupDescription,
	uploadImageFileCloudinary,
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
import PrimaryButton from "../components/PrimaryButton";

function Page() {
	const { account, chainId } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const urlParams = useParams();
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
	const [fee, setFee] = useState("0.05");
	const [escalationLimit, setEscalationLimit] = useState(1);
	const [expireHours, setExpireHours] = useState(1);
	const [bufferHours, setBufferHours] = useState(1);
	const [resolutionHours, setResolutionHours] = useState(1);

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
			setLoadingUpdateOracle(false);
		}
		if (state.receipt != undefined) {
			setTimeout(() => {
				setLoadingUpdateOracle(false);
				toast({
					title: "Success!",
					status: "success",
					isClosable: true,
				});
				window.location.reload();
			}, GRAPH_BUFFER_MS);
		}
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

			<Flex width="30%" flexDirection="column">
				<Heading>Group data</Heading>
				<Flex justifyContent="center" alignItems="center">
					<Flex flexDirection="column" marginTo="5" marginBottom="5">
						<Avatar
							size="2xl"
							name="G"
							src={
								groupImageUrl == undefined
									? uploadedImage == undefined
										? undefined
										: URL.createObjectURL(uploadedImage)
									: groupImageUrl
							}
						/>

						{groupImageUrl == undefined &&
						uploadedImage == undefined ? (
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
				{InputWithTitle(
					"Name",
					true,
					name,
					setName,
					validateGroupName,
					{}
				)}
				{InputWithTitle(
					"Description",
					true,
					description,
					setDescription,
					validateGroupDescription,
					{}
				)}
				<PrimaryButton
					style={{
						marginTop: 20,
					}}
					disabled={
						account == undefined ||
						account.toLowerCase() != oracleData.manager
					}
					isLoading={loadingUpdateMetadata}
					loadingText={"Processing..."}
					onClick={async () => {
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

						// validate input
						if (
							!validateGroupName(name).valid ||
							!validateGroupDescription(description).valid
						) {
							console.log(validateGroupName(name));
							console.log(validateGroupDescription(description));
							console.log("bro!");
							toast({
								title: "Invalid input!",
								error: "error",
								isClosable: true,
							});
							return;
						}

						setLoadingUpdateMetadata(true);

						let updates = {
							name,
							description,
						};

						// check whether to upload image
						if (uploadedImage != undefined) {
							const formData = new FormData();
							formData.append("file", uploadedImage);
							formData.append("upload_preset", "yow5vd7c");
							const s3Url = await uploadImageFileCloudinary(
								formData
							);
							updates = {
								...updates,
								groupImageUrl: s3Url,
							};
						}
						console.log("updated data, ", updates);
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
					title={"Update Metadata"}
				/>
			</Flex>
			<Spacer />
			<Flex width="30%" flexDirection="column">
				<Heading>Market Config</Heading>
				<Flex flexDirection="column">
					{InputWithTitle("Fee", false, fee, setFee, validateFee, {
						defaultValue: 0.05,
						precision: 3,
					})}
					{InputWithTitle(
						"Escalation Limit",
						false,
						escalationLimit,
						setEscalationLimit,
						validateEscalationLimit,
						{
							defaultValue: 1,
							precision: 0,
						}
					)}
					{InputWithTitle(
						"Trading Period (in hrs)",
						false,
						expireHours,
						setExpireHours,
						validateExpireHours,
						{
							defaultValue: 1,
							precision: 0,
						}
					)}
					{InputWithTitle(
						"Challenge period (in hrs)",
						false,
						bufferHours,
						setBufferHours,
						validateBufferHours,
						{
							defaultValue: 1,
							precision: 0,
						}
					)}
					{InputWithTitle(
						"Resolution period (in hrs)",
						false,
						resolutionHours,
						setResolutionHours,
						validateResolutionHours,
						{
							defaultValue: 1,
							precision: 0,
						}
					)}
					<PrimaryButton
						style={{
							marginTop: 20,
						}}
						disabled={
							account == undefined ||
							account.toLowerCase() != oracleData.delegate
						}
						loadingText={"Processing..."}
						isLoading={loadingUpdateOracle}
						onClick={() => {
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

							// validate inputs
							if (
								!validateUpdateMarketConfigTxInputs(
									fee,
									escalationLimit,
									expireHours,
									bufferHours,
									resolutionHours
								).valid
							) {
								toast({
									title: "Invalid Input!",
									status: "error",
									isClosable: true,
								});
								return;
							}

							setLoadingUpdateOracle(true);

							// fee calc
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
						title={"Update Config"}
					/>
				</Flex>
			</Flex>

			<Spacer />
		</Flex>
	);
}

export default Page;
