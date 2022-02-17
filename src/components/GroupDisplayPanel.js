import {
	Button,
	Text,
	Flex,
	Spacer,
	Avatar,
	IconButton,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { followGroup, unfollowGroup, generateProfileInitials } from "../utils";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

function GroupDisplayName({ group, followStatusVisible, settingsVisible }) {
	const navigate = useNavigate();
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const dispatch = useDispatch();

	return (
		<Flex marginTop={1} alignItems="center">
			<Avatar size="sm" name={generateProfileInitials(group.name)} />
			<Text
				onClick={() => {
					navigate(`/group/${group.groupAddress}`);
				}}
				fontSize="14"
				fontWeight="bold"
				marginLeft="2"
				color={"#4F4F4F"}
				_hover={{ cursor: "pointer", textDecoration: "underline" }}
			>
				{group.name}
			</Text>
			<Spacer />
			{followStatusVisible === true ? (
				groupsFollowed[group.groupAddress] !== true ? (
					<Button
						onClick={async () => {
							const res = await followGroup(group.groupAddress);
							if (res == undefined) {
								return;
							}
							dispatch(sAddGroupFollow(group.groupAddress));
						}}
						width={12}
					>
						<Text fontSize={12}>Join</Text>
					</Button>
				) : (
					<Button
						onClick={async () => {
							const res = await unfollowGroup(group.groupAddress);
							if (res == undefined) {
								return;
							}
							dispatch(sDeleteGroupFollow(group.groupAddress));
						}}
						width={12}
					>
						<Text fontSize={12}>Leave</Text>
					</Button>
				)
			) : undefined}
			{settingsVisible === true ? (
				<IconButton
					onClick={() => {
						navigate(`/settings/${group.groupAddress}`);
					}}
					backgroundColor="#0B0B0B"
					size={"sm"}
					aria-label="Search database"
					icon={<SettingsIcon color="#FDFDFD" />}
					marginRight={5}
				/>
			) : undefined}
		</Flex>
	);
}

export default GroupDisplayName;
