import { Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import PrimaryButton from "./PrimaryButton";

function NoPostsTag({ ...children }) {
	const navigate = useNavigate();
	return (
		<Flex
			{...children}
			flexDirection={"column"}
			justifyContent="center"
			alignItems="center"
			// borderRadius={10}
			// borderWidth={1}
			// borderColor="#0B0B0B"
			// borderStyle="solid"
		>
			<Text fontSize={16} fontWeight="bold">
				No Posts
			</Text>
			<Text
				onClick={() => {
					navigate("/add");
				}}
				textDecoration="underline"
				fontSize={14}
			>
				Create One Now!
			</Text>
		</Flex>
	);
}

export default NoPostsTag;
