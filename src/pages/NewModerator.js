import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";
import { convertDaysToBlocks, retrieveOracleAddressFormLogs } from "./../utils";
import { useCreateNewModerator } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";

import addresses from "./../contracts/addresses.json";
import { useQueryOracleByDelegate } from "./../hooks";
function Page() {
	const { chainId, account } = useEthers();
	const { result, reexecuteQuery } = useQueryOracleByDelegate(account);
	const [fee, setFee] = useState(0.1);
	const [escalationLimit, setEscalationLimit] = useState(10);
	const [expireHours, setExpireHours] = useState(10);
	const [bufferHours, setBufferHours] = useState(10);
	const [resolutionHours, setResolutionHours] = useState(10);

	const { state, send } = useCreateNewModerator();

	useEffect(() => {
		if (state.receipt) {
			const txHash = state.receipt.transactionHash;
			const oracleAddress = retrieveOracleAddressFormLogs(
				state.receipt.logs
			);
			console.log(txHash, " Post added");
			console.log(oracleAddress, " Here it is");
		}
	}, [state]);

	async function createModeratorHelper() {
		// fee calc
		const feeNumerator = fee * 100;
		const feeDenominator = 100;

		// validation checks
		send(
			account,
			addresses.MemeToken,
			true,
			feeNumerator,
			feeDenominator,
			escalationLimit,
			convertDaysToBlocks(chainId, expireHours),
			convertDaysToBlocks(chainId, bufferHours),
			convertDaysToBlocks(chainId, resolutionHours)
		);
	}

	return (
		<>
			<NumberInput
				onChange={(val) => {
					setFee(val);
				}}
				defaultValue={0}
				precision={3}
			>
				<NumberInputField />
			</NumberInput>

			<NumberInput
				onChange={(val) => {
					setEscalationLimit(val);
				}}
				defaultValue={0}
				precision={0}
			>
				<NumberInputField />
			</NumberInput>

			<NumberInput
				onChange={(val) => {
					setExpireHours(val);
				}}
				defaultValue={0}
				precision={0}
			>
				<NumberInputField />
			</NumberInput>

			<NumberInput
				onChange={(val) => {
					setBufferHours(val);
				}}
				defaultValue={0}
				precision={0}
			>
				<NumberInputField />
			</NumberInput>

			<NumberInput
				onChange={(val) => {
					setResolutionHours(val);
				}}
				defaultValue={0}
				precision={0}
			>
				<NumberInputField />
			</NumberInput>

			<Button onClick={createModeratorHelper}>Submit</Button>
		</>
	);
}

export default Page;
