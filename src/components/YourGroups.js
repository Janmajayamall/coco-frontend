import GroupDisplayName from "./GroupDisplayPanel";
import { Button, Box, Text, Flex, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { findPopularGroups, COLORS } from "../utils";

function PopularGroups() {
	const [popularGroups, setPopularGroups] = useState([]);

	useEffect(async () => {
		const res = await findPopularGroups([]);
		if (res == undefined) {
			return;
		}
		setPopularGroups(res.groups);
	}, []);

	return (
		<Flex
			flexDirection="column"
			padding={2}
			backgroundColor={COLORS.PRIMARY}
			borderRadius={8}
			marginBottom={4}
		>
			<Heading size="sm" marginBottom={2}>
				Popular Groups
			</Heading>
			{popularGroups.map((group, index) => {
				return (
					<GroupDisplayName
						key={index}
						group={group}
						followStatusVisible={true}
					/>
				);
			})}
		</Flex>
	);
}

export default PopularGroups;
