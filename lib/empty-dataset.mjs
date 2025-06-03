import { 
  datasetFactory as rdf
} from "./deps.mjs";

/**
 * Creates an empty in-memory RDF dataset that conforms to the DatasetCore specification.
 * @returns {object} an empty RDF dataset
 * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
 */
function emptyDataset() {
  return rdf.dataset();
}

export default emptyDataset;
export {emptyDataset};
