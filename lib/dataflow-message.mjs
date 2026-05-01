/**
 * @file Library for converting RDF datasets between DatasetCore objects and Dataflow objects.
 * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore}
 * @see {@link https://rdf.js.org/data-model-spec/ | RDF/JS: Data model specification}
 * @see {@link https://rdf.js.org/dataset-spec/ | RDF/JS: Dataset specification 1.0}
 */

import { 
  iri, irl, urn, url, IRI, IRL, URN,
  Language,
} from '../deps.mjs'; // BUG Language does not support regions, and search by 3-letter code does not work
import { isArray, isPlainObject, isDefaultGraph } from "./util.mjs";
import rdf from "./pulled-in/rdfjs/mod.mjs";

const
/**
 * The Dataflow format version.
 */
DATAFLOW_VERSION = '2.0',

/**
 * The Dataflow content type.
 * @type {string}
 * @see {@link https://httpwg.org/specs/rfc9110.html#media.type}
 */
DATAFLOW_CONTENT_TYPE = 'application/x-rdfdataflow+json',

/**
 * The Dataflow file extension.
 * @type {string}
 */
DATAFLOW_FILE_EXTENSION = '.rdfdataflow.json',

datasetFactory = new rdf.DatasetCoreFactory(),
dataFactory    = new rdf.DataFactory();


/**
 * A Dataflow message.
 */
class DataflowMessage {
  /**
   * @type {Statement[]}
   */
  #statements;

  /**
   * @type {{ prefixes: Object.<string, IRI>, isProse: boolean }}
   */
  #config;

