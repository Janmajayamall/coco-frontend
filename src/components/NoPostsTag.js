import { Flex, Text } from "@chakra-ui/react";

function NoPostsTag({ ...children }) {
	return (
		<Flex {...children} justifyContent="center" alignItems="center">
			<Text fontSize="xl" fontWeight="bold">
				No Posts
			</Text>
		</Flex>
	);
}

export default NoPostsTag;
