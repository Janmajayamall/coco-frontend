import userReducer from "./user";
import oraclesReducer from "./oracles";
import marketsReducer from "./markets";
import uiReducer from "./ui";
import badMarkets from "./badMarkets";

export default {
	user: userReducer,
	oracles: oraclesReducer,
	markets: marketsReducer,
	ui: uiReducer,
	badMarkets: badMarkets,
};

export * from "./user";
export * from "./oracles";
export * from "./markets";
export * from "./ui";
export * from "./badMarkets";
