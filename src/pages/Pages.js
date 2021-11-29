import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
	Image,
	Text,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import FileUpload from "./../components/FileUpload";
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
	toCheckSumAddress,
} from "./../utils";
import {
	useCreateNewMarket,
	useQueryOraclesByManager,
	useQueryMarketsAtStage3ByOracles,
} from "./../hooks";
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

	console.log(oraclesResult);
	console.log(marketsToResolveResult);

	useEffect(async () => {
		if (oraclesResult.data == undefined) {
			return;
		}

		const oracleIds = oraclesResult.data.oracles.map((obj) => {
			return toCheckSumAddress(obj.id);
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
		console.log(marketsToResolveResult, " marketsToResolveResult");
		await stateSetupMarketsMetadata(
			filterMarketIdentifiersFromMarketsGraph(
				marketsToResolveResult.data.markets
			),
			dispatch
		);
	}, [marketsToResolveResult]);

	// retrieve all pages managed by me
	// show all posts that need attention

	return (
		<>
			{marketsToResolveResult.data
				? marketsToResolveResult.data.markets.map((market) => {
						const populatedMarket = populateMarketWithMetadata(
							market,
							oraclesInfoObj,
							marketsMetadata,
							groupsFollowed
						);
						console.log(oraclesInfoObj, " oraclesInfoObj");
						console.log(populatedMarket, " populatedMarket");
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
			{oracleIds.map((id) => {
				return <Text>{id}</Text>;
			})}
		</>
	);
}

export default Page;
