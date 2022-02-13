import { useEffect, useState } from "react";
import { Heading, Flex, Text, Box, useToast, Spacer } from "@chakra-ui/react";
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

function Page() {
	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { result: oraclesResult } = useQueryOraclesByManager(account);

	const { state, send } = useCreateNewOracle();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);

	const [oracleIds, setOracleIds] = useState([]);

	// input states
	const [name, setName] = useState("");
    onst[description, setDescription] = useState("");

	//	loading states
	const [createLoading, setCreateLoading] = useState(false);
	const [oraclesLoading, setLoadingOracles] = useState(true);

	// err states
	const [nameExists, setNameExists] = useState(false);


	useEffect(() => {
		setNameExists(false);
	}, [name]);

	async function createModeratorHelper() {
		if (!isAuthenticated) {
			toast({
				title: "Please Sign In!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (
			!validateUpdateMarketConfigTxInputs(
				fee,
				escalationLimit,
				expireHours,
				bufferHours,
				resolutionHours
			).valid ||
			!validateGroupName(name).valid
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

		// fee calc
		const feeNumerator = Number(fee) * 1000;
		const feeDenominator = 1000;

		setCreateLoading(true);

		send(
			account,
			account,
			addresses.WETH,
			true,
			feeNumerator,
			feeDenominator,
			Number(escalationLimit),
			convertHoursToBlocks(chainId, Number(expireHours)),
			convertHoursToBlocks(chainId, Number(bufferHours)),
			convertHoursToBlocks(chainId, Number(resolutionHours))
		);
	}

	return (
		<Flex minHeight="100vh">
			<Spacer />
			<Flex
				width="50%"
				alignItems="center"
				flexDirection="column"
				paddingRight={20}
				paddingLeft={20}
				paddingTop={10}
			>
				<Heading size="lg">New Group</Heading>
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
					onClick={createModeratorHelper}
					title="Submit"
				/>
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
