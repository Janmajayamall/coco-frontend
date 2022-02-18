import ConnectButton from "../components/ConnectButton";
import LoginButton from "../components/LoginButton";
import PostDisplay from "../components/PostDisplay";
import {
	Button,
	Box,
	Text,
	Flex,
	Spacer,
	Switch,
	Heading,
	Image,
	Avatar,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Select,
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import {
	useCreateNewMarket,
	useQueryMarketsOrderedByLatest,
	useQueryExploreMarkets,
	useQueryMarketByOracles,
	useQueryMarketsByUserInteraction,
	useQueryTokenBalancesByUser,
	useQueryUserMarketsAndPositions,
} from "../hooks";

import { useEffect, useState } from "react";
import {
	filterOracleIdsFromMarketsGraph,
	filterMarketIdentifiersFromMarketsGraph,
	findPostsByMarketIdentifierArr,
	populateMarketWithMetadata,
	findPopularModerators,
	followModerator,
	findModeratorsDetails,
	numStrFormatter,
	stateSetupOraclesInfo,
	stateSetupMarketsMetadata,
	determineOutcome,
	parseDecimalToBN,
	formatBNToDecimal,
	filterMarketsByStage,
	filterMarketsByClaim,
	filterMarketsByCreator,
	COLORS,
	determineMarketState,
	calculateRedeemObj,
	ZERO_BN,
	findPosts,
} from "../utils";
import {
	sUpdateProfile,
	sUpdateOraclesInfoObj,
	selectOracleInfoObj,
	selectMarketsMetadata,
	sUpdateMarketsMetadata,
	sUpdateGroupsFollowed,
	selectGroupsFollowed,
	selectRinkebyLatestBlockNumber,
} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from "react-router";
import Loader from "../components/Loader";
import NoPostsTag from "../components/NoPostsTag";

/**
 * Shows different posts user has interacted with in any form.
 */

function Page() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { account } = useEthers();

	const {
		result: rUserMarketsAndPositions,
		reexecuteQuery: reUserMarketsAndPositions,
	} = useQueryUserMarketsAndPositions(
		account ? account.toLowerCase() : "",
		false
	);

	const [interactedPosts, setInteractedPosts] = useState([]);
	const [pendingRedeemPosts, setPendingRedeemPosts] = useState([]);
	const [userPosts, setUserPosts] = useState([]);

	const [filteredPosts, setFilteredPosts] = useState([]);
	const [filter, setFilter] = useState(1);

	// get posts of markets with which
	// user interacted whenever
	// rUserMarketsAndPositions changes
	useEffect(async () => {
		if (
			rUserMarketsAndPositions.data &&
			rUserMarketsAndPositions.data.user
		) {
			const iMarketIdentifiers = rUserMarketsAndPositions.data.user.markets.map(
				(m) => m.market.marketIdentifier
			);

			// query posts using market identifiers
			const res = await findPostsByMarketIdentifierArr(
				iMarketIdentifiers
			);
			if (res == undefined) {
				return;
			}
			setInteractedPosts(res.posts);
		}
	}, [rUserMarketsAndPositions]);

	// get posts of markets in which
	// user has pending redeem whenever
	// rUserMarketsAndPositions changes
	useEffect(async () => {
		if (
			rUserMarketsAndPositions.data &&
			rUserMarketsAndPositions.data.user
		) {
			const rMarketIdentifiers = rUserMarketsAndPositions.data.user.positions.map(
				(pos) => {
					const marketState = determineMarketState({
						donBufferEndsAt: pos.market.donBufferEndsAt,
						resolutionBufferEndsAt:
							pos.market.resolutionBufferEndsAt,
					});
					if (marketState == 3) {
						// market has expired, so its possible that user has something to redeem
						const redeemObj = calculateRedeemObj(
							{
								...pos.market,
								outcome: Number(pos.market.outcome),
								reserve1: parseDecimalToBN(pos.market.reserve1),
								reserve0: parseDecimalToBN(pos.market.reserve0),
							},
							account,
							{
								amount0: parseDecimalToBN(pos.amount0),
								amount1: parseDecimalToBN(pos.amount1),
							}
						);
						if (redeemObj.total.gt(ZERO_BN)) {
							return pos.market.marketIdentifier;
						}
					}
				}
			);

			// retrieve posts using rMarketIdentifiers
			const res = await findPostsByMarketIdentifierArr(
				rMarketIdentifiers
			);
			if (res == undefined) {
				return;
			}
			setPendingRedeemPosts(res.posts);
		}
	}, [rUserMarketsAndPositions]);

	// retrieve posts created by the user
	useEffect(async () => {
		if (account != undefined) {
			const res = await findPosts(
				{
					creatorColdAddress: account.toLowerCase(),
				},
				{
					createdAt: -1,
				}
			);
			if (res == undefined) {
				return;
			}
			setUserPosts(res.posts);
		}
	}, [account]);

	useEffect(() => {
		if (filter == 1) {
			setFilteredPosts(userPosts);
		} else if (filter == 2) {
			setFilteredPosts(interactedPosts);
		} else if (filter == 3) {
			setFilteredPosts(pendingRedeemPosts);
		}
	}, [filter, interactedPosts, userPosts, pendingRedeemPosts]);

	return (
		<Flex width={"100%"}>
			<Flex
				flexDirection="column"
				width={"70%"}
				padding={5}
				minHeight="100vh"
			>
				{filteredPosts.length == 0 ? (
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						marginBottom={4}
						flexDirection={"column"}
					>
						<Text>Nothing to show.</Text>
					</Flex>
				) : undefined}
				{filteredPosts.map((post, index) => {
					// if post does not have
					// corresponding group info
					// then return
					if (post.group.length == 0) {
						return;
					}

					return (
						<PostDisplay
							key={index}
							// setRef={
							// 	filteredMarkets.length % FEED_BATCH_COUNT === 0
							// 		? index === filteredMarkets.length - 1
							// 			? observe
							// 			: null
							// 		: null.

							// }
							post={post}
							onImageClick={(marketIdentifier) => {
								navigate(`/post/${marketIdentifier}`);
							}}
						/>
					);
				})}
			</Flex>
			<Flex flexDirection="column" width={"30%"} paddingTop={5}>
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<Heading size="sm" marginBottom={2}>
						Filter your activity by
					</Heading>
					<Select
						onChange={(e) => {
							setFilter(e.target.value);
						}}
						value={filter}
						fontSize={14}
						placeholder="No Filter"
						borderWidth={1}
						borderStyle="solid"
						borderColor="#0B0B0B"
					>
						<option value={1}>Your Posts</option>
						<option value={2}>You Challenged</option>
						<option value={3}>Pending Redeem</option>
					</Select>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Page;
