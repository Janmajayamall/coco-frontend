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
	safeService,
	COLORS,
} from "../utils";
import {
	useCreateGroupWithSafe,
	useCreateNewOracle,
	useGetSafesAndGroupsManagedByUser,
	useQueryGroupsByManagers,
} from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { addresses } from "../contracts";

import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectOracleInfoObj, selectUserProfile } from "../redux/reducers";
import Loader from "../components/Loader";
import GroupDisplayName from "../components/GroupDisplayPanel";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getOwnedSafes } from "@gnosis.pm/safe-react-gateway-sdk";
import { ethers } from "ethers";
import HelpBox from "../components/HelpBox";
function Page() {
	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;
	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { send, state } = useCreateGroupWithSafe();

	// get safes & groups managed by the user
	const { safes, groupIds } = useGetSafesAndGroupsManagedByUser(account);

	// groups already managed by user
	const [groupsWithDetails, setGroupsWithDetails] = useState([]);
	const [groupsWithoutDetailsIds, setGroupsWithoutDetailsIds] = useState([]);

	// ui stafe
	const [step, setStep] = useState(0);

	// gnosis-safe
	const [safe, selectSafe] = useState(null);

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

	//	loading states
	const [createLoading, setCreateLoading] = useState(false);
	const [oraclesLoading, setLoadingOracles] = useState(true);

	// err states
	const [nameExists, setNameExists] = useState(false);

	const [nj, setnj] = useState(true);

	// whenever rGroupsByManagers changes
	// get groups details from the backend
	// and divide them into the following -
	// (1) With details (under groups)
	// (2) Without details (under pending groups)
	useEffect(async () => {
		if (groupIds.length != 0) {
			let res = await findGroupsByIdArr(groupIds);
			let groupsWithDetails = [];
			if (res != undefined) {
				groupsWithDetails = res.groups;
			}
			const groupsWithoutDetailsIds = groupIds.filter(
				(_id) => !groupsWithDetails.find((_g) => _g.groupAddress == _id)
			);
			setGroupsWithDetails(groupsWithDetails);
			setGroupsWithoutDetailsIds(groupsWithoutDetailsIds);
		}
	}, [groupIds]);

	// transitions step to 2 once group proxy contract is deployed
	useEffect(() => {
		if (state.status == "Success") {
			// get group address from tx receipt
			let groupAddress;
			state.receipt.events.forEach((event) => {
				if (
					event.address.toLowerCase() ==
					addresses.GroupProxyFactory.toLowerCase()
				) {
					groupAddress = event.args[0].toLowerCase();
				}
			});

			if (groupAddress == "") {
				// TODO throw error
				return;
			}

			setGroupAddress(groupAddress); // addresses are always small
			setStep(2);
		} else if (state.status == "Exception" || state.status == "Fail") {
			toast({
				title: "Metamask Err!",
				status: "error",
				isClosable: true,
			});
			return;
		}
	}, [state]);

	useEffect(() => {
		setNameExists(false);
	}, [name]);

	async function createGroupProxyHelper() {
		if (!isAuthenticated) {
			toast({
				title: "Please Sign In!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (
			!validateFee(feeDec).valid ||
			!validateDonBufferHours(donBufferHr).valid ||
			!validateResolutionBufferHours(resolutionBufferHr).valid ||
			!validateDonReservesLimit(donReservesLimitBN).valid ||
			safe == undefined ||
			safe == ""
		) {
			toast({
				title: "Invalid Input!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// create input
		const feeBN = parseDecimalToBN(feeDec);
		const donBufferSecs = parseHoursToSeconds(donBufferHr);
		const resolutionBufferSecs = parseHoursToSeconds(resolutionBufferHr);

		// group market config calldata
		const groupGlobalConfig = ethers.utils.defaultAbiCoder.encode(
			["bool", "uint64", "uint64", "uint64"],
			[true, feeBN, donBufferSecs, resolutionBufferSecs]
		);

		send(
			safe,
			addresses.GroupSingleton,
			addresses.WETH,
			donReservesLimitBN,
			groupGlobalConfig
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
			groupAddress == ""
		) {
			toast({
				title: "Invalid Input!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// check name uniqueness
		let res = await groupCheckNameUniqueness(name, groupAddress);
		if (res == undefined || res.isNameUnique === false) {
			setNameExists(true);
			toast({
				title: "Name already taken!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		res = await updateGroup(groupAddress, {
			name,
			description,
		});

		if (res == undefined) {
			// TODO throw error
			return;
		}

		// TODO navigate to group page
		navigate(`/group/${groupAddress}`);
	}

	return (
		<Flex width={"100%"}>
			<Flex width={"70%"} padding={5} flexDirection={"column"}>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					justifyContent="flex-start"
					alignItems={"center"}
					marginBottom={4}
				>
					{step != 0 ? (
						<ArrowBackIcon
							onClick={() => {
								setStep(step - 1);
							}}
							marginRight={2}
							w={5}
							h={5}
							color="#0B0B0B"
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						/>
					) : undefined}
					<Heading size="md">Create Group</Heading>
				</Flex>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					flexDirection={"column"}
					marginBottom={4}
				>
					{step == 0 ? (
						<>
							<Heading marginBottom={2} size="sm">
								Your safes
							</Heading>
							<Select
								onChange={(e) => {
									selectSafe(e.target.value);
								}}
								placeholder="Choose Safe"
								value={safe}
								marginBottom={1}
							>
								{safes.map((safe) => {
									return (
										<>
											<option value={safe}>
												{`${safe}`}
											</option>
										</>
									);
								})}
							</Select>
							<Link
								fontSize={15}
								href={
									"https://cocosafeapp.efprivacyscaling.org/app/"
								}
								isExternal
							>
								{
									"Don't have one? Create one before proceeding!"
								}
								<ExternalLinkIcon mx="2px" />
							</Link>
							<PrimaryButton
								marginTop={4}
								marginBottom={4}
								loadingText="Processing..."
								// isLoading={createLoading}
								onClick={() => {
									if (safe == undefined || safe == "") {
										return;
									}
									setStep(1);
								}}
								title="Next"
							/>
						</>
					) : undefined}
					{step == 1 ? (
						<>
							<Heading marginBottom={2} size="sm">
								Group configurations
							</Heading>
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
								"Max. Challenge Limit",
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
									createGroupProxyHelper();
								}}
								title="Next"
							/>
						</>
					) : undefined}
					{step == 2 ? (
						<>
							<Heading marginBottom={2} size="sm">
								Group details
							</Heading>
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
								isLoading={createLoading}
								onClick={updateGroupDetailsHelper}
								title="Submit"
							/>{" "}
						</>
					) : undefined}
				</Flex>
			</Flex>
			<Flex width={"30%"} paddingTop={5} flexDirection={"column"}>
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<Heading size="sm" marginBottom={2}>
						Your Groups
					</Heading>
					{groupsWithDetails.map((group, index) => {
						return (
							<GroupDisplayName
								key={index}
								group={group}
								followStatusVisible={false}
							/>
						);
					})}
				</Flex>
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<Heading size="sm" marginBottom={2}>
						Pending Groups
					</Heading>
					{groupsWithoutDetailsIds.map((id, index) => {
						return (
							<Text
								fontSize={14}
								_hover={{
									cursor: "pointer",
									textDecoration: "underline",
								}}
								onClick={() => {
									navigate(`/settings/${id}`);
								}}
							>
								{sliceAddress(id)}
							</Text>
						);
					})}
				</Flex>
				{step == 0 ? (
					<HelpBox
						heading={"Why is gnosis-safe required?"}
						pointsArr={[
							"Groups are expected to be governed by DAOs (or even a small group of people) rather than an individual. Thus to make governing decisions & coordination easier, a group is created under a gnosis-safe which is controlled by the governing DAO/group.",
						]}
					/>
				) : undefined}
				{step == 1 ? (
					<HelpBox
						heading={"What's?"}
						pointsArr={[
							"1. Fee - Fee charged by moderators as a product of amount put up for the losing outcome. Only applicable when they declare final outcome.",
							"2. Challenge Buffer period - Time period to challenge temporary outcome.",
							"3. Resolution period - Time period for moderators to declare final outcome, if needed.",
							"4. Max. Challenge limit  - Max. limit total amount put up in challenge rounds a post can reach. After which no more challenges are allowed and moderators will declare the final outcome.",
						]}
					/>
				) : undefined}
				<HelpBox
					heading={"What's a group?"}
					pointsArr={[
						"1. Groups are communities around a topics of interest.",
						"2. It's open to anyone and is loosely governed by a DAO.",
						"3. Group feeds are self moderated thru crypto-economic incentive of challenging posts that are irrelevant.",
						"4. Governing DAO is needed to make sure the group stays aligned with its goal and set necessary configurations.",
					]}
				/>
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
