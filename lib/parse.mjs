import { 
  dataFactory as t, 
  datasetFactory as rdf,
  // iri,
} from "./deps.mjs";

const VERSION = '2.0';

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
  if(!isPlainObject(dataflowObject))throw new TypeError('Not a dataflow message');
  try {
    const 
    jsonIn          = dataflowObject,
    dataflowVersion = jsonIn['rdf-dataflow']?.version,
    datasetIn       = jsonIn.dataset,
    datasetOut      = rdf.dataset();
    let 
    prefixes        = jsonIn.head?.prefixes;

    if(dataflowVersion !== VERSION) throw new TypeError('Dataflow version not supported');
    if(!isArray(datasetIn)) throw new TypeError('Dataflow message does not contain a dataset');
    if(!isPlainObject(prefixes)) prefixes = {};

    for (const statement of datasetIn) {
      if(!(isArray(statement) && [3,4].includes(statement.length))) throw new TypeError('Not an RDF statement');
      const
      subjectTerm   = createSubjectTerm(statement[0]),
      predicateTerm = createPredicateTerm(statement[1]),
      objectTerm    = createObjectTerm(statement[2]),
      graphTerm     = statement.length === 4 ? createGraphTerm(statement[3]) : t.defaultGraph();

      datasetOut.add(t.quad(subjectTerm, predicateTerm, objectTerm, graphTerm));
    }

    return datasetOut;

  } catch (error) {
    throw new TypeError(`${error}`);
  }
}


/**
 * Creates an RDF term that is a subject in a triple.
 *
 * @param {object} term
 * @param {object} prefixes
 * @returns {(Quad | NamedNode | BlankNode)}
 * @throws {TypeError} 
 */
function createSubjectTerm(term, prefixes) {
  const res = createQuad(term, prefixes) || createNamedNode(term, prefixes) || createBlankNode(term);
  if (!res) {
    throw new TypeError('not a subject term');
  }
  return res;
}


/**
 * Creates an RDF term that is a predicate in a triple.
 *
 * @param {object} term
 * @param {object} prefixes
 * @returns {NamedNode}
 * @throws {TypeError} 
 */
function createPredicateTerm(term, prefixes) {
  const res = createNamedNode(term, prefixes);
  if (!res) {
    throw new TypeError('not a predicate term');
  }
  return res;
}


/**
 * Creates an RDF term that is an object in a triple.
 *
 * @param {object} term
 * @param {object} prefixes
 * @returns {(NamedNode | BlankNode | Literal)}
 * @throws {TypeError}
 */
function createObjectTerm(term, prefixes) {
  const res = createNamedNode(term, prefixes) || createBlankNode(term) || createLiteral(term, prefixes);
  if (!res) {
    throw new TypeError('not an object term');
  }
  return res;
}


/**
 * Creates an RDF term that is a graph in a quad.
 *
 * @param {object} term
 * @param {object} prefixes
 * @returns {(NamedNode | BlankNode)}
 * @throws {TypeError}
 */
function createGraphTerm(term, prefixes) {
  return createNamedNode(term, prefixes) || createBlankNode(term);
}


/**
 * Creates a named node.
 *
 * @param {object} term
 * @param {object} prefixes
 * @returns {NamedNode?}
 */
function createNamedNode(term, prefixes) {
  try {
    if (term.type !== 'iri') return null;
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
 * @param {object} prefixes
 * @returns {Literal?}
 */
function createLiteral(term, prefixes) {
  try {
    if (term.type !== 'literal') return null;
    if (typeof term.language === 'string') {
      if (typeof term.direction === 'string') {
        return t.literal(
          term.value,
          {
            language: term.language,
            direction: term.direction
          }
        );
      } else {
        return t.literal(
          term.value,
          term.language
        );
      }
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
 * Creates a quad term.
 *
 * @param {object} term
 * @param {object} prefixes
 * @returns {Quad?}
 */
function createQuad(term, prefixes) {
  try {
    if (term.type !== 'quad') return null;
    const
    subjectTerm   = createSubjectTerm(term.value.s),
    predicateTerm = createPredicateTerm(term.value.p),
    objectTerm    = createObjectTerm(term.value.o),
    graphTerm     = createGraphTerm(term.value.g);

    if (!(subjectTerm && predicateTerm && objectTerm)) {
      return null;
    }
    return t.quad(subjectTerm, predicateTerm, objectTerm, graphTerm ?? t.defaultGraph());
  } catch (_error) {
    return null;
  }
}

function replacePrefix(iri, prefixes) {
  for (const [prefixTag, prefixIriString] of Object.entries(prefixes)) {
    if (iri.startsWith(`${prefixTag}:`)) {
      return prefixIriString + iri.substring(prefixTag.length +1);
    }
  }
  return iri;
}

function isArray(val) {
  return Object.prototype.toString.call(val) === '[object Array]';
}

function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}


export default toDataset;
export { toDataset };
