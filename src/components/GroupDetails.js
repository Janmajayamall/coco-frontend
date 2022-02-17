import {
	Heading,
	Flex,
	Text,
	Box,
	useToast,
	Spacer,
	Link,
	Select,
	Avatar,
	Button,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	selectGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
} from "../redux/reducers";
import {
	COLORS,
	generateProfileInitials,
	numStrFormatter,
	followGroup,
	unfollowGroup,
} from "../utils";
import PrimaryButton from "./PrimaryButton";

function GroupDetails({ groupDetails, followButton }) {
	const groupsFollowed = useSelector(selectGroupsFollowed);
	const dispatch = useDispatch();

	if (groupDetails == undefined) {
		return <div />;
	}

	return (
		<Flex
			padding={2}
			backgroundColor={COLORS.PRIMARY}
			borderRadius={8}
			marginBottom={4}
			flexDirection={"column"}
		>
			<Flex marginBottom={1}>
				<Avatar
					size="md"
					name={generateProfileInitials(groupDetails.name)}
					marginRight={5}
				/>
				<Box marginRight={5}>
					<Text fontSize="md">
						{numStrFormatter(
							groupDetails.followCount
								? groupDetails.followCount
								: 0
						)}
					</Text>
					<Text fontSize="sm">members</Text>
				</Box>
				<Box marginRight={5}>
					<Text fontSize="md">
						{numStrFormatter(
							groupDetails.postCount ? groupDetails.postCount : 0
						)}
					</Text>
					<Text fontSize="sm">contributions</Text>
				</Box>
			</Flex>
			<Flex marginBottom={1}>
				<Text fontSize={15} fontWeight={"semibold"}>
					{groupDetails.name}
				</Text>
			</Flex>
			<Flex marginBottom={2}>
				<Text fontSize={15}>{groupDetails.description}</Text>
			</Flex>
			{followButton == true ? (
				groupsFollowed[groupDetails.groupAddress] !== true ? (
					<PrimaryButton
						onClick={async () => {
							const res = await followGroup(
								groupDetails.groupAddress
							);
							if (res == undefined) {
								return;
							}
							dispatch(
								sAddGroupFollow(groupDetails.groupAddress)
							);
						}}
						title="Join"
						width={"15%"}
					/>
				) : (
					<PrimaryButton
						onClick={async () => {
							const res = await unfollowGroup(
								groupDetails.groupAddress
							);
							if (res == undefined) {
								return;
							}
							dispatch(
								sDeleteGroupFollow(groupDetails.groupAddress)
							);
						}}
						title="Leave"
						width={"15%"}
					/>
				)
			) : undefined}
		</Flex>
	);
}

export default GroupDetails;
