import { Button, Box, Text, Flex, Spacer } from "@chakra-ui/react";
import { roundValueTwoDP } from "../utils";

function TradePricesBoxes({
	market,
	tradePosition,
	outcomeChosen,
	onOutcomeChosen,
}) {
	return (
		<Flex marginTop="2" marginBottom="2">
			<Spacer />
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
				<Text fontSize="15">{`YES ${roundValueTwoDP(
					market.probability1
				)}`}</Text>
				<Text fontSize="12" fontWeight="bold">{`${
					tradePosition ? roundValueTwoDP(tradePosition.amount1) : "0"
				} shares`}</Text>
			</Box>
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
				<Text fontSize="15">{`NO ${roundValueTwoDP(
					market.probability0
				)}`}</Text>
				<Text fontSize="12" fontWeight="bold">{`${
					tradePosition ? roundValueTwoDP(tradePosition.amount0) : "0"
				} shares`}</Text>
			</Box>
			<Spacer />
		</Flex>
	);
}
export default TradePricesBoxes;
