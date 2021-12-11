import addresses_prod from "./addresses-prod.json";
import addresses_test from "./addresses-test.json";

export const addresses =
	process.env.NODE_ENV === "production" ? addresses_prod : addresses_test;
