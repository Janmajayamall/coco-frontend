import { Button, Box, Text, Flex, Spacer } from "@chakra-ui/react";
import { determineOutcome, roundValueTwoDP } from "../utils";

function TradePricesBoxes({
	market,
	tradePosition,
	outcomeChosen,
	onOutcomeChosen,
}) {
	function OutcomeProbText({ outcome }) {
		console.log(outcome);
		const prob = roundValueTwoDP(
			market.stateMetadata.stage === 4
				? determineOutcome(market) === outcome
					? 1
					: 0
				: outcome == 1
				? market.probability1
				: market.probability0
		);
		return (
			<Text fontSize="15">{`${
				outcome === 1 ? "YES" : "NO"
			} ${prob}`}</Text>
		);
	}

	return (
		<Flex marginTop="2" marginBottom="2">
			<Spacer />
			<Flex flexDirection="column">
				<Box
					onClick={() => {
						if (onOutcomeChosen) {
							onOutcomeChosen(1);
						}
					}}
					backgroundColor="#C5E6DD"
					borderColor="#00EBA9"
					borderRadius={4}
					borderWidth={outcomeChosen == 1 ? 6 : 1}
					paddingLeft={18}
					paddingRight={18}
					justifyContent={"space-between"}
					alignItems={"center"}
				>
					<OutcomeProbText outcome={1} />
					{/* <Text fontSize="12" fontWeight="bold">{`${
					tradePosition ? roundValueTwoDP(tradePosition.amount1) : "0"
				} shares`}</Text> */}
				</Box>
				<Text>swa</Text>
			</Flex>

			<Spacer />
			<Box
				onClick={() => {
					if (onOutcomeChosen) {
						onOutcomeChosen(0);
					}
				}}
				backgroundColor="#E9CFCC"
				borderColor="#FF523E"
				borderRadius={4}
				borderWidth={outcomeChosen == 0 ? 6 : 1}
				paddingLeft={18}
				paddingRight={18}
				justifyContent={"space-between"}
				alignItems={"center"}
			>
				<OutcomeProbText outcome={0} />
				{/* <Text fontSize="15">{`YES ${roundValueTwoDP(
					market.stateMetadata.stage == 4
						? determineOutcome(market) == 1
							? 1
							: 0
						: market.probability1
				)}`}</Text> */}
			</Box>
			<Spacer />
		</Flex>
	);
}
export default TradePricesBoxes;
