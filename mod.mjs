
// TODO add isDataflowObject(obj) for fast validity test

import { toDataset } from "./lib/parse.mjs";
import { fromDataset } from "./lib/serialise.mjs";
import { contentType } from "./lib/content-type.mjs";
import { fileExtension } from "./lib/file-extension.mjs";
import { emptyDataset } from "./lib/empty-dataset.mjs";
import { emptyDataflow } from "./lib/empty-dataflow.mjs";

export default {toDataset, fromDataset, emptyDataset, emptyDataflow, contentType, fileExtension };
export {toDataset, fromDataset, emptyDataset, emptyDataflow, contentType, fileExtension };

