import { Text, Flex, Table, Thead, Tr, Th, Td } from "@chakra-ui/react";
import { sliceAddress } from "../utils";

function ChallengeHistoryTable({ stakeHistories }) {
	return (
		<Flex marginTop={5} flexDirection="column">
			<Text fontSize={16} fontWeight={"bold"}>
				Past Challenges
			</Text>
			<Table size="sm">
				<Thead>
					<Tr>
						<Th>Challenger</Th>
						<Th>Amount</Th>
						<Th>Outcome favored</Th>
					</Tr>
				</Thead>
				{stakeHistories.map((obj) => (
					<Tr>
						<Td>{sliceAddress(obj.user.id)}</Td>
						<Td>{obj.amountC}</Td>
						<Td>{obj.outcomeStaked === "1" ? "Yes" : "No"}</Td>
					</Tr>
				))}
			</Table>
			<Flex justifyContent="center" padding={5}>
				<Text fontSize={10}>No Challenges</Text>
			</Flex>
		</Flex>
	);
}

export default ChallengeHistoryTable;
