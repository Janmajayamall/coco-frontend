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
	InputRightAddon,
	InputRightElement,
	HStack,
} from "@chakra-ui/react";
import { CURR_SYMBOL } from "../utils";
import InfoTip from "./InfoTip";

function TradingInput({
	slippageValue,
	setSlippage,
	setInput,
	inputValue,
	setMaxSell,
	err,
	errText,
	isBuy,
}) {
	return (
		<Flex marginTop="2" marginBottom="2" flexDirection="column">
			<HStack>
				<NumberInput
					onChange={(val) => {
						setInput(val);
					}}
					fontSize={14}
					placeholder="Amount"
					value={inputValue}
				>
					<NumberInputField />
				</NumberInput>
				<Text fontSize={14}>
					{isBuy === true ? `${CURR_SYMBOL}` : "Shares"}
				</Text>
				{setMaxSell != undefined ? (
					<Text
						onClick={setMaxSell}
						fontSize={14}
						textDecoration="underline"
					>
						Max
					</Text>
				) : undefined}
			</HStack>
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
			<Flex alignItems={"center"}>
				<Text
					marginTop="1"
					marginBottom="1"
					fontSize="10"
					fontWeight="bold"
				>{`${slippageValue}% slippage`}</Text>
				<InfoTip
					style={{
						height: 10,
						width: 10,
						marginLeft: 5,
						color: "#6F6F6F",
					}}
					infoText={
						"Slippage prevents your transaction from executing at unfavorable price caused by other orders."
					}
				/>
			</Flex>
			<Slider
				onChange={(val) => {
					setSlippage(val);
				}}
				value={slippageValue}
				min={0}
				max={5}
				step={0.5}
			>
				<SliderTrack>
					<Box position="relative" right={10} />
					<SliderFilledTrack backgroundColor="#828282" />
				</SliderTrack>
				<SliderThumb boxSize={4} backgroundColor="#828282" />
			</Slider>
			{slippageValue < 0.5 ? (
				<Text
					marginTop="1"
					marginBottom="1"
					fontSize="10"
					fontWeight="bold"
					color="#EB5757"
				>{`We recommend slippage of at least 0.5%`}</Text>
			) : undefined}
		</Flex>
	);
}
export default TradingInput;
