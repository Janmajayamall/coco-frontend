import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Input,
} from "@chakra-ui/react";
import {
	convertHoursToBlocks,
	retrieveOracleAddressFormLogs,
	updateModerator,
	toCheckSumAddress,
} from "./../utils";
import { useCreateNewOracle } from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";

import addresses from "./../contracts/addresses.json";
import { useQueryOracleByDelegate } from "./../hooks";
function Page() {
	const { chainId, account } = useEthers();
	const { result, reexecuteQuery } = useQueryOracleByDelegate(account);
	const [fee, setFee] = useState(0.1);
	const [escalationLimit, setEscalationLimit] = useState(5);
	const [expireHours, setExpireHours] = useState();
	const [bufferHours, setBufferHours] = useState(10);
	const [resolutionHours, setResolutionHours] = useState(10);
	const [name, setName] = useState("");

	const { state, send } = useCreateNewOracle();

	useEffect(async () => {
		if (state.receipt) {
			const txHash = state.receipt.transactionHash;
			const oracleAddress = retrieveOracleAddressFormLogs(
				state.receipt.logs
			);
			const res = await updateModerator(oracleAddress, {
				name,
			});
			console.log(res, " moderator updated");
		}
	}, [state]);

	async function createModeratorHelper() {
		// await updateModerator("0xb9181365C266cD4e361a455567B77a16bd8044a8", {
		// 	name: "Oracle 1",
		// });
		// return;

		// fee calc
		const feeNumerator = fee * 100;
		const feeDenominator = 100;

		// validation checks
		send(
			account,
			account,
			addresses.MemeToken,
			true,
			1,
			10,
			5,
			convertHoursToBlocks(chainId, 0.1),
			convertHoursToBlocks(chainId, 1),
			convertHoursToBlocks(chainId, 0.2)
		);
	}

	return (
		<>
			<Input
				placeholder="Name"
				onChange={(e) => {
					setName(e.target.value);
				}}
				value={name}
			/>
			<NumberInput
				onChange={(val) => {
					setFee(val);
				}}
				defaultValue={0}
				precision={3}
				value={fee}
				max={100}
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
