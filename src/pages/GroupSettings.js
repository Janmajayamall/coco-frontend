import { useEffect, useState } from "react";
import {
	Heading,
	Flex,
	Text,
	Box,
	useToast,
	Spacer,
	Link,
	Select,
	Avatar,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
	convertHoursToBlocks,
	retrieveOracleAddressFormLogs,
	updateGroup,
	stateSetupOraclesInfo,
	validateEscalationLimit,
	validateExpireHours,
	validateResolutionBufferHours,
	validateResolutionHours,
	validateFee,
	validateGroupName,
	validateUpdateMarketConfigTxInputs,
	groupCheckNameUniqueness,
	validateGroupDescription,
	SAFE_BASE_URL,
	decodeGroupAddressFromGroupProxyFactoryCall,
	useBNInput,
	validateDonReservesLimit,
	validateDonBufferHours,
	CURR_SYMBOL,
	parseDecimalToBN,
	parseHoursToSeconds,
	findGroupsByIdArr,
	sliceAddress,
	findGroupsDetails,
	parseSecondsToHours,
	createUpdateGlobalConfigTx,
	safeService,
	createSafeTx,
	generateProfileInitials,
	numStrFormatter,
	COLORS,
} from "../utils";
import {
	useCreateGroupWithSafe,
	useCreateNewOracle,
	useQueryGroupById,
	useQueryGroupsByManagers,
} from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { addresses } from "../contracts";

