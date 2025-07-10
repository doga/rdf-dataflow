/**
 * @file The formal definition of the "RDF Dataflow" data format.
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @see {@link https://github.com/doga/rdf-dataflow}
 */

import type * as rdf from './lib/pulled-in/rdfjs/types@v2.0.1/index.d.ts';

type Dataflow = {
  head?  : Head,
  dataset: QuadValue[],
};

type Head = {
  terms: Terms
};

type Terms = {
  subject  : 's',
  predicate: 'p',
  object   : 'o',
  graph    : 'g',
}

type Quad = {
  type: 'quad',
  value: QuadValue
};

type QuadValue = {
  // subject
  s: Quad | NamedNode | BlankNode,

  // predicate
  p: NamedNode,

  // object
  o: NamedNode | BlankNode | Literal,

  // graph
  g?: NamedNode | BlankNode
};

type NamedNode = {
  type : 'uri',
  value: string  // IRI
};

type BlankNode = {
  type : 'bnode',
  value: string
};

type Literal = BareLiteral | AnnotatedLiteral;

type BareLiteral = {
  type : 'literal',
  value: string,
};

type AnnotatedLiteral = BareLiteral & (
  {
    lang : string, // https://www.rfc-editor.org/rfc/rfc5646
    dir ?: 'ltr' | 'rtl'  // writing direction.
  } | 
  {datatype: string} // IRI
);

export type { Dataflow, rdf };
