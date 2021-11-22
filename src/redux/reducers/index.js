import userReducer from "./user";
import oraclesReducer from "./oracles";
import marketsReducer from "./markets";

export default {
	user: userReducer,
	oracles: oraclesReducer,
	markets: marketsReducer,
};

export * from "./user";
export * from "./oracles";
export * from "./markets";
