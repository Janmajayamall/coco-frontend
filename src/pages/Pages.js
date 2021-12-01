import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Image,
	Text,
	Flex,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "../components/FileUpload";
import {
	uploadImage,
	keccak256,
	newPost,
	newPostTrial,
	findModerators,
	stateSetupMarketsMetadata,
	stateSetupOraclesInfo,
	filterMarketIdentifiersFromMarketsGraph,
	populateMarketWithMetadata,
} from "../utils";
import {
	useCreateNewMarket,
	useQueryOraclesByManager,
	useQueryMarketsAtStage3ByOracles,
} from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { utils } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import {
	selectGroupsFollowed,
	selectMarketsMetadata,
	selectOracleInfoObj,
} from "../redux/reducers";
import PostDisplay from "../components/PostDisplay";
import { useNavigate } from "react-router";

/**
 * Shows two things
 * 1. Posts, within the groups that you manage, that need to be resolved
 * 2. Shows a list of groups that you manage or are delegate of
 */
function Page() {
	const { account } = useEthers();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const oraclesInfoObj = useSelector(selectOracleInfoObj);

	const marketsMetadata = useSelector(selectMarketsMetadata);
	const groupsFollowed = useSelector(selectGroupsFollowed);

	const [oracleIds, setOracleIds] = useState([]);

	const { result: oraclesResult } = useQueryOraclesByManager(account);
	const {
		result: marketsToResolveResult,
		reexecuteQuery: marketsToResolveReexecuteQuery,
	} = useQueryMarketsAtStage3ByOracles(oracleIds, true);

	useEffect(async () => {
		if (oraclesResult.data == undefined) {
			return;
		}

		const oracleIds = oraclesResult.data.oracles.map((obj) => {
			return obj.id;
		});
		await stateSetupOraclesInfo(oracleIds, dispatch);
		const d = oracleIds.map((id) => id.toLowerCase());
		setOracleIds(d);
	}, [oraclesResult]);

	useEffect(async () => {
		if (oracleIds.length == 0) {
			return;
		}
		marketsToResolveReexecuteQuery();
	}, [oracleIds]);

	useEffect(async () => {
		if (marketsToResolveResult.data == undefined) {
			return;
		}

		await stateSetupMarketsMetadata(
			filterMarketIdentifiersFromMarketsGraph(
				marketsToResolveResult.data.markets
			),
			dispatch
		);
	}, [marketsToResolveResult]);

	return (
		<Flex flexDirection="row">
			<Flex flexDirection="column">
				{marketsToResolveResult.data
					? marketsToResolveResult.data.markets.map((market) => {
							const populatedMarket = populateMarketWithMetadata(
								market,
								oraclesInfoObj,
								marketsMetadata,
								groupsFollowed
							);

							return (
								<PostDisplay
									market={populatedMarket}
									onImageClick={(marketIdentifier) => {
										navigate(`/post/${marketIdentifier}`);
									}}
								/>
							);
					  })
					: undefined}
			</Flex>
			<Flex flexDirection="column">
				<Text>Groups you manage or delegate</Text>
				{oracleIds.map((id) => {
					return <Text>{id}</Text>;
				})}
			</Flex>
		</Flex>
	);
}

export default Page;
