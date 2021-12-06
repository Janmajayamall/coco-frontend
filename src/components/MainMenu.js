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
} from "@chakra-ui/react";
import {
	AddIcon,
	ExternalLinkIcon,
	RepeatIcon,
	EditIcon,
	HamburgerIcon,
} from "@chakra-ui/icons";
import { useEthers } from "@usedapp/core/packages/core";
import { useSelector } from "react-redux";
import { selectUserProfile } from "../redux/reducers";
import { useQueryOraclesByManager } from "../hooks";
import { useNavigate } from "react-router";

function Item({ title, ...children }) {
	return (
		<MenuItem
			textColor="#FDFDFD"
			_hover={{
				backgroundColor: "gray.700",
			}}
			{...children}
		>
			{title}
		</MenuItem>
	);
}

function MainMenu() {
	const { account } = useEthers();
	const userProfile = useSelector(selectUserProfile);
	const isAuthenticated = account && userProfile ? true : false;
	const navigate = useNavigate();

	const { result: oraclesResult } = useQueryOraclesByManager(account);

	return (
		<Menu>
			<MenuButton
				backgroundColor="#0B0B0B"
				_hover={{
					backgroundColor: "gray.700",
				}}
				as={IconButton}
				aria-label="Options"
				icon={<HamburgerIcon color="#FDFDFD" />}
				variant="outline"
			/>
			<MenuList backgroundColor="#0B0B0B">
				{isAuthenticated ? (
					<>
						{oraclesResult.data &&
						oraclesResult.data.oracles.length !== 0 ? (
							<Item
								onClick={() => {
									navigate("/groups");
								}}
								title={"Your groups"}
							/>
						) : undefined}
						<Item
							onClick={() => {
								navigate("/addModerator");
							}}
							title={"Create New Group"}
						/>
						<Item
							onClick={() => {
								navigate("/activity");
							}}
							title={"Your activity"}
						/>
						<Item title={"Logout"} />
					</>
				) : undefined}
				<Item title={"Guide"} />
			</MenuList>
		</Menu>
	);
}

export default MainMenu;
