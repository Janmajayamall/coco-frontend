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

function TradingInput({
	slippageValue,
	setSlippage,
	setInput,
	inputValue,
	setMaxSell,
	err,
	errText,
}) {
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
				{setMaxSell != undefined ? (
					<Flex>
						<Spacer />
						<Text
							onClick={setMaxSell}
							fontSize={12}
							textDecoration="underline"
						>
							Max
						</Text>
					</Flex>
				) : undefined}
			</NumberInput>
			{err === true ? (
				<Text
					marginTop="1"
					marginBottom="1"
					fontSize="10"
					fontWeight="bold"
					color="red.300"
				>
					{errText}
				</Text>
			) : undefined}
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
			{slippageValue < 1 ? (
				<Text
					marginTop="1"
					marginBottom="1"
					fontSize="10"
					fontWeight="bold"
					color="red.300"
				>{`We recommend slippage >= 1%`}</Text>
			) : undefined}
		</Flex>
	);
}
export default TradingInput;
