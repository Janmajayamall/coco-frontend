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

	/**
	 * Meta data states
	 */
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState("");

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
		if (
			oracleResult.data == undefined ||
			oraclesInfoObj[oracleResult.data.oracle.id] == undefined
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
	}, [oracleResult, oraclesInfoObj]);

	useEffect(() => {
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

	return (
		<Flex flexDirection="row">
			<Flex flexDirection="column">
				{/* <Input
						placeholder="Name"
						onChange={(e) => {
							setName(e.target.value);
						}}
						value={name}
					/> */}
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
	);
}

export default Page;
