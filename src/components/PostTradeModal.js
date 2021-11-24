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
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import { useQueryMarketByMarketIdentifier } from "../hooks";

function PostTradeModal() {
	const dispatch = useDispatch();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);
	const marketsMetadata = useSelector(selectMarketsMetadata);
	const postTradeModalState = useSelector(selectPostTradeModalState);
	const marketIdentifier = postTradeModalState.marketIdentifier;

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(
		marketIdentifier
	);
	console.log(marketIdentifier, result, "marketIdentifier is here");
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
			<ModalContent paddingLeft={5} paddingRight={5} paddingTop={3}>
				<Flex
					paddingLeft={2}
					paddingRight={2}
					paddingTop={2}
					alignItems="center"
					borderBottomWidth={1}
					borderColor="#E0E0E0"
				>
					<Heading size="xl">Sign In</Heading>
					<Spacer />
					<CloseIcon marginRight={2} w={3} h={3} color="#0B0B0B" />
				</Flex>
			</ModalContent>
		</Modal>
	);
}

export default PostTradeModal;
