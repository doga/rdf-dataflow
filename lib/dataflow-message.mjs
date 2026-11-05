/**
 * @file Library for serialising and deserialising Dataflow objects.
 * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore}
 * @see {@link https://rdf.js.org/data-model-spec/ | RDF/JS: Data model specification}
 * @see {@link https://rdf.js.org/dataset-spec/ | RDF/JS: Dataset specification 1.0}
 */

import { 
  iri, IRI, 
  langTag, LanguageTag,
  Store, DataFactory as t,
} from '../deps.mjs';
import { 
  isTerm, isNamedNode, isBlankNode, isLiteral, isDefaultGraph, isQuad, isTriple 
} from "./util/rdf-util.mjs";
import { expandIri, reduceIri } from "./util/expand.mjs";
import { isArray, isPlainObject, isString, isNull, isEmptyString, isUndefined } from "./util/util.mjs";

const
/**
 * The Dataflow format version.
 */
DATAFLOW_VERSION = '3.0',
RDF              = iri`http://www.w3.org/1999/02/22-rdf-syntax-ns#`,
RDF_REIFIES      = iri`${RDF}reifies`,
XSD              = iri`http://www.w3.org/2001/XMLSchema#`,
XSD_STRING       = iri`${XSD}string`;


/**
 * Abstract class representing a Dataflow message.
 */
class DataflowMessage {
  /**
   * The Dataflow content type.
   * @returns {string}
   * @see {@link https://httpwg.org/specs/rfc9110.html#media.type}
   */
  static get contentType(){return 'application/x-rdfdataflow+json';}

  /**
   * The Dataflow file extension.
   * @returns {string}
   */
  static get fileExtension(){return '.rdfdataflow.json';}

