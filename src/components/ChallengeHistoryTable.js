import { Text, Flex, Table, Thead, Tr, Th, Td } from "@chakra-ui/react";
import {
	formatBNToDecimalCurr,
	formatDecimalToCurr,
	sliceAddress,
} from "../utils";

function ChallengeHistoryTable({ stakes }) {
	[].sort();
	console.log(stakes, " mkmk");
	stakes = stakes.sort(
		(a, b) => -1 * (a.donEscalationIndex - b.donEscalationIndex)
	);

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
				{stakes.map((obj, index) => (
					<Tr key={index}>
						<Td>{sliceAddress(obj.user.id)}</Td>
						<Td>{formatBNToDecimalCurr(obj.amount)}</Td>
						<Td>{obj.outcome === 1 ? "Yes" : "No"}</Td>
					</Tr>
				))}
			</Table>
			{stakes.length === 0 ? (
				<Flex justifyContent="center" padding={5}>
					<Text fontSize={10}>No Challenges</Text>
				</Flex>
			) : undefined}
		</Flex>
	);
}

export default ChallengeHistoryTable;
