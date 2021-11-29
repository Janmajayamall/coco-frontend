import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { formatEther } from "@ethersproject/units";
import { utils } from "ethers";
import {
	createHotAccount,
	getAccountNonce,
	loginUser,

	getUser,
} from "./../utils";
import { useEthers } from "@usedapp/core/packages/core";
import { selectUserProfile } from "./../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { sUpdateProfile } from "./../redux/reducers";
import { useEffect, useState } from "react";

function SuggestionBar() {
	const [suggestions, setSuggestions] = useState([]);
	useEffect(() => {
		// get suggestions & display them
	});

	return (
		<Flex>
			<Text>djaoijwdaoi</Text>
			<Text>djaoijwdaoi</Text>
			<Text>djaoijwdaoi</Text>
			<Text>djaoijwdaoi</Text>
			<Text>djaoijwdaoi</Text>
		</Flex>
	);
}

export default LoginButton;
