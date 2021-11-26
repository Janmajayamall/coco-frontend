import { useDisclosure } from "@chakra-ui/hooks";
import { useDispatch, useSelector } from "react-redux";
import {
	selectPostTradeModalState,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdatePostTradeModal,
} from "../redux/reducers";
import {
	Button,
	Box,
	Text,
	Flex,
	Spacer,
	Switch,
	Heading,
	Image,
	Avatar,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalFooter,
	Lorem,
	Tabs,
	TabList,
	TabPanel,
	TabPanels,
	Tab,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import {
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
} from "../hooks";
import { roundValueTwoDP } from "../utils";

function PostTradeModal() {
	const dispatch = useDispatch();

	const { account } = useEthers();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const postTradeModalState = useSelector(selectPostTradeModalState);
	const marketIdentifier = postTradeModalState.marketIdentifier;

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(
		marketIdentifier,
		false
	);

	const {
		result: mSATResult,
		reexecuteQuery: mSATRexecuteQuery,
	} = useQueryMarketTradeAndStakeInfoByUser(
		marketIdentifier,
		account ? account.toLowerCase() : "",
		false
	);

	console.log(marketIdentifier, result, "marketIdentifier is here");
	console.log(mSATResult, " market stake and trade result");
	const [tabIndex, setTabIndex] = useState(0);

	if (!result.data || !mSATResult.data) {
		return <div />;
	}

	return (
		<Modal
			isOpen={
				postTradeModalState.isOpen == true &&
				postTradeModalState.marketIdentifier != undefined
			}
			onClose={() => {
				dispatch(
					sUpdatePostTradeModal({
						isOpen: false,
						marketIdentifier: undefined,
					})
				);
			}}
		>
			<ModalOverlay />
			<ModalContent>
				<Flex backgroundColor="#ffffff">
					<Image src={"https://bit.ly/2Z4KKcF"} />
					<Flex flexDirection="column">
						<Tabs
							backgroundColor={"#ffffff"}
							defaultIndex={0}
							isFitted
							variant="enclosed"
							onChange={(index) => {
								setTabIndex(index);
							}}
						>
							<TabList mb="1em">
								<Tab>Buy</Tab>
								<Tab>Sell</Tab>
							</TabList>
							<TabPanels>
								<TabPanel>
									<p>{`YES ${roundValueTwoDP(
										result.data.market.probability1
									)}`}</p>
									<p>{`NO ${roundValueTwoDP(
										result.data.market.probability0
									)}`}</p>
								</TabPanel>
								<TabPanel>
									<p>YES</p>
									<p>NO</p>
								</TabPanel>
							</TabPanels>
						</Tabs>
						<NumberInput placeholder="Amount">
							<NumberInputField />
						</NumberInput>
						<NumberInput placeholder="Slippage %">
							<NumberInputField />
						</NumberInput>
						<Text>Amount</Text>
						<Text>Max. potential profit</Text>
						<Button>
							<Text
								color="white"
								fontSize="md"
								fontWeight="medium"
								mr="2"
							>
								Buy
							</Text>
						</Button>
					</Flex>
				</Flex>
			</ModalContent>
		</Modal>
	);
}

export default PostTradeModal;
