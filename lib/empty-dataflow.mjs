import { emptyDataset } from "./empty-dataset.mjs";
import { fromDataset } from "./serialise.mjs";

/**
 * Creates Dataflow serialisation of an empty in-memory RDF dataset.
 * @returns {object} an empty Dataflow object.
 */
function emptyDataflow() {
  return fromDataset(emptyDataset());
}

export default emptyDataflow;
export {emptyDataflow};
