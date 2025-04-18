import type * as rdf from './lib/pulled-in/rdfjs/types@v2.0.1/index.d.ts';

type Dataflow = {
  head   : Head,
  results: Results,
};

type Head = {
  vars: ['s','p','o','g']
};

type Results = {
  bindings: Binding[]
};

type Binding = TripleValue & {
  g?: NamedNode | BlankNode
};

type Triple = {
  type: 'triple',
  value: TripleValue
};

type TripleValue = {
  s: Triple | NamedNode | BlankNode,
  p: NamedNode,
  o: NamedNode | BlankNode | Literal,
};

type NamedNode = {
  type: 'uri',
  value: string // IRI
};

type BlankNode = {
  type: 'bnode',
  value: string
};

type Literal = BareLiteral | AnnotatedLiteral;

type BareLiteral = {
  type: 'literal',
  value: string,
};

type AnnotatedLiteral = BareLiteral & (
  {'xml:lang': string} | 
  {datatype: string} // IRI
);

export type { Dataflow, Binding, rdf };
