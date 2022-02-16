import { Avatar, Box, Flex, Image, Spacer, Text, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
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

	return (
		<Box ref={setRef} {...children}>
			<Flex flexDirection={"column"} paddingBottom={3} paddingTop={4}>
				<Flex paddingBottom={1}>
					<Flex alignItems="center">
						<Avatar
							size="sm"
							name={generateProfileInitials(group.name)}
						/>
						<Text
							// onClick={() => {
							// 	navigate(`/group/${market.oracle.id}`);
							// }}
							fontSize="16"
							fontWeight="bold"
							marginLeft="2"
							color={"#4F4F4F"}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							{group.name}
						</Text>
						{/* {market.following === false ? (
							<>
								<Text
									fontSize="20"
									fontWeight="bold"
									marginLeft="3"
								>
									·
								</Text>
								<Text
									onClick={async () => {
										if (market.following === true) {
											return;
										}
										const res = await followGroup(
											market.oracle.id
										);

										if (res == undefined) {
											return;
										}
										dispatch(
											sAddGroupFollow(market.oracle.id)
										);
									}}
									fontSize="16"
									fontWeight="bold"
									marginLeft="3"
								>
									Join
								</Text>
							</>
						) : undefined} */}
					</Flex>
					<Spacer />
				</Flex>

				<Flex paddingLeft={2}>
					<Text fontSize={14} color="#4F4F4F">{`By ${sliceAddress(
						post.creatorColdAddress
					)}`}</Text>
				</Flex>
			</Flex>
			<Flex flexDirection={"column"}>
				<Text fontSize={30}>{postBody.title}</Text>
				{postBody.postType == 0 ? (
					<Flex
						// onClick={() => {
						// 	if (onImageClick != undefined) {
						// 		onImageClick(market.marketIdentifier);
						// 	}
						// }}
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
