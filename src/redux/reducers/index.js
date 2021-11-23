import userReducer from "./user";
import oraclesReducer from "./oracles";
import marketsReducer from "./markets";
import uiReducer from "./ui";

export default {
	user: userReducer,
	oracles: oraclesReducer,
	markets: marketsReducer,
	ui: uiReducer,
};

export * from "./user";
export * from "./oracles";
export * from "./markets";
export * from "./ui";