  /**
   * @type {Object.<string, string>}
   */
  #prefixes = {
    rdf : iri`http://www.w3.org/1999/02/22-rdf-syntax-ns#`.toString(),
    rdfs: iri`http://www.w3.org/2000/01/rdf-schema#`.toString(),
  };

  /**
   * Message prefixes.
   * @returns {Object.<string, IRI>}
   */
  get prefixes(){
    const res = {};
    for (const [prefix, iriStr] of Object.entries(this.#prefixes)) {
      res[prefix] = iri`${iriStr}`;
    }
    return res;
  }

  /**
   * @param {Object.<string, *>} val
   * @throws {TypeError}
   */
  addPrefixes(val){
    try {
      for (const [prefix, expansion] of Object.entries(val)) {
        const anIri = iri`${expansion}`; if(!anIri)continue;
        if(this.#prefixes[prefix])continue;
        this.#prefixes[prefix] = `${anIri}`;
      }
    } catch (error) {
      throw new TypeError(`${error}`);
    }
  }

  /**
   * @param {(Object.<string, *> | undefined)} prefixes
   * @throws {TypeError}
   */
  constructor(prefixes){
    if(prefixes)this.addPrefixes(prefixes);
  }

  /**
   * @returns {Object} the Dataflow message as a JSONable object
  */
  serialise(){
    return {
      rdfdataflow: {version: DATAFLOW_VERSION},
      head       : {prefixes: this.#prefixes}
    }
  }
  
  /**
   * Deserialises a Dataflow message.
   * @param {*} message ignored if not a JSONable object
   * @returns {?DataflowMessage}
   * @throws {Error}
   */
  static deserialise(message){
    throw new Error('not implemented');
  }
}


/**
 * An in-memory RDF dataset that is serialisable as a Dataset message.
 * @see {@link https://rdf.js.org/dataset-spec/#dataset-interface | Dataset interface}
 */
class DatasetMessage extends DataflowMessage {
  /**
   * The Dataset content type.
   * @type {string}
   * @see {@link https://httpwg.org/specs/rfc9110.html#media.type}
   */
  static get contentType(){return 'application/x-rdfdataflow-dataset+json';}

  /**
   * The Dataset file extension.
   * @type {string}
   */
  static get fileExtension(){return '.rdfdataflow-dataset.json';}

  /**
   * An in-memory RDF dataset.
   * @type {Object}
   * @ignore
   */
  #dataset = new Store();

  /**
   * RDF dataset conforming to the rdf.js.org Dataset interface.
   * @returns {Object}
   * @see {@link https://rdf.js.org/dataset-spec/#dataset-interface | Dataset interface}
   */
  get dataset(){
    const dataset = new Store();
    dataset.addAll(this.#dataset);
    return dataset;
  }

  /**
   * 
   * @param {(Object | undefined)} dataset must conform to the rdf.js.org spec
   * @param {(Object.<string, *> | undefined)} prefixes
   * @throws {TypeError}
   */
  constructor(dataset, prefixes){
    super(prefixes);
    try {
      if (!dataset) throw new Error("not a dataset");
      this.#dataset.addAll(dataset);
    } catch (error) {
      throw new TypeError(`${error}`);
    }
  }

  /**
   * Serialises a Dataset message.
   * @returns {Object} the Dataset message as a JSONable object
  */
  serialise(){
    const res = super.serialise();
    res['dataset'] = [];
    for (const s of this.#dataset) {
      res.dataset.push(statementToJsonable(s, this.prefixes));
    }
    return res;
  }

  /**
   * Deserialises a Dataset message.
   * @param {*} message ignored if not a JSONable object
   * @returns {?DatasetMessage}
   * @throws {TypeError}
   */
  static deserialise(message){
    try {
      if(!isPlainObject(message))throw new Error("not jsonable");
      if (!isArray(message.dataset))return null;
      const
      // prolog
      version = message.rdfdataflow?.version,
      // head
      prefixes = isPlainObject(message.head?.prefixes) ? message.head?.prefixes : {};
      assertVersionMatches(version);
      return new DatasetMessage(
        message.dataset.map(s => statementFromJsonable(s, prefixes)),
        prefixes
      );
    } catch (error) {
      return null;
    }
  }
  
}


/**
 * A prose message.
 * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad interface}
 */
class ProseMessage extends DataflowMessage {
  /**
   * The Dataflow content type.
   * @type {string}
   * @see {@link https://httpwg.org/specs/rfc9110.html#media.type}
   */
  static get contentType(){return 'application/x-rdfdataflow-prose+json';}

  /**
   * The Dataflow file extension.
   * @type {string}
   */
  static get fileExtension(){return '.rdfdataflow-prose.json';}

  /**
   * A sequence of in-memory quads, where the `graph` term is the default graph.
   * @type {Object[]}
   * @ignore
   */
  #statements = [];

  /**
   * RDF statements, each conforming to the rdf.js.org Quad interface.
   * @returns {Object[]}
   * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad interface}
   */
  get statements(){return this.#statements.map(s => s);} // TODO deep copy, not shallow

  /**
   * 
   * @param {(Object[] | undefined)} statements must conform to the rdf.js.org quad spec
   * @param {(Object.<string, *> | undefined)} prefixes
   * @throws {TypeError}
   */
  constructor(statements, prefixes){
    super(prefixes);
    try {
      const testDataset = new Store(); // test quad validity
      if (!isArray(statements))throw new Error("not statements");
      for (const s of statements) {
        testDataset.add(s);
        this.#statements.push(s);
      }
    } catch (error) {
      throw new TypeError(`${error}`);
    }
  }

  /**
   * @returns {Object} the Prose message as a JSONable object
  */
  serialise(){
    // console.debug(`serialise`);
    const res = super.serialise();
    res['prose'] = this.#statements.map(s => statementToJsonable(s, this.prefixes, true));
    return res;
  }

  /**
   * Deserialises a Prose message.
   * @param {*} message ignored if not a JSONable object
   * @returns {?ProseMessage}
   */
  static deserialise(message){
    try {
      if(!isPlainObject(message))throw new Error("not jsonable");
      if (!isArray(message.prose))return null;
      const
      // prolog
      version = message.rdfdataflow?.version,
      // head
      prefixes = isPlainObject(message.head?.prefixes) ? message.head?.prefixes : {};
      assertVersionMatches(version);
      return new ProseMessage(
        message.prose.map(s => statementFromJsonable(s, prefixes, true)),
        prefixes
      );
    } catch (error) {
      // console.debug(`${error}`);
      return null;
    }
  }
}




function assertVersionMatches(version) {
  if(version !== DATAFLOW_VERSION)throw new Error("version error");
}

/**
 * 
 * @param {*} statement 
 * @param {(boolean | undefined)} isProse 
 * @throws {TypeError} thrown if statement is not conformant
 */
function assertValidStatement(statement, isProse) {
  try {
    const {subject, predicate, object, graph} = statement;
    if(!(
      // check subject
      (isNamedNode(subject) || isBlankNode(subject) || isTriple(subject)) &&
      // check predicate
      isNamedNode(predicate) &&
      // check object
      (isNamedNode(object) || isBlankNode(object) || isLiteral(object)) &&
      // check graph
      (
        (isProse && isDefaultGraph(graph)) || 
        (!isProse && (isDefaultGraph(graph) || isNamedNode(graph) || isBlankNode(graph)))
      )
    )) {
      throw new TypeError(`not a conformant statement: ${JSON.stringify(statement.termType)} (isProse: ${isProse})`);
    }
  } catch (error) {
    throw new TypeError(`${error}`);
  }
}

/**
 * Deserialises an RDF-Star statement. RDF 1.2 not supported. Prose is not segmented into multiple graphs.
 * @param {*} jsonableStatement a statement object in a Dataflow message
 * @param {Object.<string, IRI>} prefixes 
 * @param {(boolean | undefined)} isProse 
 * @returns {Object} an rdf.js.org-conformant quad 
 * @throws {Error}
 * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad interface}
 */
function statementFromJsonable(jsonableStatement, prefixes, isProse) {
  try {
    const statement = t.quad(
      termFromJsonable(jsonableStatement[0], prefixes),
      termFromJsonable(jsonableStatement[1], prefixes),
      termFromJsonable(jsonableStatement[2], prefixes),
      termFromJsonable(jsonableStatement[3], prefixes),
    );
    assertValidStatement(statement, isProse);
    return statement;
  } catch (error) {
    throw new TypeError(`${error}`);
  }
}


/**
 * Deserialises an RDF term.
 * @param {*} jsonableTerm a term object in a Dataflow message
 * @param {Object.<string, IRI>} prefixes 
 * @returns {Object} an rdf.js.org-conformant term
 * @throws {Error}
 */
function termFromJsonable(jsonableTerm, prefixes) {
  // console.debug(`[termFromJsonable] jsonableTerm`,JSON.stringify(jsonableTerm));
  if(!jsonableTerm)return t.defaultGraph();

  switch (jsonableTerm.type) {
    case 'triple':
      const
      subject   = termFromJsonable(jsonableTerm.value[0], prefixes),
      predicate = termFromJsonable(jsonableTerm.value[1], prefixes),
      object    = termFromJsonable(jsonableTerm.value[2], prefixes);
      return t.quad(subject, predicate, object);
      // break;
      
    case 'iri':
      return t.namedNode(`${expandIri(jsonableTerm.value, prefixes)}`);
      // break;
      
    case 'bnode':
      return t.blankNode(jsonableTerm.value);
      // break;

    case 'literal':
      if (jsonableTerm.language) {
        const aLang = langTag`${jsonableTerm.language}`;
        if(!aLang)throw new TypeError("not a language");
        if (['ltr','rtl'].includes(jsonableTerm.direction)) {
          return t.literal(jsonableTerm.value, {language: `${aLang}`, direction: jsonableTerm.direction});
        } else {
          return t.literal(jsonableTerm.value, `${aLang}`);
        }
      } else if(jsonableTerm.datatype) {
        const datatypeIri = iri`${expandIri(jsonableTerm.datatype, prefixes)}`;
        if(!datatypeIri)throw new TypeError("not a datatype IRI");
        return t.literal(jsonableTerm.value, t.namedNode(`${datatypeIri}`));
      } else {
        return t.literal(jsonableTerm.value);
      }
      // break;

    default:
      throw new TypeError(`not an rdf.js.org term: ${JSON.stringify(jsonableTerm)}`);
      break;
  }
}


/**
 * Serialises an RDF-Star statement. RDF 1.2 not supported. Prose is not segmented into multiple graphs.
 * @param {Object} statement an rdf.js.org-conformant quad
 * @param {Object.<string, IRI>} prefixes 
 * @param {(boolean | undefined)} isProse 
 * @returns {Object} a statement object in a Dataflow message
 * @throws {Error}
 * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad interface}
 */
function statementToJsonable(statement, prefixes, isProse) {
  assertValidStatement(statement, isProse);
  const 
  {subject, predicate, object, graph} = statement,
  jsonable = [
    termToJsonable(subject, prefixes),
    termToJsonable(predicate, prefixes),
    termToJsonable(object, prefixes),
    termToJsonable(graph, prefixes)
  ];

  if(!jsonable[3])jsonable.splice(3);
  // console.debug(`statement`,statement,`isProse`,isProse);
  return jsonable;
}

function termToJsonable(term, prefixes) {
  if (isTriple(term)) {
    const {subject, predicate, object, graph} = term;
    if(!isDefaultGraph(graph))throw new TypeError("triple must belong to default graph");
    return {
      type : 'triple',
      value: [
        termToJsonable(subject, prefixes),
        termToJsonable(predicate, prefixes),
        termToJsonable(object, prefixes),
      ]
    };
  } else if (isNamedNode(term)) {
    const reduced = reduceIri(term.value, prefixes);
    // console.debug(`reduced`,reduced);
    // console.debug(`prefixes`,prefixes);
    return {
      type : 'iri',
      value: reduced
    };
  } else if (isBlankNode(term)) {
    return {
      type : 'bnode',
      value: term.value
    };
  } else if (isLiteral(term)) {
    const res = {
      type : 'literal',
      value: term.value
    };

    // literal has language?
    if (isString(term.language)) {
      const aLang = langTag`${term.language}`;
      if (aLang) {
        res.language = `${aLang}`;
        if (
          isString(term.direction) &&
          ['ltr', 'rtl'].includes(term.direction)
        ) res.direction = term.direction;
        return res;
      }
    }
    
    // literal has datatype?
    if (!XSD_STRING.equals(iri`${term.datatype.value}`)) {
      res.datatype = reduceIri(term.datatype.value, prefixes);
    }
    return res;

  } else if (isDefaultGraph(term)) {
    return null;
  }
}


export {
  DATAFLOW_VERSION,
  DataflowMessage, DatasetMessage, ProseMessage,
};
