<p align="left">
<a href="https://www.w3.org/TR/rdf12-concepts/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/doga/doga/main/logos/rdf.svg" height="85" alt="RDF logo" /></a>
</p>

# RDF Dataflow

This JavaScript library introduces:

1. A new JSON-based [RDF 1.2](https://www.w3.org/TR/rdf12-concepts/) serialisation format called `RDF Dataflow`.
1. A serialiser and a deserialiser for RDF Dataflow documents. These functions can run on any JavaScript runtime, both in web browsers and outside of them.

## An open format

RDF Dataflow is an open format, and anyone is free to implement serialisers and deserialisers for their preferred runtime.

The `types.mts` file contains a formal definition of this format, which has the content type `application/x-rdf-dataflow+json`.

## When does `RDF Dataflow` make sense as an RDF serialisation format over other formats?

RDF Dataflow is preferable whenever:

- RDF 1.2 support is required.
- Serialisers and deserialisers should be easy to implement.
- Document completeness (= non-truncation) should be easy to verify by examining the document contents.

Here is where the other RDF formats are currently falling short:

- The [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/) does not support RDF 1.2, and its purpose is to serialise many types of SPARQL results, not only RDF datasets.

- [JSON-LD](https://www.w3.org/TR/json-ld11/) is a JSON-based format that does not yet support RDF 1.2 (as of July 2025). It is a terse format and writing serialisers and deserialisers is non-trivial. RDF 1.2 support is on their roadmap, which will make the format terser still.

- The following formats make it impossible to ensure that a document hasn't been truncated: [Turtle](https://www.w3.org/TR/rdf12-turtle/), TriG, N-Triples, N-Quads.

## Usage example

<details data-mdrb>
<summary>RDF dataset to RDF-Dataflow and back.</summary>

<pre>
description = '''
Serialise an RDF dataset to an RDF-Dataflow object and read it back.
'''
</pre>
</details>

```javascript
import { 
  toDataset, fromDataset, emptyDataset, emptyDataflow, contentType 
} from 'https://esm.sh/gh/doga/rdf-dataflow@1.2.0/mod.mjs';

import t from 'https://esm.sh/gh/rdfjs/data-model@v2.1.0';

// Create an in-memory RDF dataset.
const
datasetIn = emptyDataset(),

// RDF statement #1
subject1   = t.quad(
  t.namedNode('http://site.example/user123'),
  t.namedNode('http://xmlns.com/foaf/0.1/age'),
  t.namedNode('23', t.namedNode('http://www.w3.org/2001/XMLSchema#integer'))
),
predicate1 = t.namedNode('http://site.example/certainty'),
object1    = t.literal('0.9', t.namedNode('http://www.w3.org/2001/XMLSchema#decimal')),

// RDF statement #2
subject2   = t.namedNode('http://site.example/user567'),
predicate2 = t.namedNode('http://www.w3.org/2006/vcard/ns#hasEmail'),
object2    = t.namedNode('mailto:me@site.example');

// Fill up the dataset.
datasetIn.add(t.quad(subject1, predicate1, object1));
datasetIn.add(t.quad(subject2, predicate2, object2));

// Produce an RDF Dataflow object from the dataset.
const
dataflowObject = fromDataset(datasetIn),

// Read the dataset back from Dataflow.
datasetOut = toDataset(dataflowObject);

console.group(`RDF dataset written as a Dataflow object (content type "${contentType}"):`);
console.info(JSON.stringify(dataflowObject, null, 2));
console.groupEnd();

console.group('\nRDF dataset read from the Dataflow object:');
for (const quad of datasetOut) {
  console.group('Quad:');
  if(quad.subject.termType === 'Quad') {
    console.group('Subject quad:');
    console.info(`Subject:   ${quad.subject.subject.value}`)
    console.info(`Predicate: ${quad.subject.predicate.value}`)
    console.info(`Object:    ${quad.subject.object.value}`)
    console.groupEnd();
  } else {
    console.info(`Subject:   ${quad.subject.value}`)
  }
  console.info(`Predicate: ${quad.predicate.value}`)
  console.info(`Object:    ${quad.object.value}`)
  console.groupEnd();
}
console.groupEnd();
```

Sample output for the code above:

```text
RDF dataset written as a Dataflow object (content type "application/x-rdf-dataflow+json"):
    {
      "head": {
        "terms": [
          "s",
          "p",
          "o",
          "g"
        ]
      },
      "dataset": [
        {
          "s": {
            "type": "quad",
            "value": {
              "s": {
                "type": "uri",
                "value": "http://site.example/user123"
              },
              "p": {
                "type": "uri",
                "value": "http://xmlns.com/foaf/0.1/age"
              },
              "o": {
                "type": "uri",
                "value": "23"
              }
            }
          },
          "p": {
            "type": "uri",
            "value": "http://site.example/certainty"
          },
          "o": {
            "type": "literal",
            "value": "0.9",
            "datatype": "http://www.w3.org/2001/XMLSchema#decimal"
          }
        },
        {
          "s": {
            "type": "uri",
            "value": "http://site.example/user567"
          },
          "p": {
            "type": "uri",
            "value": "http://www.w3.org/2006/vcard/ns#hasEmail"
          },
          "o": {
            "type": "uri",
            "value": "mailto:me@site.example"
          }
        }
      ]
    }

RDF dataset read from the Dataflow object:
    Quad:
        Subject quad:
            Subject:   http://site.example/user123
            Predicate: http://xmlns.com/foaf/0.1/age
            Object:    23
        Predicate: http://site.example/certainty
        Object:    0.9
    Quad:
        Subject:   http://site.example/user567
        Predicate: http://www.w3.org/2006/vcard/ns#hasEmail
        Object:    mailto:me@site.example
```

### Running the usage example

Run the example above by typing this in your terminal (requires [Deno](https://deno.com/) 2+):

```shell
deno run --allow-net --allow-run --allow-env --allow-read jsr:@andrewbrey/mdrb@3.0.4 --dax=false --mode=isolated 'https://raw.githubusercontent.com/doga/rdf-dataflow/refs/heads/main/README.md'
```

∎
