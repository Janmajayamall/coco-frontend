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
} from "../utils";
import {
	useCreateGroupWithSafe,
	useCreateNewOracle,
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
function Page() {
	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;
	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);

	const { send, state } = useCreateGroupWithSafe();

	// groups already managed by user
	const [groupsWithDetails, setGroupsWithDetails] = useState([]);
	const [groupsWithoutDetailsIds, setGroupsWithoutDetailsIds] = useState([]);

	// ui stafe
	const [step, setStep] = useState(0);

	// gnosis-safe
	const [safes, setSafes] = useState([]);
	const [safe, selectSafe] = useState(null);

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

	// sget and set safes owned by user
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

	useEffect(() => {
		if (safes.length == 0) {
			return;
		}

		// get groups associated with safes (i.e. as manager) from graphql
		reexecuteGroupsByManagers();
	}, [safes]);

	// whenever rGroupsByManagers changes
	// get groups details from the backend
	// and divide them into the following -
	// (1) With details (under groups)
	// (2) Without details (under pending groups)
	useEffect(async () => {
		if (rGroupsByManagers && rGroupsByManagers.data) {
			const groupIds = rGroupsByManagers.data.groups.map(
				(group) => group.id
			);

			let res = await findGroupsByIdArr(groupIds);
			let groupsWithDetails = [];
			console.log(res, "res groups");
			if (res != undefined) {
				groupsWithDetails = res.groups;
			}
			const groupsWithoutDetailsIds = groupIds.filter(
				(_id) => !groupsWithDetails.find((_g) => _g.groupAddress == _id)
			);
			setGroupsWithDetails(groupsWithDetails);
			setGroupsWithoutDetailsIds(groupsWithoutDetailsIds);
		}
	}, [rGroupsByManagers]);

	// transitions step to 2 once group proxy contract is deployed
	useEffect(() => {
		console.log(state, " createGroupWithSafe");
		if (state.status == "Success") {
			// get group address from tx receipt
			let groupAddress;
			state.receipt.events.forEach((event) => {
				console.log(event);
				if (
					event.address.toLowerCase() ==
					addresses.GroupProxyFactory.toLowerCase()
				) {
					console.log("Yay grabbed it");
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

		console.log(
			feeBN,
			donBufferSecs,
			resolutionBufferSecs,
			donReservesLimitBN,
			groupGlobalConfig
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
		console.log(res);
		if (res == undefined) {
			// TODO throw error
			return;
		}

		// TODO navigate to group page
	}

	return (
		<Flex minHeight="100vh">
			<Spacer />
			<Flex
				width="50%"
				flexDirection="column"
				paddingRight={20}
				paddingLeft={20}
				paddingTop={10}
			>
				<Flex>
					{step != 0 ? (
						<ArrowBackIcon
							onClick={() => {
								setStep(step - 1);
							}}
							marginRight={5}
							w={5}
							h={5}
							color="#0B0B0B"
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						/>
					) : undefined}
					<Heading size="lg">Create Group</Heading>
				</Flex>
				{step == 0 ? (
					<>
						<Heading size="md">Your safes</Heading>
						<Select
							onChange={(e) => {
								selectSafe(e.target.value);
							}}
							placeholder="Choose Safe"
							value={safe}
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
						<Link href={"https://gnosis-safe.io/"} isExternal>
							{"Don't have one? Create one before proceeding!"}
							<ExternalLinkIcon mx="2px" />
						</Link>
						<PrimaryButton
							style={{
								marginTop: 20,
							}}
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
						<Heading size="lg">Group configurations</Heading>
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
								createGroupProxyHelper();
							}}
							title="Next"
						/>
					</>
				) : undefined}
				{step == 2 ? (
					<>
						<Heading size="lg">Group details</Heading>
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
			<Spacer />
			<Flex
				// borderRightWidth={1}
				borderLeftWidth={1}
				borderColor="#BDBDBD"
				width="25%"
				flexDirection="column"
				paddingTop={10}
				paddingLeft={5}
			>
				<Heading size="md" marginBottom={5}>
					Your Groups
				</Heading>
				{/* {oraclesLoading === true ? <Loader /> : undefined} */}
				{/* {oraclesLoading === false && oracleIds.length === 0 ? (
					<Flex>
						<Text fontSize={14} fontWeight="bold">
							You manage 0 groups
						</Text>
					</Flex> 
				) : undefined} */}
				{groupsWithDetails.map((group, index) => {
					return (
						<GroupDisplayName
							key={index}
							group={group}
							followStatusVisible={false}
						/>
					);
				})}
				<Heading size="md" marginTop={10}>
					Pending Groups
				</Heading>
				{/* {groupsWithoutDetailsIds.map((id, index) => {
					return <Text fontSize={}>{id}</Text>;
				})} */}
				<Flex backgroundColor="gray.100" borderRadius={5} padding={1}>
					{groupsWithoutDetailsIds.map((id, index) => {
						return (
							<Text
								fontSize={15}
								fontWeight={"bold"}
								_hover={{
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								{sliceAddress(id)}
							</Text>
						);
					})}
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
