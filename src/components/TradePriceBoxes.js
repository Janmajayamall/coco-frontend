import { Button, Box, Text, Flex, Spacer } from "@chakra-ui/react";
import {
	determineOutcome,
	formatBNToDecimal,
	roundDecimalStr,
	roundValueTwoDP,
} from "../utils";

function TradePricesBoxes({
	market,
	tradePosition,
	outcomeChosen,
	onOutcomeChosen,
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
				<Flex>
					<Text>{outcome === 1 ? "YES" : "NO"}</Text>
					<Spacer />
					<Text>{`${roundDecimalStr(
						outcome === 1
							? market.probability1
							: market.probability0
					)}`}</Text>
				</Flex>
				<Flex>
					<Text fontSize={12} fontWeight={"bold"}>
						You own
					</Text>
					<Spacer />
					<Text fontSize={12} fontWeight={"bold"}>
						{formatBNToDecimal(
							outcome === 1
								? tradePosition.amount1
								: tradePosition.amount0
						)}
					</Text>
				</Flex>
			</Flex>
		);
	}

	return (
		<Flex marginTop="2" flexDirection="column" marginBottom="2">
			<Panel outcome={1} />
			<Panel outcome={0} />
		</Flex>
	);
}
export default TradePricesBoxes;
