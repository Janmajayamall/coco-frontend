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

function TradingInput({ slippageValue, setSlippage, setInput, inputValue }) {
	return (
		<Flex marginTop="2" marginBottom="2" flexDirection="column">
			<NumberInput
				onChange={(val) => {
					setInput(val);
				}}
				placeholder="Amount"
				value={inputValue}
			>
				<NumberInputField />
			</NumberInput>
			<Text
				marginTop="1"
				marginBottom="1"
				fontSize="10"
				fontWeight="bold"
			>{`${slippageValue}% slippage`}</Text>
			<Slider
				onChange={(val) => {
					setSlippage(val);
				}}
				value={slippageValue}
				min={0}
				max={5}
				step={0.5}
			>
				<SliderTrack bg="red.100">
					<Box position="relative" right={10} />
					<SliderFilledTrack bg="tomato" />
				</SliderTrack>
				<SliderThumb boxSize={4} />
			</Slider>
		</Flex>
	);
}
export default TradingInput;
