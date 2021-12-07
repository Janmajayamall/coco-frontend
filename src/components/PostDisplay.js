import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Avatar, Box, Flex, Image, Spacer, Text } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
	followModerator,
	marketStageDisplayName,
	roundDecimalStr,
} from "../utils";
import { sAddGroupFollow } from "./../redux/reducers";

function PostDisplay({ market, onImageClick, ...children }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	if (!market || !market.oracleInfo) {
		return <div />;
	}

	let id = new Date().getTime();

	return (
		<Box {...children}>
			<Flex paddingBottom={3} paddingTop={4}>
				<Flex alignItems="center">
					<Avatar
						size="sm"
						name={market.oracleInfo.name[0]}
						src={market.oracleInfo.groupImageUrl}
					/>
					<Text
						onClick={() => {
							navigate(`/group/${market.oracle.id}`);
						}}
						fontSize="14"
						fontWeight="bold"
						marginLeft="2"
						color={"#4F4F4F"}
					>
						{market.oracleInfo.name}
					</Text>

					{market.following === false ? (
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
									const res = await followModerator(
										market.oracle.id
									);

									if (res == undefined) {
										return;
									}
									dispatch(sAddGroupFollow(market.oracle.id));
								}}
								fontSize="14"
								fontWeight="bold"
								marginLeft="3"
							>
								Join
							</Text>
						</>
					) : undefined}
				</Flex>
				<Spacer />
				<Flex
					backgroundColor="#F3F5F7"
					alignItems="center"
					paddingLeft={3}
					paddingRight={3}
					borderRadius={5}
				>
					<Text>
						{marketStageDisplayName(market.optimisticState.stage)}
					</Text>
				</Flex>
			</Flex>
			<Flex
				onClick={() => {
					if (onImageClick != undefined) {
						onImageClick(market.marketIdentifier);
					}
				}}
				maxWidth={"100%"}
				maxHeight={500}
				justifyContent="center"
			>
				<Image
					loading={"eager"}
					src={
						market.marketMetadata &&
						market.marketMetadata.eventIdentifierStr
							? market.marketMetadata.eventIdentifierStr
							: ""
					}
					// fallbackSrc={
					// 	"https://www.aroged.com/wp-content/uploads/2021/08/Where-to-Find-Good-Wallpapers-for-Xbox-One-or-Xbox.jpg"
					// }
					alt="Failed to load image"
				/>
			</Flex>
			<Flex marginTop={5}>
				<Spacer />
				<Flex
					backgroundColor="#C5E6DD"
					borderColor="#00EBA9"
					borderRadius={4}
					borderWidth={1}
					paddingLeft={3}
					paddingRight={3}
					marginRight={2}
					justifyContent={"space-between"}
					alignItems={"center"}
					height={8}
				>
					<TriangleUpIcon
						marginRight={2}
						w={3}
						h={3}
						color="#0B0B0B"
					/>
					<Text>{roundDecimalStr(market.probability1)}</Text>
				</Flex>
				<Flex
					backgroundColor="#E9CFCC"
					borderColor="#FF523E"
					borderRadius={4}
					borderWidth={1}
					paddingLeft={15}
					paddingRight={15}
					marginRight={2}
					justifyContent={"space-between"}
					alignItems={"center"}
				>
					<TriangleDownIcon
						marginRight={2}
						w={3}
						h={3}
						color="#0B0B0B"
					/>
					<Text>{roundDecimalStr(market.probability0)}</Text>
				</Flex>
			</Flex>
		</Box>
	);
}

export default PostDisplay;
