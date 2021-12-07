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

function TwoColTitleInfo({ title, info, titleBold = false, ...props }) {
	return (
		<Flex {...props}>
			<Text fontSize="12" fontWeight={titleBold ? "bold" : "normal"}>
				{title}
			</Text>
			<Spacer />
			<Text fontSize="12">{info}</Text>
		</Flex>
	);
}
export default TwoColTitleInfo;
