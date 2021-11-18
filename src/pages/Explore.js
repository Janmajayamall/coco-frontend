import { ReactNode, useEffect, useRef, useState } from "react";
import {
	Button,
	Icon,
	Select,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";
import { uploadImage, keccak256, newPost, getPosts } from "./../utils";
import { useCreateNewMarket, useQueryMarketsOrderedByLatest } from "./../hooks";

function Page() {
	// const [first, setFirst] = us

	const { result, reexecuteQuery } = useQueryMarketsOrderedByLatest();

	useEffect(async () => {
		if (!result.data) {
			return;
		}
		const marketIdentifiers = result.data.markets.map((val) => {
			return val.marketIdentifier;
		});
		console.log(marketIdentifiers, ",l,l");
		const res = await getPosts({
			marketIdentifier: marketIdentifiers,
		});
		console.log(res, "dada");

		/* 
        Now combine content identifiers with graph data
        */
	}, [result]);

	return <></>;
}

export default Page;
