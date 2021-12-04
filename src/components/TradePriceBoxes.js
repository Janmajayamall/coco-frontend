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
				backgroundColor={
					outcomeChosen === outcome ? "blue.500" : "blue.100"
				}
				flexDirection="column"
				onClick={() => {
					if (onOutcomeChosen) {
						onOutcomeChosen(outcome);
					}
				}}
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
					<Text>You own</Text>
					<Spacer />
					<Text>
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
