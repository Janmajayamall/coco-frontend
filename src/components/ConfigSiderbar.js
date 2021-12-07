import {
	Text,
	Flex,
	Heading,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Spacer,
	Button,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	selectFeedDisplayConfigs,
	sUpdateThresholdOfFeedDisplayConfigs,
} from "../redux/reducers";
import { useNavigate } from "react-router";
import PrimaryButton from "./PrimaryButton";

function ConfigSidebar() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const feedDisplayConfigs = useSelector(selectFeedDisplayConfigs);
	const feedThreshold = feedDisplayConfigs.threshold;

	return (
		<Flex
			width={"20%"}
			paddingRight={6}
			paddingLeft={6}
			paddingTop={5}
			flexDirection="column"
		>
			<Heading size="md">Display</Heading>
			<Text marginTop={5} fontSize={14}>
				Set your minimum YES threshold for feed
			</Text>
			<Slider
				marginTop={2}
				aria-label="slider-ex-1"
				defaultValue={feedThreshold}
				onChange={(val) => {
					dispatch(sUpdateThresholdOfFeedDisplayConfigs(val));
				}}
			>
				<SliderTrack>
					<SliderFilledTrack backgroundColor="#828282" />
				</SliderTrack>
				<SliderThumb backgroundColor="#828282" />
			</Slider>
			<Text fontSize={14} fontWeight="bold">{`${feedThreshold}%`}</Text>
			<PrimaryButton
				title={"New Post"}
				onClick={() => {
					navigate("/add");
				}}
				style={{
					marginTop: 50,
				}}
			/>
		</Flex>
	);
}

export default ConfigSidebar;
