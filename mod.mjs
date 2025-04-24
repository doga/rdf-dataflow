
// TODO add isDataflowObject(obj) for fast validity test

import { toDataset } from "./lib/parse.mjs";
import { fromDataset } from "./lib/serialise.mjs";
import { contentType } from "./lib/content-type.mjs";

export default {toDataset, fromDataset, contentType };
export {toDataset, fromDataset, contentType };

