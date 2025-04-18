import { 
  dataFactory as t, 
  datasetFactory as rdf,
  // iri,
} from "./deps.mjs";


/**
 * Parses an RDF-Dataflow object and produces an RDF dataset.
 *
 * @param {object} dataflowObject
 * @returns {DatasetCore}
 * @throws {TypeError} 
 * @see {@link https://rdf4j.org/documentation/programming/rdfstar/#extended-sparql-json-format | RDF4J's Extended JSON format for SPARQL-Star query results}
 * @see {@link https://www.w3.org/TR/sparql11-results-json/ | SPARQL 1.1 Query Results JSON Format}
 * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
 */
function toDataset(dataflowObject) {
  try {
    const 
    jsonIn        = dataflowObject,
    subjectName   = jsonIn.head.vars[0],
    predicateName = jsonIn.head.vars[1],
    objectName    = jsonIn.head.vars[2],
    graphName     = jsonIn.head.vars[3],
    dataset       = rdf.dataset();

    if (!(subjectName === 's' && predicateName === 'p' && objectName === 'o' && graphName === 'g')) {
      throw new Error('Not a dataflow object');
    }

    for (const binding of jsonIn.results.bindings) {
      const
      subjectTerm   = createSubjectTerm(binding.s),
      predicateTerm = createPredicateTerm(binding.p),
      objectTerm    = createObjectTerm(binding.o),
      graphTerm     = createGraphTerm(binding.g);

      dataset.add(t.quad(subjectTerm, predicateTerm, objectTerm, graphTerm ?? t.defaultGraph()));
    }

    return dataset;

  } catch (error) {
    throw new TypeError(`${error}`);
  }
}


/**
 * Creates an RDF term that is a subject in a triple.
 *
 * @param {object} term
 * @returns {(Quad | NamedNode | BlankNode)}
 * @throws {TypeError} 
 */
function createSubjectTerm(term) {
  const res =  createTriple(term) || createNamedNode(term) || createBlankNode(term);
  if (!res) {
    throw new TypeError('not a subject term');
  }
  return res;
}


/**
 * Creates an RDF term that is a predicate in a triple.
 *
 * @param {object} term
 * @returns {NamedNode}
 * @throws {TypeError} 
 */
function createPredicateTerm(term) {
  const res = createNamedNode(term);
  if (!res) {
    throw new TypeError('not a predicate term');
  }
  return res;
}


/**
 * Creates an RDF term that is an object in a triple.
 *
 * @param {object} term
 * @returns {(NamedNode | BlankNode | Literal)}
 * @throws {TypeError}
 */
function createObjectTerm(term) {
  const res = createNamedNode(term) || createBlankNode(term) || createLiteral(term);
  if (!res) {
    throw new TypeError('not an object term');
  }
  return res;
}


/**
 * Creates an RDF term that is a graph in a quad.
 *
 * @param {object} term
 * @returns {(NamedNode | BlankNode)}
 * @throws {TypeError}
 */
function createGraphTerm(term) {
  return createNamedNode(term) || createBlankNode(term);
}


/**
 * Creates a named node.
 *
 * @param {object} term
 * @returns {NamedNode?}
 */
function createNamedNode(term) {
  try {
    if (term.type !== 'uri') return null;
    // if(!iri`${term.value}`)return null;
    return t.namedNode(term.value);
  } catch (_error) {
    return null;
  }
}


/**
 * Creates a blank node.
 *
 * @param {object} term
 * @returns {BlankNode?}
 */
function createBlankNode(term) {
  try {
    if (term.type !== 'bnode') return null;
    return t.blankNode(term.value);
  } catch (_error) {
    return null;
  }
}


/**
 * Creates a literal.
 *
 * @param {object} term
 * @returns {Literal?}
 */
function createLiteral(term) {
  try {
    if (term.type !== 'literal') return null;
    if (typeof term['xml:lang'] === 'string') {
      return t.literal(
        term.value,
        term['xml:lang']
      );
    }
    if (typeof term.datatype === 'string') {
      return t.literal(
        term.value,
        t.namedNode(term.datatype)
      );
    }
    return t.literal(term.value);
  } catch (_error) {
    return null;
  }
}


/**
 * Creates a triple.
 *
 * @param {object} term
 * @returns {Quad?}
 */
function createTriple(term) {
  try {
    if (term.type !== 'triple') return null;
    const
    subjectTerm   = createSubjectTerm(term.value.s),
    predicateTerm = createPredicateTerm(term.value.p),
    objectTerm    = createObjectTerm(term.value.o);

    if (!(subjectTerm && predicateTerm && objectTerm)) {
      return null;
    }
    return t.quad(subjectTerm, predicateTerm, objectTerm, t.defaultGraph());
  } catch (_error) {
    return null;
  }
}


export default toDataset;
export { toDataset };
