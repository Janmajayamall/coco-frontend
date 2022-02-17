import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
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
						<Item
							onClick={() => {
								navigate("/groups");
							}}
							title={"Your groups"}
						/>
						<Item
							onClick={() => {
								navigate("/addGroup");
							}}
							title={"Create New Group"}
						/>
						<Item
							onClick={() => {
								navigate("/activity");
							}}
							title={"Your activity"}
						/>
						<Item
							onClick={() => {
								localStorage.removeItem("hotPvKey");
								localStorage.removeItem("keySignature");
								window.location.reload();
							}}
							title={"Logout"}
						/>
					</>
				) : undefined}
			</MenuList>
		</Menu>
	);
}

export default MainMenu;
