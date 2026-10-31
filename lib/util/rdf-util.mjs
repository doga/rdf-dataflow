/**
 * @module rdf-util
 * @description Checks the conformance of in-memory JavaScript objects to the RDF/JS specifications.
 * @see {@link https://rdf.js.org/data-model-spec/ | RDF/JS: Data model specification}
 */

import { IRI, iri, langTag } from "../../deps.mjs";
import { isNull, isUndefined, isPlainObject, isString, isEmptyString } from "./util.mjs";


/**
 * Is the arg an RDF term?
 * @param {*} term 
 * @returns {boolean}
 * @see {@link https://rdf.js.org/data-model-spec/#term-interface | Term interface}
 */
function isTerm(term) {
  return (
    isPlainObject(term) && 
    [
      'NamedNode', 'BlankNode', 'Literal', 'Variable', 'DefaultGraph', 
      'Quad', 'Triple' // should have been another term type named 'Triple' for triple-terms; 'Quad' is unsuitable for triple-terms
    ].includes(term.termType) && 
    isString(term.value) 
  );
}


/**
 * Is the arg a named node?
 * @param {*} term 
 * @returns {boolean}
 * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface | NamedNode interface}
 */
function isNamedNode(term) {
  try {
    return (
      isTerm(term) && 
      term.termType === 'NamedNode' &&
      iri`${term.value}` instanceof IRI // wastes compute?
    );
  } catch (error) {
    return false;
  }
}


/**
 * Is the arg a blank node?
 * @param {*} term 
 * @returns {boolean}
 * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface | BlankNode interface}
 */
function isBlankNode(term) {
  try {
    return (
      isTerm(term) && 
      term.termType === 'BlankNode'
    );
  } catch (error) {
    return false;
  }
}


/**
 * Is the arg a literal?
 * @param {*} term 
 * @returns {boolean}
 * @see {@link https://rdf.js.org/data-model-spec/#literal-interface | Literal interface}
 */
function isLiteral(term) {
  if(!isTerm(term))return false;
  if(!(term.termType === 'Literal'))return false;

  // language and direction
  let 
  language         = term.language,
  direction        = term.direction,
  isDirectionGiven = false;

  if (!isString(language)) return false;
  if (!isEmptyString(language)) {
    language = langTag`${language}`; if(isNull(language)) return false;
    isDirectionGiven = ['ltr', 'rtl'].includes(direction);
    if(!(isDirectionGiven || direction === '' || isNull(direction) || isUndefined(direction))) return false;
  } else language = null;
  
  // datatype
  let datatype = iri`http://www.w3.org/2001/XMLSchema#string`; // if datatype is omitted, then it's a plain string

  if (isNamedNode(term.datatype))
  try {
    datatype  = iri`${term.datatype.value}`;
  } catch (error) {
    return false;
  }

  // verify datatype's value
  if (language) {
    if (isDirectionGiven) {
      if(!datatype.equals(iri`http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString`))return false;
    } else {
      if(!datatype.equals(iri`http://www.w3.org/1999/02/22-rdf-syntax-ns#langString`))return false;
    }
  }

  return true;
}


/**
 * Is the arg the default graph term?
 * @param {*} term 
 * @returns {boolean}
 * @see {@link https://rdf.js.org/data-model-spec/#defaultgraph-interface | DefaultGraph interface}
 */
function isDefaultGraph(term) {
  return isTerm(term) && term.termType === 'DefaultGraph' && isEmptyString(term.value);
}


/**
 * Is the arg a quad?
 * @param {*} term 
 * @returns {boolean}
 * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad interface}
 */
function isQuad(term) {
  return (
    // isTerm(term) && term.termType === 'Quad' && isEmptyString(term.value) &&
    isTerm(term) && ['Quad', 'Triple'].includes(term.termType) && isEmptyString(term.value) &&
    // subject
    (isNamedNode(term.subject) || isBlankNode(term.subject) || isQuad(term.subject)) &&
    // predicate
    isNamedNode(term.predicate) &&
    // object
    (isNamedNode(term.object) || isLiteral(term.object) || isBlankNode(term.object)) &&
    // graph
    (isDefaultGraph(term.graph) || isNamedNode(term.graph) || isBlankNode(term.graph))
  );
}

const isTriple = isQuad;

export { isTerm, isNamedNode, isBlankNode, isLiteral, isDefaultGraph, isQuad, isTriple };
