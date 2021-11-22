import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { useSelector } from "react-redux";

const defaultFeed = {
	markets: [],
	first: 10,
	skip: 0,
	hasMore: true,
};

const initialState = {
	exploreFeed: defaultFeed,
	homeFeedMarkets: defaultFeed,
	marketsMetadata: new Object(),
};

const slice = createSlice({
	name: "markets",
	initialState,
	reducers: {
		sUpdateMarketsMetadata(state, action) {
			if (
				action.payload &&
				Array.isArray(action.payload) &&
				action.payload.length > 0
			) {
				let updatedMarketsMetadata = {
					...state.marketsMetadata,
				};
				action.payload.forEach((data) => {
					if (data.marketIdentifier) {
						updatedMarketsMetadata[data.marketIdentifier] = {
							marketIdentifier: data.marketIdentifier,
							oracleAddress: data.oracleAddress,
							creatorColdAddress: data.creatorColdAddress,
							eventIdentifierStr: data.eventIdentifierStr,
						};
					}
				});

				state.marketsMetadata = updatedMarketsMetadata;
			}
		},
	},
});

export const { sUpdateMarketsMetadata } = slice.actions;

export const selectMarketsMetadata = (state) => state.markets.marketsMetadata;

export default slice.reducer;
