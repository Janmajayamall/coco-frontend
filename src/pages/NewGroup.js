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
	validateBufferHours,
	validateResolutionHours,
	validateFee,
	validateGroupName,
	validateUpdateMarketConfigTxInputs,
	groupCheckNameUniqueness,
	validateGroupDescription,
} from "../utils";
import { useCreateNewOracle } from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { addresses } from "../contracts";
import { useQueryOraclesByManager } from "../hooks";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectOracleInfoObj, selectUserProfile } from "../redux/reducers";
import Loader from "../components/Loader";
import GroupDisplayName from "../components/GroupDisplayPanel";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import { ArrowBackIcon } from "@chakra-ui/icons";
function Page() {
	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { result: oraclesResult } = useQueryOraclesByManager(account);

	const oraclesInfoObj = useSelector(selectOracleInfoObj);

	const [oracleIds, setOracleIds] = useState([]);

	// TODO get and set safes owned by user

	// TODO once you get safes, get other groups managed by the safe
	// and divide the groups into 2 - (1) Safes with details (2) safe without details

	// ui stafe
	const [step, setStep] = useState(0);

	// gnosis-safe
	const [safe, selectSafe] = useState("null");

	// states for group configs
	const [fee, setFee] = useState("0.05");
	const [escalationLimit, setEscalationLimit] = useState(1);

	// states for group details
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	//	loading states
	const [createLoading, setCreateLoading] = useState(false);
	const [oraclesLoading, setLoadingOracles] = useState(true);

	// err states
	const [nameExists, setNameExists] = useState(false);

	useEffect(() => {
		setNameExists(false);
	}, [name]);

	async function createGroupHepler() {
		if (!isAuthenticated) {
			toast({
				title: "Please Sign In!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (
			(!validateGroupName(name).valid,
			!validateGroupDescription(description).valid)
		) {
			toast({
				title: "Invalid Input!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// check name uniqueness
		let res = await groupCheckNameUniqueness(name);
		if (res == undefined || res.isNameUnique === false) {
			setNameExists(true);
			toast({
				title: "Name already taken!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		res = await updateGroup("0x281984198203109310391", {
			name,
			description,
		});
		console.log(res);
		if (res == undefined) {
			// TODO throw error
			return;
		}
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
						>
							{[].map((obj) => {
								return (
									<>
										<option value={obj.safeAddress}>
											{`${obj.safeAddress}`}
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
								if (safe != undefined) {
									setStep(1);
								}
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
						<PrimaryButton
							style={{
								marginTop: 20,
							}}
							loadingText="Processing..."
							// isLoading={createLoading}
							onClick={() => {
								// TODO validate values
								setStep(2);
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
							onClick={createGroupHepler}
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
				{oraclesLoading === true ? <Loader /> : undefined}
				{oraclesLoading === false && oracleIds.length === 0 ? (
					<Flex>
						<Text fontSize={14} fontWeight="bold">
							You manage 0 groups
						</Text>
					</Flex>
				) : undefined}
				{oracleIds.map((id, index) => {
					const group = oraclesInfoObj[id];
					if (group == undefined) {
						return;
					}

					return (
						<GroupDisplayName
							key={index}
							group={group}
							followStatusVisible={false}
						/>
					);
				})}
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
