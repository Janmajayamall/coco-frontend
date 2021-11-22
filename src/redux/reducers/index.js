import userReducer from "./user";
import oraclesReducer from "./oracles";

export default {
	user: userReducer,
	oracles: oraclesReducer,
};

export * from "./user";
export * from "./oracles";