import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectOracleInfoObj, selectUserProfile } from "../redux/reducers";
import Loader from "../components/Loader";
import GroupDisplayName from "../components/GroupDisplayPanel";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
	getOwnedSafes,
	proposeTransaction,
} from "@gnosis.pm/safe-react-gateway-sdk";
import { ethers } from "ethers";
import { UnicodeNormalizationForm } from "ethers/lib/utils";
function Page() {
	const urlParams = useParams();
	// const groupId = urlParams.groupId;
	const groupId = "0xad67843a0cc312a5b0e295e9192a4f575bc104b3";

	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();

	// group main info
	// groupDetails is queried from the backend.
	// groupConfig is queried from theGraph's index.
	// Use group details for meta details,
	// otherwise groupConfig consists of main info.
	const [groupDetails, setGroupDetails] = useState(null);
	const [groupConfigs, setGroupConfigs] = useState(null);

	// gnosis-safe
	const [safes, setSafes] = useState([]);

	// queries groups by managers
	// (i.e. safes of which user is an owner)
	// from theGraph's index
	const {
		result: rGroupsByManagers,
		reexecuteQuery: reexecuteGroupsByManagers,
	} = useQueryGroupsByManagers(
		safes.map((id) => id.toLowerCase()),
		false
	);

	// query group config from theGraph by group id
	const {
		result: rGroupById,
		reexecuteQuery: reGroupById,
	} = useQueryGroupById(groupId.toLowerCase(), false);

	const [isUserAnOwner, setIsUserAnOwner] = useState(false);

	// states for group configs
	const [feeDec, setFeeDec] = useState("0.05");
	const [donBufferHr, setDonBufferHr] = useState(1);
	const [resolutionBufferHr, setResolutionBufferHr] = useState(1);
	const {
		input: donReservesLimit,
		bnValue: donReservesLimitBN,
		setInput: setDonReservesLimit,
		err: donReservesErr,
		errText: donReservesErrText,
	} = useBNInput(validateDonReservesLimit);

	// states for group details
	const [groupAddress, setGroupAddress] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameExists, setNameExists] = useState(false);

	// get group details
	useEffect(async () => {
		const res = await findGroupsDetails([groupId.toLowerCase()]);
		if (res == undefined || res.groupsDetails.length == 0) {
			// TODO throw error
			return;
		}
		const _groupDetails = res.groupsDetails[0];
		console.log(_groupDetails);

		// set things up for editing
		setName(_groupDetails.name);
		setDescription(_groupDetails.description);

		setGroupDetails(_groupDetails);
	}, [groupId]);

	// sets group configs whenever groupById query changes
	useEffect(() => {
		if (rGroupById.data && rGroupById.data.group) {
			const _groupConfigs = {
				...rGroupById.data.group,
				fee: parseDecimalToBN(rGroupById.data.group.fee),
				donReservesLimit: parseDecimalToBN(
					rGroupById.data.group.donReservesLimit
				),
			};
			console.log(_groupConfigs);
			// set things up for editing
			setFeeDec(rGroupById.data.group.fee);
			setDonBufferHr(parseSecondsToHours(_groupConfigs.donBuffer));
			setResolutionBufferHr(
				parseSecondsToHours(_groupConfigs.resolutionBuffer)
			);
			setDonReservesLimit(rGroupById.data.group.donReservesLimit);

			setGroupConfigs(_groupConfigs);
		}
	}, [rGroupById]);

	// get and set safes owned by user
	useEffect(async () => {
		if (chainId == undefined || account == undefined) {
			return;
		}
		try {
			const res = await safeService.getSafesByOwner(account);
			if (res.safes == undefined) {
				return;
			}
			const _safes = res.safes.map((v) => v.toLowerCase());
			setSafes(_safes);
		} catch (e) {
			console.log(e);
		}
	}, [chainId, account]);

	// re-executes groups by managers query
	// whenever safes array changes
	useEffect(() => {
		if (safes.length == 0) {
			return;
		}

		// get groups associated with safes (i.e. as manager) from graphql
		reexecuteGroupsByManagers();
	}, [safes]);

	// Checks whether the groupId
	// exists in the groups returned from
	// groupsByManager query. Makes sure
	// that user is an owner of the group
	useEffect(() => {
		if (rGroupsByManagers.data && rGroupsByManagers.data.groups) {
			let exists = false;
			rGroupsByManagers.data.groups.forEach((g) => {
				if (g.id.toLowerCase() == groupId.toLowerCase()) {
					exists = true;
				}
			});
			setIsUserAnOwner(exists);
		}
	}, [rGroupsByManagers, safes, groupId]);

	useEffect(() => {
		setNameExists(false);
	}, [name]);

	async function editGroupConfigHelper() {
		if (!isAuthenticated || isUserAnOwner == false) {
			toast({
				title: "Invalid request!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (
			(!validateFee(feeDec).valid ||
				!validateDonBufferHours(donBufferHr).valid ||
				!validateResolutionBufferHours(resolutionBufferHr).valid ||
				!validateDonReservesLimit(donReservesLimitBN).valid ||
				groupConfigs == undefined,
			account == undefined)
		) {
			toast({
				title: "Invalid Input!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// updateGlobalConfig fn calldata
		const feeBN = parseDecimalToBN(feeDec);
		const donBufferSecs = parseHoursToSeconds(donBufferHr);
		const resolutionBufferSecs = parseHoursToSeconds(resolutionBufferHr);
		const updateGlobalConfigCalldata = createUpdateGlobalConfigTx(
			true,
			feeBN,
			donBufferSecs,
			resolutionBufferSecs
		);

		// create safe transaction
		const createdTx = await createSafeTx(
			groupConfigs.id,
			updateGlobalConfigCalldata,
			0,
			groupConfigs.manager,
			account
		);

		// propose the tx

		return;
		// console.log(
		// 	feeBN,
		// 	donBufferSecs,
		// 	resolutionBufferSecs,
		// 	donReservesLimitBN,
		// 	groupGlobalConfig
		// );
	}

	async function updateGroupDetailsHelper() {
		if (!isAuthenticated) {
			toast({
				title: "Please Sign In!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (
			!validateGroupName(name).valid ||
			!validateGroupDescription(description).valid ||
			groupConfigs == undefined
		) {
			toast({
				title: "Invalid Input!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// check name uniqueness
		let res = await groupCheckNameUniqueness(name, groupConfigs.id);
		if (res == undefined || res.isNameUnique === false) {
			setNameExists(true);
			toast({
				title: "Name already taken!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		res = await updateGroup(groupConfigs.id, {
			name,
			description,
		});

		if (res == undefined) {
			// TODO throw error
			return;
		}

		// TODO navigate to group page
	}

	return (
		<Flex width="100%" minHeight="100vh">
			<Flex width="70%" flexDirection="row" padding={5}>
				<Flex width={"49%"} flexDirection="column">
					{groupDetails != null ? (
						<Flex
							padding={2}
							backgroundColor={COLORS.PRIMARY}
							borderRadius={8}
							marginBottom={4}
							flexDirection={"column"}
						>
							<Flex marginBottom={1}>
								<Avatar
									size="md"
									name={generateProfileInitials(
										groupDetails.name
									)}
									marginRight={5}
								/>
								<Box marginRight={5}>
									<Text fontSize="md">
										{numStrFormatter(
											groupDetails.followCount
												? groupDetails.followCount
												: 0
										)}
									</Text>
									<Text fontSize="sm">members</Text>
								</Box>
								<Box marginRight={5}>
									<Text fontSize="md">
										{numStrFormatter(
											groupDetails.postCount
												? groupDetails.postCount
												: 0
										)}
									</Text>
									<Text fontSize="sm">contributions</Text>
								</Box>
							</Flex>
							<Flex>
								<Text fontSize="md">
									{groupDetails.description}
								</Text>
							</Flex>
						</Flex>
					) : (
						<Loader />
					)}
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						flexDirection="column"
						padding={2}
						width={"100%"}
					>
						<Text fontSize={20} fontWeight={"bold"}>
							Edit details
						</Text>
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
							loadingText="Processing..."
							isLoading={false}
							onClick={updateGroupDetailsHelper}
							title="Submit"
						/>{" "}
					</Flex>
				</Flex>
				<Spacer />
				<Flex width={"49%"} flexDirection="column">
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						flexDirection="column"
						padding={2}
						marginBottom={4}
					>
						<Text fontSize={20} fontWeight={"bold"}>
							Edit configurations
						</Text>
						{InputWithTitle(
							"Fee",
							1,
							feeDec,
							feeDec,
							setFeeDec,
							validateFee,
							{
								defaultValue: 0.05,
								precision: 3,
							}
						)}
						{InputWithTitle(
							"Challenge Buffer period",
							1,
							donBufferHr,
							donBufferHr,
							setDonBufferHr,
							validateDonBufferHours,
							{
								defaultValue: 1,
								precision: 0,
							},
							undefined,
							"Hrs"
						)}
						{InputWithTitle(
							"Resolution period",
							1,
							resolutionBufferHr,
							resolutionBufferHr,
							setResolutionBufferHr,
							validateResolutionBufferHours,
							{
								defaultValue: 1,
								precision: 0,
							},
							undefined,
							"Hrs"
						)}
						{InputWithTitle(
							"Max. Challange Limit",
							1,
							donReservesLimit,
							donReservesLimitBN,
							setDonReservesLimit,
							validateDonReservesLimit,
							{
								defaultValue: 1000,
								precision: 0,
							},
							undefined,
							CURR_SYMBOL
						)}
						<PrimaryButton
							style={{
								marginTop: 20,
							}}
							loadingText="Processing..."
							// isLoading={createLoading}
							onClick={() => {
								editGroupConfigHelper();
							}}
							title="Next"
						/>
					</Flex>
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						flexDirection="column"
						padding={2}
					>
						<Text fontSize={20} fontWeight={"bold"}>
							Edit Max. Challenge limit
						</Text>

						{InputWithTitle(
							"Max. Challange Limit",
							1,
							donReservesLimit,
							donReservesLimitBN,
							setDonReservesLimit,
							validateDonReservesLimit,
							{
								defaultValue: 1000,
								precision: 0,
							},
							undefined,
							CURR_SYMBOL
						)}
						<PrimaryButton
							style={{
								marginTop: 20,
							}}
							loadingText="Processing..."
							// isLoading={createLoading}
							onClick={() => {
								editGroupConfigHelper();
							}}
							title="Next"
						/>
					</Flex>
				</Flex>
			</Flex>

			<Flex width="30%" padding={5} flexDirection={"column"}>
				<Flex
					flexDirection={"column"}
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={5}
				>
					<Text fontWeight={"bold"}>How to edit?</Text>
					<Text>
						1. Any moderator can edit "details" which is basically
						stored on backend
					</Text>
					<Text>
						2. To make any changes to Configurations or Max.
						challenge limit - first propose a safe tx from here and
						then approve it from the safe.
					</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}

const styles = {
	inputsValue: {
		width: "100%",
		marginTop: 5,
	},

	inputsText: {
		width: "100%",
		marginTop: 5,
	},
	inputsFlex: {
		flexDirection: "column",
		width: "100%",
	},
	inputsErr: {},
};

export default Page;

// <Flex
// 	// borderRightWidth={1}
// 	borderLeftWidth={1}
// 	borderColor="#BDBDBD"
// 	width="25%"
// 	flexDirection="column"
// 	paddingTop={10}
// 	paddingLeft={5}
// >
// 	<Heading size="md" marginBottom={5}>
// 		Your Groups
// 	</Heading>
// 	{/* {oraclesLoading === true ? <Loader /> : undefined} */}
// 	{/* {oraclesLoading === false && oracleIds.length === 0 ? (
// 				<Flex>
// 					<Text fontSize={14} fontWeight="bold">
// 						You manage 0 groups
// 					</Text>
// 				</Flex>
// 			) : undefined} */}
// 	{groupsWithDetails.map((group, index) => {
// 		return (
// 			<GroupDisplayName
// 				key={index}
// 				group={group}
// 				followStatusVisible={false}
// 			/>
// 		);
// 	})}
// 	<Heading size="md" marginTop={10}>
// 		Pending Groups
// 	</Heading>
// 	{/* {groupsWithoutDetailsIds.map((id, index) => {
// 				return <Text fontSize={}>{id}</Text>;
// 			})} */}
// 	<Flex backgroundColor="gray.100" borderRadius={5} padding={1}>
// 		{groupsWithoutDetailsIds.map((id, index) => {
// 			return (
// 				<Text
// 					fontSize={15}
// 					fontWeight={"bold"}
// 					_hover={{
// 						cursor: "pointer",
// 						textDecoration: "underline",
// 					}}
// 				>
// 					{sliceAddress(id)}
// 				</Text>
// 			);
// 		})}
// 	</Flex>
// </Flex>;
