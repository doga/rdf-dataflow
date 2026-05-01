/**
 * @file The formal definition of the "RDF Dataflow" message format.
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @see {@link https://github.com/doga/rdf-dataflow}
 */

import type * as rdf from './lib/pulled-in/rdfjs/types-v2.0.1/index.d.ts';

type DataflowMessage = Dataset | Prose;

/**
 * A Dataflow message containing a dataset.
 * Order of statements is not significant.
 * Repeating the same statement several times is allowed but is equivalent to it appearing only once.
 * @example A simple dataset message.
 * Statement:
 * - "<https://site.example/#xyz>'s name is Xyz."
 * ```json
 * {
 *   "rdfdataflow": {"version": "2.0"},
 *   "dataset": [
 *     [
 *       {"type: "iri", "value": "https://site.example/#xyz"},
 *       {"type: "iri", "value": "https://schema.org/givenName"},
 *       {"type: "literal", "value": "Xyz", "language": "tr"}
 *     ]
 *   ]
 * }
 * ```
 * @example A dataset message that factors out IRI prefixes and has statements about statements.
 * Statements:
 * - "<https://site.example/#xyz>'s name is Xyz."
 * - "<https://site.example/#xyz>'s name is Xyz since December 25, 1999."
 * ```json
 * {
 *   "rdfdataflow": {"version": "2.0"},
 *   "head": {
 *     "prefixes": {
 *       "ex": "https://site.example/#",
 *       "schema": "https://schema.org/",
 *       "xsd": "http://www.w3.org/2001/XMLSchema#"
 *     }
 *   },
 *   "dataset": [
 *     [
 *       {"type: "iri", "value": "ex:xyz"},
 *       {"type: "iri", "value": "schema:givenName"},
 *       {"type: "literal", "value": "Xyz", "language": "tr"}
 *     ],
 *     [
 *       {
 *         "type": "triple",
 *         "value": [
 *           {"type: "iri", "value": "ex:xyz"},
 *           {"type: "iri", "value": "schema:givenName"},
 *           {"type: "literal", "value": "Xyz", "language": "tr"}
 *         ]
 *       },
 *       {"type: "iri", "value": "ex:since"},
 *       {"type: "literal", "value": "1999-12-25", "datatype": "xsd:date"}
 *     ]
 *   ]
 * }
 * ```
 */
type Dataset = Header & {dataset: Statement[]};

/**
 * A Dataflow message containing prose.
 * Order of statements is significant. 
 * Repeating the same statement several times is allowed and is significant.
 * Suitable to be translated into human prose.
 * @example A simple prose message.
 * Statement:
 * 1. "<https://site.example/#xyz>'s name is Xyz."
 * ```json
 * {
 *   "rdfdataflow": {"version": "2.0"},
 *   "prose": [
 *     [
 *       {"type: "iri", "value": "https://site.example/#xyz"},
 *       {"type: "iri", "value": "https://schema.org/givenName"},
 *       {"type: "literal", "value": "Xyz", "language": "tr"}
 *     ]
 *   ]
 * }
 * ``` */
type Prose = Header & {prose: Statement[]};

type Header = {
  rdfdataflow: {version: '2.0'},
  head?      : Head,
};

type Head = {
  prefixes?: Prefixes,
};

type Prefixes  = Record<PrefixTag, IriString>;
type PrefixTag = string;
type IriString = string;

type Statement = Triple | Quad;
type Triple    = [Subject, Predicate, Object_];
type Quad      = [Subject, Predicate, Object_, Graph];

type Subject   = NamedNode | BlankNode | TripleTerm;
type Predicate = NamedNode;
type Object_   = NamedNode | BlankNode | Literal;
type Graph     = NamedNode | BlankNode;

type TripleTerm = {
  type : 'triple',
  value: Triple
};

type NamedNode = {
  type : 'iri',
  value: string // value is an IRI string or has the form 'prefix:...'
};

type BlankNode = {
  type : 'bnode',
  value: string
};

type Literal = BareLiteral | LangLiteral | DirLangLiteral | TypedLiteral;

/**
 * Datatype is <http://www.w3.org/2001/XMLSchema#string>
 */
type BareLiteral = {
  type : 'literal',
  value: string,
};

/**
 * Datatype is <http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>.
 * Direction is "ltr".
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646 | RFC 5646}
 */
type LangLiteral = BareLiteral & {language : string};

/**
 * Datatype is <http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString>
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646 | RFC 5646}
 */
type DirLangLiteral = LangLiteral & {direction: 'ltr' | 'rtl'};  // writing direction.

type TypedLiteral = BareLiteral & {datatype: string}; // datatype is an IRI string or has the form 'prefix:...'

export type {
  DataflowMessage, Dataset, Prose, 
  Header, Head, Prefixes, PrefixTag, IriString, Statement, Triple, Quad, Subject, Predicate, Object_, Graph, 
  NamedNode, BlankNode, Literal, BareLiteral, LangLiteral, DirLangLiteral, TypedLiteral, TripleTerm,
  rdf 
};
