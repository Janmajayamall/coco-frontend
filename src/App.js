import "./App.css";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import PostDisplay from "./components/PostDisplay";
import NewPost from "./pages/NewPost";
import NewModerator from "./pages/_NewGroup";
import NewGroup from "./pages/NewGroup";
// import OracleConfig from "./pages/OracleConfig";
import Activity from "./pages/Activity";

import Feed from "./pages/Feed";
import Post from "./pages/Post";
import Pages from "./pages/Pages";
import GroupFeed from "./pages/GroupFeed";
import GroupSettings from "./pages/GroupSettings";
import YourGroups from "./pages/YourGroups";
import ChallengedFeed from "./pages/ChallengedFeed";
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
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
	Select,
} from "@chakra-ui/react";
import {
	AddIcon,
	ExternalLinkIcon,
	RepeatIcon,
	EditIcon,
	HamburgerIcon,
} from "@chakra-ui/icons";

import { useEthers } from "@usedapp/core/packages/core";
import {
	useCreateNewMarket,
	useQueryMarketsOrderedByLatest,
	useQueryExploreMarkets,
	useQueryBadMarketIdentifiers,
} from "./hooks";
import HeaderWarning from "./components/HeaderWarning";

import Web3 from "web3";
import { useEffect, useState } from "react";
import { getUser, findAllFollows, COLORS, findAllGroups } from "./utils";
import {
	sUpdateProfile,
	sUpdateGroupsFollowed,
	selectGroupsFollowed,
	selectUserProfile,
	sUpdateBadMarketIdentifiers,
} from "./redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Route, Routes, useNavigate } from "react-router";
import LoginModal from "./components/LoginModal";
import MainMenu from "./components/MainMenu";
import CocoFull from "./Coco-full.svg";
import { FireIcon } from "./components/FireIcon";
import { HomeIcon } from "./components/HomeIcon";

function App() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const location = useLocation();

	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;

	const [groups, setGroups] = useState([]);

	useEffect(async () => {
		let res = await getUser();
		if (res == undefined) {
			return;
		}
		dispatch(sUpdateProfile(res.user));

		res = await findAllFollows();
		if (res == undefined) {
			return;
		}
		dispatch(sUpdateGroupsFollowed(res.relations));
	}, [account]);

	// get bad market identifiers (the ones with outcone == 0)
	const {
		result: rBadMarketIdentifiers,
		reexecuteQuery,
	} = useQueryBadMarketIdentifiers(false);

	// whenever rBadMarketIdentifiers changes
	// update bad market identifiers obj
	// in redux state
	useEffect(() => {
		if (rBadMarketIdentifiers.data) {
			dispatch(
				sUpdateBadMarketIdentifiers({
					markets: rBadMarketIdentifiers.data.markets,
				})
			);
		}
	}, [rBadMarketIdentifiers]);

	// get all groups
	useEffect(async () => {
		const res = await findAllGroups();
		console.log(res, " Got all groups");
		if (res == undefined) {
			return;
		}
		setGroups(res.groups);
	}, []);

	console.log(process.env.NODE_ENV, " this is node ENV");
	console.log(process.env.REACT_APP_VERCEL_ENV, " this is node ENV VERCEL");
	return (
		<div>
			<HeaderWarning />
			<Flex
				borderBottom="1px"
				borderColor="#BDBDBD"
				backgroundColor={COLORS.PRIMARY}
			>
				<Flex
					style={{
						width: "100%",
						justifyContent: "center",
						alignItems: "center",
						height: 96,
					}}
				>
					<Flex
						style={{
							width: "100%",
							height: "100%",
							maxWidth: 1650,
							justifyContent: "center",
							alignItems: "center",
							paddingLeft: 5,
							paddingRight: 5,
						}}
					>
						<Image
							_hover={{ cursor: "pointer" }}
							src={CocoFull}
							width={150}
							onClick={() => {
								navigate("/");
							}}
						/>

						<Spacer />
						<Select
							onChange={(e) => {
								if (e.target.value == "") {
									navigate(`/explore`);
								} else {
									navigate(`/group/${e.target.value}`);
								}
							}}
							placeholder="Search Group"
							// value={safe}
							width={"20%"}
						>
							{groups.map((group) => {
								return (
									<>
										<option value={group.groupAddress}>
											{`${group.name}`}
										</option>
									</>
								);
							})}
						</Select>
						<Spacer />
						<Flex justifyContent="center" margin={5}>
							<IconButton
								onClick={() => {
									if (
										location.pathname == "/explore" ||
										location.pathname == "/"
									) {
										return;
									}
									navigate("/explore");
								}}
								style={
									location.pathname == "/explore" ||
									location.pathname == "/"
										? {
												border: "2px",
												borderStyle: "solid",
												borderColor: "blue.400",
												backgroundColor: "blue.400",
										  }
										: {
												backgroundColor: "#FDFDFD",
										  }
								}
								margin="1"
								icon={
									<FireIcon
										// fill={feedType == 0 ? "#FDFDFD" : "#0B0B0B"}
										fill={"#0B0B0B"}
										w={8}
										h={8}
									/>
								}
							/>

							{isAuthenticated == true ? (
								<IconButton
									onClick={() => {
										if (location.pathname == "/home") {
											return;
										}
										navigate("/home");
									}}
									borderRadius={10}
									style={
										location.pathname == "/home"
											? {
													border: "2px",
													borderStyle: "solid",
													borderColor: "blue.400",
													backgroundColor: "blue.400",
											  }
											: {
													backgroundColor: "#FDFDFD",
											  }
									}
									margin="1"
									icon={
										<HomeIcon
											fill={"#0B0B0B"}
											w={8}
											h={8}
										/>
									}
								/>
							) : undefined}
						</Flex>
						<Spacer />
						<ConnectButton />
						<MainMenu />
					</Flex>
				</Flex>
			</Flex>
			<LoginModal />
			<Flex width={"100%"}>
				<Spacer />
				<Flex width={"70%"}>
					<Routes>
						<Route path="/add" element={<NewPost />} />
						<Route path="/addGroup" element={<NewGroup />} />
						<Route path="/explore" element={<Feed />} />
						<Route path="/home" element={<Feed />} />
						<Route
							path="/challenged"
							element={<ChallengedFeed />}
						/>
						<Route path="/group/:groupId" element={<GroupFeed />} />
						<Route path="/" element={<Feed />} />
						<Route path="/post/:postId" element={<Post />} />
						<Route path="/groups" element={<YourGroups />} />
						<Route
							path="/settings/:groupId"
							element={<GroupSettings />}
						/>
						<Route path="/activity" element={<Activity />} />
					</Routes>
				</Flex>
				<Spacer />
			</Flex>
		</div>
	);
}

export default App;
