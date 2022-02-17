import { Avatar, Box, Flex, Image, Spacer, Text, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
	COLORS,
	followGroup,
	formatBNToDecimalCurr,
	formatDecimalToPercentage,
	generateProfileInitials,
	sliceAddress,
} from "../utils";
import { sAddGroupFollow } from "./../redux/reducers";

function PostDisplay({ post, onImageClick, setRef, ...children }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [minHeightTrick, setMinHeightTrick] = useState(300);

	const postBody = post ? JSON.parse(post.body) : undefined;
	const group = post && post.group.length != 0 ? post.group[0] : undefined;

	if (!post || !group) {
		return <div />;
	}

	function actionOnPostClick() {
		navigate(`/post/${post.marketIdentifier}`);
	}

	return (
		<Box
			ref={setRef}
			{...children}
			backgroundColor={COLORS.PRIMARY}
			padding={4}
			borderRadius={5}
		>
			<Flex marginBottom={2} flexDirection={"column"}>
				<Flex marginBottom={1}>
					<Flex alignItems="center">
						<Avatar
							size="sm"
							name={generateProfileInitials(group.name)}
						/>
						<Text
							onClick={() => {
								navigate(`/group/${group.groupAddress}`);
							}}
							fontSize="15"
							marginLeft="2"
							color={"#4F4F4F"}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							{group.name}
						</Text>
					</Flex>
					<Spacer />
				</Flex>

				<Flex>
					<Text fontSize={14} fontWeight={"bold"}>{`By ${sliceAddress(
						post.creatorColdAddress
					)}`}</Text>
				</Flex>
			</Flex>
			<Flex flexDirection={"column"}>
				<Text
					onClick={actionOnPostClick}
					_hover={{
						cursor: "pointer",
					}}
					fontSize={25}
				>
					{postBody.title}
				</Text>
				{postBody.postType == 0 ? (
					<Flex
						onClick={actionOnPostClick}
						minHeight={minHeightTrick}
						maxHeight={500}
						// width={"100%"}
						justifyContent="center"
						_hover={{
							cursor: "pointer",
						}}
					>
						<Image
							loading={"eager"}
							onLoad={() => {
								setMinHeightTrick(0);
							}}
							fit="contain"
							src={postBody.imageUrl}
							alt="Failed to load image"
						/>
					</Flex>
				) : undefined}
				<Link href={postBody.link} isExternal>
					{postBody.link}
					<ExternalLinkIcon mx="2px" />
				</Link>
			</Flex>
		</Box>
	);
}

export default PostDisplay;
