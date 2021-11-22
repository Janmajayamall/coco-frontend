import "./App.css";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import NewPost from "./pages/NewPost";
import NewModerator from "./pages/NewModerator";
import OracleConfig from "./pages/OracleConfig";
import Explore from "./pages/Explore";
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
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { useCreateNewMarket, useQueryMarketsOrderedByLatest } from "./hooks";
import HeaderWarning from "./components/HeaderWarning";

import Web3 from "web3";
import { useEffect, useState } from "react";
import {
	newPost,
	updateModerator,
	toCheckSumAddress,
	getUser,
	findAllFollows,
	getPopularModerators,
	filterOraclesFromMarketsGraph,
	findModeratorsByIdArr,
} from "./utils";
import { sUpdateProfile, sUpdateOraclesInfoObj } from "./redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router";

const web3 = new Web3();

function App() {
	const navigate = useNavigate();

	const dispatch = useDispatch();

	const { account, chainId } = useEthers();
	const { state, send } = useCreateNewMarket();

	const { result, reexecuteQuery } = useQueryMarketsOrderedByLatest();
	console.log(result, " it is here");

	const imageUrl = "12dddwijijwwai12121o";
	const moderatorAddress = "0x3A8ed689D382Fe98445bf73c087A2F6102B75ECe";

	useEffect(async () => {
		var res = await getUser();
		if (res != undefined) {
			dispatch(sUpdateProfile(res.user));
		}
		res = await findAllFollows();
		console.log(res, "findAllFollows");
	}, []);

	useEffect(async () => {
		if (state.receipt) {
			const txHash = state.receipt.transactionHash;
			await newPost(txHash, imageUrl);
		}
	}, [state]);

	useEffect(async () => {
		if (result.data && result.data.markets) {
			const oracleIds = filterOraclesFromMarketsGraph(
				result.data.markets
			);
			const res = await findModeratorsByIdArr(oracleIds);
			dispatch(sUpdateOraclesInfoObj(res.moderators));
		}
	}, [result]);

	async function trial() {
		const signature =
			"0xd63257c295c23cd9c2fa54f6f860391115ee46a60e91a23fc29e7f671f77a7b40726dc2d7903974343cc6026f98196fa112404d3463d0d98d0ae20a7d3b3468b1b";

		const address = web3.eth.accounts.recover(
			JSON.stringify({
				hotAddress: "0xdcC73E699F5A910AE90947a76f75e0C2732aff40",
				accountNonce: 1,
			}),
			signature
		);
		console.log(address);
	}

	async function trial2() {
		await newPost(
			"0xfe24612d943c9c92f4f111bfea62a73fdb02fdb1d398f8ead024f5c4af0140d1",
			imageUrl
		);
	}

	async function trial3() {
		await updateModerator(toCheckSumAddress(moderatorAddress), {
			name: "User 1",
		});
	}

	function Post() {
		return (
			<Box>
				<Flex paddingBottom={3} paddingTop={4}>
					<Flex alignItems="center">
						<Avatar
							size="sm"
							name="Dan Abrahmov"
							src="https://bit.ly/dan-abramov"
						/>
						<Heading marginLeft={2} size="xs">
							Groupname
						</Heading>
					</Flex>
					<Spacer />
					<Text>dwa</Text>
				</Flex>
				<Image src={"https://bit.ly/2Z4KKcF"} />
			</Box>
		);
	}

	return (
		<div>
			<HeaderWarning />
			<Flex borderBottom="1px" borderColor="#BDBDBD">
				<Flex
					style={{
						paddingRight: 224,
						paddingLeft: 224,
						width: "100%",
						justifyContent: "center",
						alignItems: "center",
						height: 96,
					}}
				>
					<Heading>Mimi</Heading>
					<Spacer />
					<ConnectButton />
					<LoginButton />
				</Flex>
			</Flex>
			<Routes>
				<Route path="/add" element={<NewPost />} />
				<Route path="/addModerator" element={<NewModerator />} />
				<Route path="/oracle/:address" element={<OracleConfig />} />
				<Route path="/explore" element={<Explore />} />
				<Route
					path="/"
					element={
						<div
							style={{
								paddingRight: 208,
								paddingLeft: 208,
							}}
						>
							<Flex>
								<Flex
									width={268}
									height={100}
									backgroundColor="yellow.300"
								></Flex>
								<Flex
									flexDirection="column"
									width={600}
									paddingRight={21}
									paddingLeft={21}
									backgroundColor="yellow.400"
								>
									<Post />
									<Post />
									<Post />
									<Post />
								</Flex>
								<Flex
									width={368}
									height={100}
									backgroundColor="yellow.900"
									paddingRight={6}
									paddingLeft={6}
									paddingTop={5}
									flexDirection="column"
								>
									<Heading size="md" marginBottom={5}>
										Explore Groups
									</Heading>
									<Flex>
										<Text>daiwodja</Text>
										<Spacer />
										<Button size="sm">daow</Button>
									</Flex>
								</Flex>
							</Flex>
						</div>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
