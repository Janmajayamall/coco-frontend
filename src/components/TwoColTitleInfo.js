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
import InfoTip from "./InfoTip";

function TwoColTitleInfo({
	title,
	info,
	helpText = "",
	titleBold = false,
	...props
}) {
	return (
		<Flex {...props} alignItems={"center"}>
			<Text fontSize="12" fontWeight={titleBold ? "bold" : "normal"}>
				{title}
			</Text>
			{helpText != "" ? (
				<InfoTip
					style={{
						height: 10,
						width: 10,
						color: "#6F6F6F",
						marginLeft: 4,
					}}
					infoText={helpText}
				/>
			) : undefined}
			<Spacer />
			<Text fontSize="12">{info}</Text>
		</Flex>
	);
}
export default TwoColTitleInfo;