  get statements(){return this.#statements;}

  /**
   * Constructor for dataset messages and prose messages.
   * The default config has no IRI prefixes, and isProse set to false.
   * @param {Statement[]} statements
   * @param {({ prefixes: Object.<string, *> | undefined, isProse: boolean | undefined } | undefined)} config Specifies IRI prefixes and whether the message is a dataset or a prose.
   * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad}
   * @throws {TypeError}
   */
  constructor(statements, config){
    // check args
    // TODO improve this
    if(!isPlainObject(config)) config = {prefixes: {}, isProse: false};
    if(!isPlainObject(config.prefixes)) config.prefixes = {};
    if(!config.isProse) config.isProse = false;
    if(config.isProse) config.isProse = true;

    this.#statements = statements;
    this.#config = {prefixes: {}, isProse: config.isProse};
    for (const [prefix, expansion] of Object.entries(config.prefixes)) {
      if(typeof prefix !== 'string')throw new TypeError('prefix must be a string');
      const anIri = iri`${expansion}`; if(!anIri)throw new TypeError(`not an IRI: ${expansion}`);
      this.#config.prefixes[prefix] = anIri;
    }
    Object.freeze(this.#config);
  }

  static fromRDF(dataset, config){
    // console.debug('Message from RDF');
    try {
      const statements = [];
      for (const quad of dataset) {
        statements.push(Statement.fromRDF(quad));
      }
      return new DataflowMessage(statements, config);
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns an RDF dataset or an array of quads, depending on whether
   * the message contains a dataset or prose.
   */
  toRDF(){
    if (this.#config.isProse) {
      return this.#statements.map(s => s.toRDF());
    }
    const dataset = datasetFactory.dataset();
    for (const s of this.#statements) {
      dataset.add(s.toRDF());
    }
    return dataset;
  }

  /**
   * Creates a Dataflow message.
   * @param {Object} messageObject The message as a JavaScript object
   * @returns {(DataflowMessage | null)}
   */
  static fromObject(messageObject){
    if(!isPlainObject(messageObject))return null;
    try {
      const version = messageObject.rdfdataflow?.version;
      if(version !== DATAFLOW_VERSION)return null;

      let prefixes = messageObject.head?.prefixes;
      
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns the message as a JavaScript object that can be serialised to a JSON string.
   * 
   * @example A JavaScript object representing a simple Dataflow message.
   * ```javascript
   * {
   *   "rdfdataflow": {"version": "2.0"},
   *   "dataset": [
   *     [ // "<https://site.example/#xyz>'s name is Xyz."
   *       {"type": "iri", "value": "ex:xyz"},
   *       {"type": "iri", "value": "schema:givenName"},
   *       {"type": "literal", "value": "Xyz", "language": "tr"}
   *     ]
   *   ]
   * }
   * ```
   * 
   * @example A JavaScript object representing a Dataflow message containing prefixes and statements about statements.
   * ```javascript
   * {
   *   "rdfdataflow": {"version": "2.0"},
   *   "head": {
   *     "prefixes": { // prefixes that can be used in IRI values
   *       "schema": "https://schema.org/",
   *       "xsd": "http://www.w3.org/2001/XMLSchema#",
   *       "ex": "https://site.example/#"
   *     }
   *   },
   *   "dataset": [
   *     [ // "<https://site.example/#xyz>'s name is Xyz."
   *       {"type": "iri", "value": "ex:xyz"},
   *       {"type": "iri", "value": "schema:givenName"},
   *       {"type": "literal", "value": "Xyz", "language": "tr"}
   *     ],
   *     [ // "<https://site.example/#xyz>'s name is Xyz since December 25, 1999."
   *       {
   *         "type": "triple",
   *         [
   *           {"type": "iri", "value": "ex:xyz"},
   *           {"type": "iri", "value": "schema:givenName"},
   *           {"type": "literal", "value": "Xyz", "language": "tr"}
   *         ]
   *       },
   *       {"type": "iri", "value": "ex:since"},
   *       {"type": "literal", "value": "1999-12-25", "datatype": "xsd:date"},
   *     ]
   *   ]
   * }
   * ```
   * 
   * @returns {Object}
   */
  toObject(){
    const 
    res        = {rdfdataflow: {version: DATAFLOW_VERSION}},
    bodyKey    = this.#config.isProse ? 'prose' : 'dataset',
    statements = this.#statements.map(s => s.toObject(this.#config.prefixes));

    // head
    if (Object.keys(this.#config.prefixes).length > 0) {
      res.head = {prefixes: {}};
      for (const [prefix, anIri] of Object.entries(this.#config.prefixes)) {
        res.head.prefixes[prefix] = `${anIri}`;
      }
    }

    // body
    res[bodyKey] = statements;

    return res;
  }

  print(includeConfig){
    console.group(`Dataflow message containing ${this.#config.isProse ? 'prose' : 'an RDF dataset'}:`);

    if (includeConfig === true) {
      console.group('Config:');
      console.info(`${JSON.stringify(this.#config, null, 2)}`);
      console.groupEnd();
    }

    console.group('Statements:');
    for (const s of this.#statements) {
      s.print();
    }
    console.groupEnd();

    console.groupEnd();
  }

}


/**
 * A Dataflow statement, which is a [subject, property, object, graph?] tuple.
 */
class Statement {
  /**
   * @type {(NamedNode | BlankNode | Triple)}
   */
  #subject;
  
  /**
   * @type {NamedNode}
   */
  #predicate;

  /**
   * @type {(NamedNode | BlankNode | Literal)}
   */
  #object;
  
  /**
   * @type {(NamedNode | BlankNode | null)}
   */
  #graph;

  constructor(subject, predicate, object, graph){
    if(!(
      [NamedNode, BlankNode, Triple].find(termType => subject instanceof termType) &&
      predicate instanceof NamedNode &&
      [NamedNode, BlankNode, Literal].find(termType => object instanceof termType) &&
      (
        graph 
        ? [NamedNode, BlankNode].find(termType => graph instanceof termType)
        : true
      )
    )) throw new TypeError("not a statement");

    this.#subject   = subject;
    this.#predicate = predicate;
    this.#object    = object;
    this.#graph     = graph ?? null;
  }

  static fromRDF(quad){
    // console.debug('Statement from RDF');
    try {
      return new Statement(
        // subject
        NamedNode.fromRDF(quad.subject) || BlankNode.fromRDF(quad.subject) || Triple.fromRDF(quad.subject),

        // predicate
        NamedNode.fromRDF(quad.predicate),

        // object
        NamedNode.fromRDF(quad.object) || BlankNode.fromRDF(quad.object) || Literal.fromRDF(quad.object),

        // graph
        isDefaultGraph(quad.graph) ? null : (NamedNode.fromRDF(quad.graph) || BlankNode.fromRDF(quad.graph))
      );
    } catch (error) {
      return null;
    }
  }

  toRDF(){
    return dataFactory.quad(
      this.#subject.toRDF(),
      this.#predicate.toRDF(),
      this.#object.toRDF(),
      this.#graph ? this.#graph.toRDF() : dataFactory.defaultGraph(),
    );
  }

  static fromObject(statement){
    try {
      
      
    } catch (error) {
      return null;
    }
  }

  toObject(prefixes){
    const res = [this.#subject.toObject(prefixes), this.#predicate.toObject(prefixes), this.#object.toObject(prefixes)];
    if(this.#graph)res.push(this.#graph.toObject(prefixes));
    return res;
  }

  print(){
    console.group('Statement:');

    console.group('Subject:');
    if (this.#subject instanceof Triple) {
      this.#subject.print();
    } else {
      console.info(`${this.#subject}`);
    }
    console.groupEnd();

    console.group('Predicate:');
    console.info(`${this.#predicate}`);
    console.groupEnd();

    console.group('Object:');
    console.info(`${this.#object}`);
    console.groupEnd();
    
    if (this.#graph) {
      console.group('Graph:');
      console.info(`${this.#graph}`);
      console.groupEnd();
    }
    console.groupEnd();
  }

}


class Triple {
  /**
   * @type {(NamedNode | BlankNode)}
   */
  #subject;
  
  /**
   * @type {NamedNode}
   */
  #predicate;

  /**
   * @type {(NamedNode | BlankNode | Literal)}
   */
  #object;
  
  constructor(subject, predicate, object){
    this.#subject   = subject;
    this.#predicate = predicate;
    this.#object    = object;
  }

  static fromRDF(triple){
    // console.debug('Triple from RDF');
    try {
      return new Triple(
        NamedNode.fromRDF(triple.subject) || BlankNode.fromRDF(triple.subject),
        NamedNode.fromRDF(triple.predicate),
        NamedNode.fromRDF(triple.object) || BlankNode.fromRDF(triple.object) || Literal.fromRDF(triple.object),
      );
    } catch (error) {
      return null;
    }
  }

  toRDF(){
    return dataFactory.quad(
      this.#subject.toRDF(),
      this.#predicate.toRDF(),
      this.#object.toRDF(),
    );
  }

  static fromObject(triple){
    try {
      
    } catch (error) {
      return null;
    }
  }

  toObject(prefixes){
    return {
      type: 'triple',
      value: [
        this.#subject.toObject(prefixes),
        this.#predicate.toObject(prefixes),
        this.#object.toObject(prefixes)
      ]
    }
  }

  print(){
    console.group('Triple:');

    console.group('Subject:');
    console.info(`${this.#subject}`);
    console.groupEnd();

    console.group('Predicate:');
    console.info(`${this.#predicate}`);
    console.groupEnd();

    console.group('Object:');
    console.info(`${this.#object}`);
    console.groupEnd();

    console.groupEnd();
  }

}


class NamedNode {
  /** @type {IRI} */
  #value;

  /**
   * 
   * @param {IRI} value 
   * @throws {TypeError}
   */
  constructor(value){
    if(!(value instanceof IRI))throw new TypeError("not an IRI");
    this.#value = value;
  }

  static fromRDF(namedNode){
    // console.debug('NamedNode from RDF');
    try {
      if(namedNode.termType !== 'NamedNode')throw new Error("not a named node");
      return new NamedNode(iri`${namedNode.value}`);
    } catch (error) {
      return null;
    }
  }

  toRDF(){
    return dataFactory.namedNode(`${this.#value}`);
  } 

  static fromObject(namedNode){
    if(!isPlainObject(namedNode))return null;
    try {
      
    } catch (error) {
      return null;
    }
  }

  toObject(prefixes){
    let value = `${this.#value}`;

    for (const [prefix, anIri] of Object.entries(prefixes)) {
      const iriStr = `${anIri}`;
      if (value.startsWith(iriStr)) {
        value = `${prefix}:${value.substring(iriStr.length)}`
      }
      // console.log(`${key}: ${value}`);
    }

    return {type: 'iri', value};
  }

  toString(){
    return `<${this.#value}>`;
  }

}


class BlankNode {
  /** @type {string} */
  #value;

  /**
   * 
   * @param {string} value 
   * @throws {TypeError}
   */
  constructor(value){
    // value must be a non-empty string without spaces
    if(!(
      typeof value === 'string' && /^\S+$/.test(value)
    ))throw new TypeError("not a blank node");
    
    this.#value = value;
  }

  static fromRDF(blankNode){
    // console.debug('Blank node from RDF');
    try {
      if(blankNode.termType !== 'BlankNode')throw new Error("not a blank node");
      return new BlankNode(blankNode.value);
    } catch (error) {
      return null;
    }
  }

  toRDF(){
    return dataFactory.blankNode(`${this.#value}`);
  }
  
  static fromObject(blankNode){
    if(!isPlainObject(blankNode))return null;
    try {
      
    } catch (error) {
      return null;
    }
  }

  toObject(){
    return {type: 'bnode', value: this.#value};
  }

  toString(){
    return `_:${this.#value}`;
  }
}


class Literal {
  /** @type {string} */
  #value;

  /**
   * If this is set, then #datatype is null.
   * @type {(Language | null)} 
   * */
  #language;

  /**
   * If #language is set, then this must not be null.
   * @type {boolean | null)} 
   * 
  */
  #directionIsLtr;

  /** 
   * If this is set, then #language is null.
   * @type {(NamedNode | null)} 
   * */
  #datatype;

  /**
   * 
   * @param {string} value 
   * @param {(Language | undefined | null)} language 
   * @param {(boolean | undefined | null)} directionIsLtr true by default
   * @param {(NamedNode | undefined | null)} datatype 
   * @throws {TypeError}
   */
  constructor(value, language, directionIsLtr, datatype){
    // check args
    if(typeof value !== 'string')throw new TypeError('not a value');
    if(!(language instanceof Language)) language = null;
    if(typeof directionIsLtr !== 'boolean') directionIsLtr = null;
    if(!(datatype instanceof NamedNode)) datatype = null;
    if(language && directionIsLtr === null) directionIsLtr = true;
    if(language && datatype)throw new TypeError('literal cannot have both a datatype and a language');
    if(!language && !datatype)throw new TypeError('literal must have either a datatype or a language');

    this.#value          = value;
    this.#language       = language;
    this.#directionIsLtr = directionIsLtr;
    this.#datatype       = datatype;
  }

  static fromRDF(literal){
    // console.debug('Literal from RDF');
    try {
      // console.debug(`value: ${literal.value}`);
      // console.debug(`lang: ${literal.language}`);
      // console.debug(`dir: ${literal.direction}`);
      const lang = Language.fromCode(literal.language?.split('-')[0]);
      // console.debug(`lang: ${lang}`);
      // console.debug(`datatype: ${JSON.stringify(literal.datatype)}`);
      return new Literal(
        literal.value, 
        lang, 
        lang ? (literal.direction !== 'rtl') : null,
        lang ? null : NamedNode.fromRDF(literal.datatype)
      );
    } catch (error) {
      return null;
    }
  }

  toRDF(){
    if(this.#datatype)return dataFactory.literal(this.#value, this.#datatype.toRDF());
    return (
      dataFactory.literal(
        this.#value, 
        {
          language : this.#language.iso639_1,
          direction: this.#directionIsLtr ? 'ltr': 'rtl'
        }
      )
    );
  }

  static fromObject(blankNode){
    if(!isPlainObject(blankNode))return null;
    try {
      
    } catch (error) {
      return null;
    }
  }

  toObject(prefixes){
    const res = {type: 'literal', value: this.#value};
    if(this.#language){
      res.language = `${this.#language}`;
      // console.debug(`directionIsLtr: ${this.#directionIsLtr}`);

      if((typeof this.#directionIsLtr === 'boolean') && !this.#directionIsLtr)res.direction = 'rtl';
    } else {
      res.datatype = this.#datatype.toObject(prefixes);
    }
    return res;
  }

  toString(){
    // console.debug(`lang: ${this.#language}`);
    // console.debug(`datatype: ${this.#datatype}`);

    let res = `"${this.#value}"`;
    if(this.#language)res+= `@${this.#language}`;
    if(this.#datatype)res+= `^^${this.#datatype}`;
    return res;
  }
}



export {
  DATAFLOW_VERSION, DATAFLOW_CONTENT_TYPE, DATAFLOW_FILE_EXTENSION, DataflowMessage
};

export default {
  DATAFLOW_VERSION, DATAFLOW_CONTENT_TYPE, DATAFLOW_FILE_EXTENSION, DataflowMessage
};
