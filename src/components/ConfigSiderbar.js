import {
	Text,
	Flex,
	Heading,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Spacer,
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
			{/* <Flex>
				<Text
					onClick={() => {
						dispatch(sUpdateThresholdOfFeedDisplayConfigs(0));
					}}
					fontSize={12}
					textDecoration="underline"
				>
					Min
				</Text>
				<Spacer />

				<Text
					onClick={() => {
						dispatch(sUpdateThresholdOfFeedDisplayConfigs(100));
					}}
					fontSize={12}
					textDecoration="underline"
				>
					Max
				</Text>
			</Flex> */}
			<Text>{`${feedThreshold}%`}</Text>
		</Flex>
	);
}

export default ConfigSidebar;
