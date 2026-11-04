
// // TODO add isDataflowObject(obj) for fast validity test

// import { toDataset } from "./lib/parse.mjs";
// import { fromDataset } from "./lib/serialise.mjs";

// import { contentType } from "./lib/content-type.mjs";
// import { fileExtension } from "./lib/file-extension.mjs";

// import { emptyDataflowMessage } from "./lib/empty-dataflow-message.mjs";
// import { emptyDataflow } from "./lib/empty-dataflow.mjs";

// export default {toDataset, fromDataset, emptyDataset, emptyDataflow, contentType, fileExtension };
// export {toDataset, fromDataset, emptyDataset, emptyDataflow, contentType, fileExtension };

export {
  DATAFLOW_VERSION, 
  DataflowMessage, DatasetMessage, ProseMessage,
} from './lib/dataflow-message.mjs';

