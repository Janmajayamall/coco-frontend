import {
	Button,
	Box,
	Text,
	Flex,
	Tabs,
	TabList,
	TabPanel,
	TabPanels,
	Tab,
	NumberInput,
	NumberInputField,
	Table,
	TableCaption,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Tfoot,
	Spacer,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Slider,
} from "@chakra-ui/react";

function ChallengeHistoryTable({ stakeHistories }) {
	return (
		<Flex flexDirection="column">
			<Text>Past Challenges</Text>
			<Table size="sm">
				<Thead>
					<Tr>
						<Th>Challenge by</Th>
						<Th>Amount</Th>
						<Th>Outcome favored</Th>
					</Tr>
				</Thead>
				{stakeHistories.map((obj) => {
					<Tr>
						<Td>{obj.user.id}</Td>
						<Td>{obj.amountC}</Td>
						<Td>{obj.outcomeStaked}</Td>
					</Tr>;
				})}
			</Table>
		</Flex>
	);
}

export default ChallengeHistoryTable;
