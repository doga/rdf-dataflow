/**
 * Façade for some libraries that implement in-memory RDF datasets. Comformant to the RDF/JS DatasetCore specification.
 * @see {@link https://rdf.js.org/data-model-spec/ | RDF/JS: Data model specification}
 * @see {@link https://rdf.js.org/dataset-spec/ | RDF/JS: Dataset specification 1.0}
 */

// Data model
import NamedNode from './data-model-v2.1.0/lib/NamedNode.js';
import BlankNode from './data-model-v2.1.0/lib/BlankNode.js';
import Literal from './data-model-v2.1.0/lib/Literal.js';
import DefaultGraph from './data-model-v2.1.0/lib/DefaultGraph.js';
import Quad from './data-model-v2.1.0/lib/Quad.js';
import DataFactory from './data-model-v2.1.0/Factory.js';

// Dataset
import DatasetCore from './dataset-v2.0.2/DatasetCore.js';
import DatasetCoreFactory from './dataset-v2.0.2/Factory.js';

export {
  // Data model
  DataFactory, NamedNode, BlankNode, Literal, DefaultGraph, Quad, 

  // Dataset
  DatasetCoreFactory, DatasetCore, 
};

export default {
  // Data model
  DataFactory, NamedNode, BlankNode, Literal, DefaultGraph, Quad, 

  // Dataset
  DatasetCoreFactory, DatasetCore, 
};
