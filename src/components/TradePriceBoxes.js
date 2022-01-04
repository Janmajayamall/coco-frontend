import { Button, Box, Text, Flex, Spacer, Icon } from "@chakra-ui/react";
import {
	determineOutcome,
	formatBNToDecimal,
	formatDecimalToCurr,
	formatDecimalToPercentage,
	roundDecimalStr,
	roundValueTwoDP,
} from "../utils";
import InfoTip from "./InfoTip";

function TradePricesBoxes({
	market,
	tradePosition,
	outcomeChosen,
	onOutcomeChosen,
	...props
}) {
	function Panel({ outcome }) {
		return (
			<Flex
				margin={2}
				padding={2}
				style={
					outcomeChosen === outcome
						? {
								border: "2px",
								borderStyle: "solid",
								borderColor: "blue.400",
								backgroundColor: "#F3F5F7",
						  }
						: {
								backgroundColor: "#F3F5F7",
								border: "2px",
								borderStyle: "solid",
								borderColor: "transparent",
						  }
				}
				flexDirection="column"
				onClick={() => {
					if (onOutcomeChosen) {
						onOutcomeChosen(outcome);
					}
				}}
				borderRadius={5}
			>
				<Flex alignItems={"center"} marginBottom={2}>
					<Text
						style={{
							fontSize: 18,
							fontWeight: "bold",
						}}
					>
						{outcome === 1 ? "YES" : "NO"}
					</Text>
					<InfoTip
						style={{
							marginRight: 2,
							marginLeft: 2,
							height: 10,
							width: 10,
							color: "#6F6F6F",
						}}
						infoText={`Price of ${
							outcome === 1 ? "YES" : "NO"
						} share`}
					/>
					<Spacer />
					<Text
						style={{
							fontSize: 18,
							fontWeight: "bold",
						}}
					>{`${formatDecimalToCurr(
						outcome === 1
							? market.probability1
							: market.probability0
					)}`}</Text>
				</Flex>
				<Flex alignItems={"center"}>
					<Text
						style={{
							fontSize: 16,
						}}
					>
						You own
					</Text>
					<InfoTip
						style={{
							marginRight: 2,
							marginLeft: 2,
							height: 10,
							width: 10,
							color: "#6F6F6F",
						}}
						infoText={`Amount of ${
							outcome === 1 ? "YES" : "NO"
						} shares you own`}
					/>
					{/* <Box
						style={{
							borderWidth: 1,
							borderColor: "#6F6F6F",
							height: 0,
							width: "100%",
						}}
						bg="red.400" 
					/> */}
					<Spacer />
					<Text
						style={{
							fontSize: 16,
						}}
					>
						{`${formatBNToDecimal(
							outcome === 1
								? tradePosition.amount1
								: tradePosition.amount0
						)} Shares`}
					</Text>
				</Flex>
			</Flex>
		);
	}

	return (
		<Flex flexDirection="column" marginBottom="2" {...props}>
			<Panel outcome={1} />
			<Panel outcome={0} />
		</Flex>
	);
}
export default TradePricesBoxes;
