import {
	Text,
	Flex,
	Heading,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	selectFeedDisplayConfigs,
	sUpdateThresholdOfFeedDisplayConfigs,
} from "../redux/reducers";

function ConfigSidebar() {
	const dispatch = useDispatch();

	const feedDisplayConfigs = useSelector(selectFeedDisplayConfigs);
	const feedThreshold = feedDisplayConfigs.threshold;

	return (
		<Flex flexDirection="column">
			<Heading size="sm">Display</Heading>
			<Text>Slide to choose your feed threshold!</Text>
			<Slider
				aria-label="slider-ex-1"
				defaultValue={feedThreshold}
				onChange={(val) => {
					dispatch(sUpdateThresholdOfFeedDisplayConfigs(val));
				}}
			>
				<SliderTrack>
					<SliderFilledTrack />
				</SliderTrack>
				<SliderThumb />
			</Slider>
			<Text>{`${feedThreshold}%`}</Text>
		</Flex>
	);
}

export default ConfigSidebar;
