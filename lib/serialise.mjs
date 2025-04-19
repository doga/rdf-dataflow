
/**
 * Reads an RDF dataset and produces an RDF-Dataflow serialisation.
 *
 * @param {object}
 * @returns {object} 
 * @throws {TypeError} 
 * @see {@link https://rdf4j.org/documentation/programming/rdfstar/#extended-sparql-json-format | RDF4J's Extended JSON format for SPARQL-Star query results}
 * @see {@link https://www.w3.org/TR/sparql11-results-json/ | SPARQL 1.1 Query Results JSON Format}
 * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
 */
function fromDataset(dataset) {
  try {
    const bindings = [];
    for (const quad of dataset) {
      const 
      binding = {
        s: fromSubject(quad.subject),
        p: fromPredicate(quad.predicate),
        o: fromObject(quad.object),
      },
      graph = fromGraph(quad.graph);

      if (graph) {
        binding.g = graph;
      }
      bindings.push(binding);
    }
    return {head: { terms: ['s', 'p', 'o', 'g'] }, dataset: bindings};
  } catch (error) {
    throw new TypeError(`${error}`);
  }
}


function fromSubject(term) {
  const jsonable = fromQuad(term) || fromNamedNode(term) || fromBlankNode(term);
  if (!jsonable) {
    throw new Error("not a subject");
  }
  return jsonable;
}


function fromPredicate(term) {
  const jsonable = fromNamedNode(term);
  if (!jsonable) {
    throw new Error("not a predicate");
  }
  return jsonable;
}


function fromObject(term) {
  const jsonable = fromNamedNode(term) || fromBlankNode(term) || fromLiteral(term);
  if (!jsonable) {
    throw new Error("not an object");
  }
  return jsonable;
}


function fromGraph(term) {
  if (term.termType === 'DefaultGraph') {
    return null;
  }
  const jsonable = fromNamedNode(term) || fromBlankNode(term);
  if (!jsonable) {
    throw new Error("not an object");
  }
  return jsonable;
}


function fromQuad(term) {
  if (term.termType !== 'Quad') {
    return null;
  }
  const 
  value = {
    s: fromSubject(term.subject),
    p: fromPredicate(term.predicate),
    o: fromObject(term.object),
  },
  graph = fromGraph(term.graph);

  if (graph) {
    value.g = graph;
  }
  return {
    type: 'quad',
    value
  };
}


function fromNamedNode(term) {
  if (term.termType !== 'NamedNode') {
    return null;
  }
  return {
    type: 'uri', value: `${term.value}`
  };
}


function fromBlankNode(term) {
  if (term.termType !== 'BlankNode') {
    return null;
  }
  return {
    type: 'bnode', value: `${term.value}`
  };
}


function fromLiteral(term) {
  if (term.termType !== 'Literal') {
    return null;
  }
  const literal = {
    type: 'literal', value: `${term.value}`
  };
  if (term.language !== '') {
    // BUG not dealing with lang dir: "If the literal has a language and a direction, its datatype has the IRI "http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString". https://rdf.js.org/data-model-spec/#literal-interface
    literal['xml:lang'] = term.language;
  }
  if (term.datatype) { // should always happen
    literal.datatype = `${term.datatype.value}`;
  }
  return literal;
}

export {fromDataset};
