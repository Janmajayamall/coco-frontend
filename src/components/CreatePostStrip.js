import { Flex, Input } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { COLORS, generateProfileInitials, numStrFormatter } from "../utils";

function CreatePostStrip() {
	const navigate = useNavigate();
	return (
		<Flex
			padding={2}
			backgroundColor={COLORS.PRIMARY}
			borderRadius={8}
			marginBottom={4}
			flexDirection={"column"}
		>
			<Flex marginBottom={1}>
				<Input
					onClick={() => {
						navigate("/add");
					}}
					placeholder="Create a Post"
				/>
			</Flex>
		</Flex>
	);
}

export default CreatePostStrip;
