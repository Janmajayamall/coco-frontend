import { ReactNode, useEffect, useRef, useState, Sty } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Input,
	Heading,
	Flex,
	Text,
	Box,
	useToast,
	HStack,
} from "@chakra-ui/react";
import { CURR_SYMBOL, ZERO_BN } from "../utils";

function InputWithTitle(
	title,
	inputType,
	value,
	rValue,
	setValue,
	validationFn,
	inputOptions = {},
	userBalance = ZERO_BN,
	symbol = undefined
) {
	const { valid, expText } = validationHelper();

	function validationHelper() {
		let res = {
			valid: false,
			expText: "Invalid input type",
		};
		if (inputType == 0 || inputType == 1) {
			res = validationFn(rValue);
		}
		if (inputType == 2) {
			res = validationFn(rValue, userBalance);
		}

		return res;
	}

	return (
		<Flex
			style={{
				flexDirection: "column",
				width: "100%",
			}}
		>
			<Text
				style={{
					width: "100%",
					marginTop: 5,
				}}
			>
				{title}
			</Text>
			{inputType === 0 ? (
				<HStack>
					<Input
						{...inputOptions}
						style={{
							width: "100%",
							marginTop: 5,
						}}
						placeholder={title}
						onChange={(e) => {
							setValue(e.target.value);
						}}
						value={value}
						fontSize={14}
					/>
					{symbol != undefined ? (
						<Text fontSize={14}>{`${symbol}`}</Text>
					) : undefined}
				</HStack>
			) : undefined}
			{inputType === 1 || inputType === 2 ? (
				<HStack>
					<NumberInput
						{...inputOptions}
						style={{
							width: "100%",
							marginTop: 5,
						}}
						onChange={(val) => {
							setValue(val);
						}}
						value={value}
						fontSize={14}
					>
						<NumberInputField />
					</NumberInput>
					{symbol != undefined ? (
						<Text fontSize={14}>{`${symbol}`}</Text>
					) : undefined}
				</HStack>
			) : undefined}
			{valid === false ? (
				<Text
					style={{
						fontSize: 12,
						color: "#EB5757",
					}}
				>
					{expText}
				</Text>
			) : undefined}
		</Flex>
	);
}

export default InputWithTitle;
