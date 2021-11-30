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
import { TriangleUpIcon, TriangleDownIcon } from "@chakra-ui/icons";
import {
	followModerator,
	marketStageDisplayName,
	roundValueTwoDP,
} from "../utils";
import { useDispatch } from "react-redux";
import { sUpdatePostTradeModal, sAddGroupFollow } from "./../redux/reducers";

function PostDisplay({ market, onImageClick }) {
	const dispatch = useDispatch();
	console.log(market, "post display market");
	if (!market || !market.oracleInfo) {
		return <div />;
	}

	return (
		<Box
			onClick={() => {
				dispatch(
					sUpdatePostTradeModal({
						isOpen: true,

						marketIdentifier: market.marketIdentifier,
					})
				);
			}}
		>
			<Flex paddingBottom={3} paddingTop={4}>
				<Flex alignItems="center">
					<Avatar
						size="sm"
						name="Dan Abrahmov"
						src="https://bit.ly/dan-abramov"
					/>
					<Heading marginLeft={2} size="xs">
						{market.oracleInfo.name}
					</Heading>

					<Text
						onClick={async () => {
							console.log(market.oracle.id, "djaioja");
							const res = await followModerator(market.oracle.id);
							console.log(res, "daoi");
							if (res == undefined) {
								return;
							}
							dispatch(sAddGroupFollow(market.oracle.id));
						}}
						fontSize="12"
						fontWeight="bold"
						marginLeft="2"
					>
						{market.follow != true ? "Join" : undefined}
					</Text>
				</Flex>
				<Spacer />
				<Text>
					{marketStageDisplayName(market.stateMetadata.stage)}
				</Text>
			</Flex>
			<Image
				onClick={() => {
					if (onImageClick != undefined) {
						onImageClick(market.marketIdentifier);
					}
				}}
				src={"https://bit.ly/2Z4KKcF"}
			/>
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
					<Text>{roundValueTwoDP(market.probability1)}</Text>
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
					<Text>{roundValueTwoDP(market.probability0)}</Text>
				</Flex>
			</Flex>
		</Box>
	);
}

export default PostDisplay;
