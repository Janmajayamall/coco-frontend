import { useEffect, useState } from "react";
import {
	Text,
	Flex,
	Spacer,
	Avatar,
	useToast,
	Heading,
} from "@chakra-ui/react";
import InputWithTitle from "../components/InputWithTitle";
import {
	stateSetupOraclesInfo,
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
	generateProfileInitials,
	isValidAddress,
	moderatorCheckNameUniqueness,
} from "../utils";
import { useQueryOracleById, useUpdateMarketConfig } from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { useDispatch, useSelector } from "react-redux";
import { selectOracleInfoObj, selectUserProfile } from "../redux/reducers";
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
	const oracleId =
		urlParams.pageId != undefined && isValidAddress(urlParams.pageId)
			? urlParams.pageId
			: undefined;
	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const { result: oracleResult } = useQueryOracleById(oracleId);
	const { send, state } = useUpdateMarketConfig(oracleId);

	const [oracleData, setOracleData] = useState({});

	// loading states
	const [loadingOracleData, setLoadingOracleData] = useState(true);
	const [loadingUpdateMetadata, setLoadingUpdateMetadata] = useState(false);
	const [loadingUpdateOracle, setLoadingUpdateOracle] = useState(false);

	// err states
	const [nameExists, setNameExists] = useState(false);

	/**
	 * Meta data states
	 */
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	/**
	 * Oracle config states
	 */
	const [fee, setFee] = useState("0.05");
	const [escalationLimit, setEscalationLimit] = useState(1);
	const [expireHours, setExpireHours] = useState(1);
	const [bufferHours, setBufferHours] = useState(1);
	const [resolutionHours, setResolutionHours] = useState(1);

	useEffect(async () => {
		if (
			oracleResult.data == undefined ||
			oracleResult.data.oracle == undefined
		) {
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

	useEffect(() => {
		setNameExists(false);
	}, [name]);

	return (
		<Flex flexDirection="row" marginTop="20">
			<Spacer />
			{loadingOracleData === true ? <Loader /> : undefined}
			{loadingOracleData === false ? (
				<>
					<Flex width="30%" flexDirection="column">
						<Flex justifyContent="center" marginBottom={5}>
							<Heading size="lg">Group Info</Heading>
						</Flex>
						<Flex justifyContent="center" alignItems="center">
							<Flex
								flexDirection="column"
								marginTo="5"
								marginBottom="5"
							>
								<Avatar
									size="2xl"
									name={generateProfileInitials(name)}
									src={""}
								/>
							</Flex>
						</Flex>
						{InputWithTitle(
							"Name",
							0,
							name,
							name,
							setName,
							validateGroupName,
							{}
						)}
						{nameExists === true ? (
							<Text
								style={{
									fontSize: 12,
									color: "#EB5757",
								}}
							>
								Name already taken! Please try another one.
							</Text>
						) : undefined}
						{InputWithTitle(
							"Description",
							0,
							description,
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
									toast({
										title: "Invalid input!",
										error: "error",
										isClosable: true,
									});
									return;
								}

								// check name uniqueness
								let res = await moderatorCheckNameUniqueness(
									name,
									oracleData.id
								);

								if (
									res == undefined ||
									res.isNameUnique === false
								) {
									setNameExists(true);
									toast({
										title: "Name already taken!",
										status: "error",
										isClosable: true,
									});
									return;
								}

								setLoadingUpdateMetadata(true);
								res = await updateModerator(oracleData.id, {
									name,
									description,
								});

								if (res != undefined) {
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
							title={"Update Info"}
						/>
					</Flex>
					<Spacer />
					<Flex width="30%" flexDirection="column">
						<Flex justifyContent="center" marginBottom={5}>
							<Heading size="lg">Group Config</Heading>
						</Flex>
						<Flex flexDirection="column">
							{InputWithTitle(
								"Fee",
								1,
								fee,
								fee,
								setFee,
								validateFee,
								{
									defaultValue: 0.05,
									precision: 3,
								}
							)}
							{InputWithTitle(
								"Max. no. of Challenge rounds",
								1,
								escalationLimit,
								escalationLimit,
								setEscalationLimit,
								validateEscalationLimit,
								{
									defaultValue: 1,
									precision: 0,
								}
							)}
							{InputWithTitle(
								"Prediction Period (in hrs)",
								1,
								expireHours,
								expireHours,
								setExpireHours,
								validateExpireHours,
								{
									defaultValue: 1,
									precision: 0,
								},
								undefined,
								"Hr"
							)}
							{InputWithTitle(
								"Challenge period (in hrs)",
								1,
								bufferHours,
								bufferHours,
								setBufferHours,
								validateBufferHours,
								{
									defaultValue: 1,
									precision: 0,
								},
								undefined,
								"Hr"
							)}
							{InputWithTitle(
								"Resolution period (in hrs)",
								1,
								resolutionHours,
								resolutionHours,
								setResolutionHours,
								validateResolutionHours,
								{
									defaultValue: 1,
									precision: 0,
								},
								undefined,
								"Hr"
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
										account.toLowerCase() !=
											oracleData.delegate
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

									// send(
									// 	true,
									// 	feeNumerator,
									// 	feeDenominator,
									// 	1,
									// 	20,
									// 	20,
									// 	20
									// );

									send(
										true,
										feeNumerator,
										feeDenominator,
										escalationLimit,
										convertHoursToBlocks(
											chainId,
											expireHours
										),
										convertHoursToBlocks(
											chainId,
											bufferHours
										),
										convertHoursToBlocks(
											chainId,
											resolutionHours
										)
									);
								}}
								title={"Update Configs"}
							/>
						</Flex>
					</Flex>
				</>
			) : undefined}

			<Spacer />
		</Flex>
	);
}

export default Page;
