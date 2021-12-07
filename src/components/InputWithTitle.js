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
} from "@chakra-ui/react";

function InputWithTitle(
	title,
	isText,
	value,
	setValue,
	validationFn,
	inputOptions = {}
) {
	const { valid, expText } = validationFn(value);

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
			{isText === true ? (
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
				/>
			) : (
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
				>
					<NumberInputField />
				</NumberInput>
			)}
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
