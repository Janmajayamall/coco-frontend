import { Avatar, Box, Flex, Image, Spacer, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
	followModerator,
	formatBNToDecimalCurr,
	formatDecimalToPercentage,
	generateProfileInitials,
	roundDecimalStr,
	sliceAddress,
} from "../utils";
import { sAddGroupFollow } from "./../redux/reducers";

function PostDisplay({ market, onImageClick, setRef, ...children }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [minHeightTrick, setMinHeightTrick] = useState(300);

	if (!market || !market.oracleInfo) {
		return <div />;
	}

	function MarketStatus({ status }) {
		function color(val) {
			if (val === 1) {
				return "#02B784";
			}
			if (val === 2) {
				return "#EB5757";
			}
			if (val === 3) {
				return "#F2C94C";
			}
			if (val === 4) {
				return "#4F4F4F";
			}
			return "#FDFDFD";
		}

		function text(val) {
			if (val === 1) {
				return "Live";
			}
			if (val === 2) {
				return "Challenge";
			}
			if (val === 3) {
				return "Resolution";
			}
			if (val === 4) {
				return "Ended";
			}
			return "";
		}

		return (
			<Flex justifyContent="center" alignItems="center" paddingRight={3}>
				<Text color={color(status)} fontSize="20" fontWeight="bold">
					·
				</Text>
				<Text
					color={color(status)}
					fontSize="16"
					fontWeight="bold"
					marginLeft="2"
				>
					{text(status)}
				</Text>
			</Flex>
		);
	}

	function BottomStats({ title, info, ...props }) {
		return (
			<Flex flexDirection="column" {...props}>
				<Text fontSize={14} color={"#828282"}>
					{title}
				</Text>
				<Text fontSize={16} color={"#000000"}>
					{info}
				</Text>
			</Flex>
		);
	}

	const id = Math.random() * 1000;
	return (
		<Box ref={setRef} {...children}>
			<Flex flexDirection={"column"} paddingBottom={3} paddingTop={4}>
				<Flex paddingBottom={1}>
					<Flex alignItems="center">
						<Avatar
							size="sm"
							name={generateProfileInitials(
								market.oracleInfo.name
							)}
						/>
						<Text
							onClick={() => {
								navigate(`/group/${market.oracle.id}`);
							}}
							fontSize="16"
							fontWeight="bold"
							marginLeft="2"
							color={"#4F4F4F"}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
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
						) : undefined}
					</Flex>
					<Spacer />
					{/* <Flex
					backgroundColor="#F3F5F7"
					alignItems="center"
					paddingLeft={3}
					paddingRight={3}
					borderRadius={5}
				>
					<Text>
						{marketStageDisplayName(market.optimisticState.stage)}
					</Text>
				</Flex> */}
					<MarketStatus status={market.optimisticState.stage} />
				</Flex>

				<Flex paddingLeft={2}>
					<Text fontSize={14} color="#4F4F4F">{`By ${sliceAddress(
						market.creator
					)}`}</Text>
				</Flex>
			</Flex>
			<Flex
				onClick={() => {
					if (onImageClick != undefined) {
						onImageClick(market.marketIdentifier);
					}
				}}
				minHeight={minHeightTrick}
				maxHeight={500}
				width={"100%"}
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
					src={
						market.marketMetadata &&
						market.marketMetadata.eventIdentifierStr
							? `${market.marketMetadata.eventIdentifierStr}`
							: ""
					}
					alt="Failed to load image"
				/>
			</Flex>
			<Flex marginTop={5} alignItems="flex-start">
				<BottomStats
					title="Trade Volume"
					info={`${formatBNToDecimalCurr(market.totalVolume)}`}
				/>

				<Spacer />
				<BottomStats
					marginRight={4}
					title="Yes"
					info={`${formatDecimalToPercentage(market.probability1)}`}
				/>
				<BottomStats
					title="No"
					info={`${formatDecimalToPercentage(market.probability0)}`}
				/>
			</Flex>
		</Box>
	);
}

export default PostDisplay;
