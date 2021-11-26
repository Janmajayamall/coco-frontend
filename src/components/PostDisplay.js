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
import { roundValueTwoDP } from "../utils";
import { useDispatch } from "react-redux";
import { sUpdatePostTradeModal } from "./../redux/reducers";

function PostDisplay({ market }) {
	const dispatch = useDispatch();

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

					<Heading marginLeft={2} size="xs">
						Join
					</Heading>
				</Flex>
				<Spacer />
				<Text>Resolved</Text>
			</Flex>
			<Image src={"https://bit.ly/2Z4KKcF"} />
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
