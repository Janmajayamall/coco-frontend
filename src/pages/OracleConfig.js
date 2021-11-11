import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Input,
	Flex,
	Text,
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import { useSearchParams, useParams } from "react-router-dom";
import { useQueryOracleById } from "./../hooks";
import {
	toCheckSumAddress,
	getOracleDetails,
	updateModerator,
	findModerator,
} from "./../utils";

function Page() {
	const { account } = useEthers();
	const urlParams = useParams();
	const oracleAddress = urlParams.address;

	const [oracleDetails, setOracleDetails] = useState(undefined);
	const [oracleMetaData, setOracleMetaData] = useState(undefined);

	// oracle profile inputs
	const [name, setName] = useState("");

	useEffect(async () => {
		if (oracleAddress != undefined) {
			const oracleDetails = await getOracleDetails(oracleAddress);
			if (oracleDetails == undefined) {
				// TODO: throw error since oracle details aren't present
				console.log("Invalid Oracle");
				return;
			}
			setOracleDetails(oracleDetails);

			const oracleMetaData = await findModerator(
				toCheckSumAddress(oracleAddress)
			);
			console.log("oracleMetaData", oracleMetaData);
			setOracleMetaData(oracleMetaData);
		}
	}, [oracleAddress]);

	if (oracleDetails == undefined) {
		return <></>;
	}

	async function updateModeratorHelper() {
		const res = await updateModerator(toCheckSumAddress(oracleAddress), {
			name,
		});
		console.log("updatedMetadata", res);
		if (res == undefined) {
			// TODO: throw error
			return;
		}
		setOracleMetaData(res.moderator);
	}

	return (
		<Flex>
			<Text>{`id: ${oracleDetails.delegate}`}</Text>
			<Input
				placeholder="Name"
				onChange={(e) => {
					setName(e.target.value);
				}}
				value={name}
			/>
			<Button onClick={updateModeratorHelper}>Yooo</Button>
		</Flex>
	);
}

export default Page;
