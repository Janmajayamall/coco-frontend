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
	Spacer,
	Heading,
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
	selectRinkebyLatestBlockNumber,
} from "../redux/reducers";
import PostDisplay from "../components/PostDisplay";
import { useNavigate } from "react-router";
import Loader from "../components/Loader";
import GroupDisplayName from "../components/GroupDisplayPanel";
import NoPostsTag from "../components/NoPostsTag";

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
	const rinkebyLatestBlockNumber = useSelector(
		selectRinkebyLatestBlockNumber
	);

	const [oracleIds, setOracleIds] = useState([]);
	const [markets, setMarkets] = useState([]);
	const [oraclesLoading, setOraclesLoading] = useState(true);
	const [marketsLoading, setMarketsLoading] = useState(true);

	const { result: oraclesResult } = useQueryOraclesByManager(account);
	const {
		result: marketsToResolveResult,
		reexecuteQuery: marketsToResolveReexecuteQuery,
	} = useQueryMarketsAtStage3ByOracles(oracleIds, true);

	useEffect(async () => {
		if (oraclesResult.data == undefined) {
			return;
		}
		setOraclesLoading(true);

		const _oracleIds = oraclesResult.data.oracles.map((obj) => {
			return obj.id;
		});
		await stateSetupOraclesInfo(_oracleIds, dispatch);
		setOracleIds(_oracleIds);
		setOraclesLoading(false);
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

	useEffect(() => {
		if (marketsToResolveResult.data == undefined) {
			return;
		}

		setMarketsLoading(true);

		const populatedMarkets = marketsToResolveResult.data.markets.map(
			(market) => {
				return populateMarketWithMetadata(
					market,
					oraclesInfoObj,
					marketsMetadata,
					groupsFollowed,
					rinkebyLatestBlockNumber
				);
			}
		);

		setMarkets(populatedMarkets);
		setMarketsLoading(false);
	}, [
		marketsToResolveResult,
		oraclesInfoObj,
		groupsFollowed,
		rinkebyLatestBlockNumber,
		marketsMetadata,
	]);

	/**
	 * @warning The posts shown under "Need attention" don't include
	 * the markets that didn't transition to Stage 3 by reaching
	 * escalation limit (that are, the ones with 0 escalation limit)
	 */
	return (
		<Flex flexDirection="row">
			<Spacer />

			<Flex flexDirection="column" width={"50%"}>
				<Flex justifyContent="center" marginTop={5}>
					<Heading fontSize={25}>
						Posts that need your attention
					</Heading>
				</Flex>
				{marketsLoading === true ? <Loader /> : undefined}
				{marketsLoading === false && markets.length === 0 ? (
					<NoPostsTag
						style={{
							marginTop: 20,
							marginBottom: 20,
						}}
					/>
				) : undefined}
				{markets.map((market) => {
					return (
						<PostDisplay
							market={market}
							onImageClick={(marketIdentifier) => {
								navigate(`/post/${marketIdentifier}`);
							}}
						/>
					);
				})}
			</Flex>
			<Flex paddingLeft={10} width={"30%"}>
				<Flex flexDirection="column">
					<Flex justifyContent="center" marginTop={5}>
						<Text fontSize={20} fontWeight={"bold"}>
							Your groups
						</Text>
					</Flex>
					{oraclesLoading === true ? <Loader /> : undefined}
					{oracleIds.map((id) => {
						const group = oraclesInfoObj[id];
						if (group == undefined) {
							return;
						}

						return (
							<GroupDisplayName
								group={group}
								followStatusVisible={false}
								settingsVisible={true}
							/>
						);
					})}
				</Flex>
				<Spacer />
			</Flex>
		</Flex>
	);
}

export default Page;
