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
	createUpdateDonReservesLimitTx,
} from "../utils";
import {
	useCreateGroupWithSafe,
	useCreateNewOracle,
	useQueryGroupById,
	useQueryGroupsByManagers,
	useGetSafesAndGroupsManagedByUser,
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
import GroupDetails from "../components/GroupDetails";
import HelpBox from "../components/HelpBox";

function Page() {
	const urlParams = useParams();
	const groupId = urlParams.groupId
		? urlParams.groupId.toLowerCase()
		: undefined;

	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();

	// get safes & groups managed by the user
	const { safes, groupIds } = useGetSafesAndGroupsManagedByUser(account);

	// flag indicates whether groupId
	// is within the list of groups
	// managed by the user
	const isUserAnOwner =
		groupIds.find((id) => id.toLowerCase() == groupId.toLowerCase()) !=
		undefined
			? true
			: false;

	// group main info
	// groupDetails is queried from the backend.
	// groupConfig is queried from theGraph's index.
	// Use group details for meta details,
	// otherwise groupConfig consists of main info.
	const [groupDetails, setGroupDetails] = useState(null);
	const [groupConfigs, setGroupConfigs] = useState(null);

	// query group config from theGraph by group id
	const {
		result: rGroupById,
		reexecuteQuery: reGroupById,
	} = useQueryGroupById(groupId.toLowerCase(), false);

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

	useEffect(() => {
		setNameExists(false);
	}, [name]);

	async function editMaxChallengeLimitHelper() {
		if (!isAuthenticated || isUserAnOwner == false) {
			toast({
				title: "Invalid request!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (!validateDonReservesLimit(donReservesLimitBN).valid) {
			toast({
				title: "Invalid Input!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		const calldata = createUpdateDonReservesLimitTx(donReservesLimitBN);

		// create safe transaction
		await createSafeTx(
			groupConfigs.id,
			calldata,
			0,
			groupConfigs.manager,
			account
		);
	}

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
		await createSafeTx(
			groupConfigs.id,
			updateGlobalConfigCalldata,
			0,
			groupConfigs.manager,
			account
		);
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
						<GroupDetails
							groupDetails={groupDetails}
							followButton={false}
						/>
					) : (
						<Flex
							padding={2}
							backgroundColor={COLORS.PRIMARY}
							borderRadius={8}
							marginBottom={4}
							flexDirection={"column"}
						>
							<Text>
								Group details do not exist! Please update them
								:)
							</Text>
						</Flex>
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
							{`${
								isUserAnOwner == true ? "Edit " : ""
							}Group Details`}
						</Text>
						{InputWithTitle(
							"Name",
							0,
							name,
							name,
							setName,
							validateGroupName,
							{},
							undefined,
							"",
							!isUserAnOwner
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
							{},
							undefined,
							"",
							!isUserAnOwner
						)}
						{isUserAnOwner == true ? (
							<PrimaryButton
								style={{
									marginTop: 20,
								}}
								loadingText="Processing..."
								isLoading={false}
								onClick={updateGroupDetailsHelper}
								title="Submit"
							/>
						) : undefined}
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
							{`${
								isUserAnOwner == true ? "Edit " : ""
							}Group configurations`}
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
							},
							undefined,
							"",
							!isUserAnOwner
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
							"Hrs",
							!isUserAnOwner
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
							"Hrs",
							!isUserAnOwner
						)}
						{isUserAnOwner == true ? (
							<PrimaryButton
								style={{
									marginTop: 20,
								}}
								loadingText="Processing..."
								// isLoading={createLoading}
								onClick={() => {
									editGroupConfigHelper();
								}}
								title="Submit"
							/>
						) : undefined}
					</Flex>
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						flexDirection="column"
						padding={2}
					>
						<Text fontSize={20} fontWeight={"bold"}>
							{`${
								isUserAnOwner == true ? "Edit " : ""
							}Max. Challenge limit`}
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
							CURR_SYMBOL,
							!isUserAnOwner
						)}
						{isUserAnOwner == true ? (
							<PrimaryButton
								style={{
									marginTop: 20,
								}}
								loadingText="Processing..."
								// isLoading={createLoading}
								onClick={() => {
									editMaxChallengeLimitHelper();
								}}
								title="Submit"
							/>
						) : undefined}
					</Flex>
				</Flex>
			</Flex>

			<Flex width="30%" paddingTop={5} flexDirection={"column"}>
				<HelpBox
					heading={"What's?"}
					pointsArr={[
						"1. Fee - Fee charged by moderators as a product of amount put up for the losing outcome. Only applicable when they declare final outcome.",
						"2. Challenge Buffer period - Time period to challenge temporary outcome.",
						"3. Resolution period - Time period for moderators to declare final outcome, if needed.",
						"4. Max. Challenge limit  - Max. limit total amount put up in challenge rounds a post can reach. After which no more challenges are allowed and moderators will declare the final outcome.",
					]}
				/>
				{isUserAnOwner == true ? (
					<HelpBox
						heading={"How to edit?"}
						pointsArr={[
							"1. Group details - Any one moderator can edit group details right away.",
							"2. Group Configurations - A moderator can propose a transaction to update configurations to gnosis-safe.",
							"3. Max. Challenge Limit - Like (2) a moderator can propose update transaction to gnosis-safe.",
							"4. For (2) & (3) transactions should be executed through gnosis-safe user interface.",
						]}
					/>
				) : undefined}
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
