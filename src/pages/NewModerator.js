import { ReactNode, useEffect, useRef, useState, Sty } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Input,
	Heading,
	Flex,
	Text,
	Box,
	useToast,
} from "@chakra-ui/react";
import {
	convertHoursToBlocks,
	retrieveOracleAddressFormLogs,
	updateModerator,
	stateSetupOraclesInfo,
	validateEscalationLimit,
	validateExpireHours,
	validateBufferHours,
	validateResolutionHours,
	validateFee,
	validateGroupName,
	validateUpdateMarketConfigTxInputs,
} from "./../utils";
import { useCreateNewOracle } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";

import addresses from "./../contracts/addresses.json";
import { useQueryOraclesByManager } from "./../hooks";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectOracleInfoObj, selectUserProfile } from "../redux/reducers";
import { addScaleCorrection } from "framer-motion";
import Loader from "../components/Loader";
import GroupDisplayName from "../components/GroupDisplayPanel";
import InputWithTitle from "../components/InputWithTitle";

/**
 * @note For the sake of simplicity, at least for now, oracles from UI have following constraints
 * 1. manager == delegate.
 * 2. Buffer blocks cannot be smaller than an hour
 * 3. Escalation limit cannot be zero
 */
function Page() {
	const { chainId, account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = userProfile && account;

	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { result: oraclesResult } = useQueryOraclesByManager(account);
	const { state, send } = useCreateNewOracle();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);

	const [oracleIds, setOracleIds] = useState([]);

	// input states
	const [fee, setFee] = useState("0.05");
	const [escalationLimit, setEscalationLimit] = useState(1);
	const [expireHours, setExpireHours] = useState(1);
	const [bufferHours, setBufferHours] = useState(1);
	const [resolutionHours, setResolutionHours] = useState(1);
	const [name, setName] = useState("");

	//	loading states
	const [createLoading, setCreateLoading] = useState(false);
	const [oraclesLoading, setLoadingOracles] = useState(true);

	// oracles result
	useEffect(async () => {
		if (oraclesResult.data == undefined) {
			return;
		}
		setLoadingOracles(true);

		const _oracleIds = oraclesResult.data.oracles.map((obj) => {
			return obj.id;
		});
		await stateSetupOraclesInfo(_oracleIds, dispatch);
		setOracleIds(_oracleIds);
		setLoadingOracles(false);
	}, [oraclesResult]);

	// handle metamask tx status
	useEffect(async () => {
		if (state.receipt) {
			const txHash = state.receipt.transactionHash;
			const oracleAddress = retrieveOracleAddressFormLogs(
				state.receipt.logs
			);
			const res = await updateModerator(oracleAddress, {
				name,
			});
			setCreateLoading(false);
			if (res != undefined) {
				toast({
					title: "Success!",
					status: "success",
					isClosable: true,
				});
				navigate(`/settings/pages/${res.moderator.oracleAddress}`);
			} else {
				toast({
					title: "Unknown Error!",
					status: "error",
					isClosable: true,
				});
			}
		}
	}, [state]);
	useState(() => {
		if (state.status === "Exception" || state.status === "Fail") {
			setCreateLoading(false);
			toast({
				title: "Metamask Error!",
				status: "error",
				isClosable: true,
			});
		}
	}, [state]);

	async function createModeratorHelper() {
		if (!isAuthenticated) {
			toast({
				title: "Please Sign In!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		if (!validateUpdateMarketConfigTxInputs(
			fee,
			escalationLimit,
			expireHours,
			bufferHours,
			resolutionHours
		).valid) {
			toast({
				title: "Invalid Input!",
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
			addresses.MemeToken,
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
		<Flex justifyContent="center" paddingTop="10">
			<Flex
				width="50%"
				justifyContent="center"
				alignItems="center"
				flexDirection="column"
				paddingRight={20}
				paddingLeft={20}
			>
				<Heading>New Group</Heading>
				{InputWithTitle(
					"Name",
					true,
					name,
					setName,
					validateGroupName,
					{}
				)}
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

				<Button
					loadingText="Processing..."
					isLoading={createLoading}
					onClick={createModeratorHelper}
				>
					Submit
				</Button>
			</Flex>
			<Flex width="20%" flexDirection="column">
				<Heading>Your existing groups</Heading>
				{oraclesLoading === true ? <Loader /> : undefined}
				{oracleIds.map((id) => {
					const group = oraclesInfoObj[id];
					if (group == undefined) {
						return;
					}

					return (
						<GroupDisplayName
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
