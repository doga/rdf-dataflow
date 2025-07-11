<p align="left">
<a href="https://www.w3.org/TR/rdf12-concepts/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/doga/doga/main/logos/rdf.svg" height="85" alt="RDF logo" /></a>
</p>

# RDF Dataflow

This JavaScript library introduces:

1. A new JSON-based [RDF 1.2](https://www.w3.org/TR/rdf12-concepts/) serialisation format called `RDF Dataflow`.
1. A serialiser and a deserialiser for RDF Dataflow documents. These functions can run on any JavaScript runtime, both in web browsers and outside of them.

## An open format

`RDF Dataflow` is an open format, and anyone is free to implement serialisers and deserialisers for their preferred runtime:

- The `types.mts` file contains a description of this format.
- The content type of this format is `application/x-rdfdataflow+json`.
- The file extension for this format is `.rdfdataflow.json`.

## When does `RDF Dataflow` make sense as an RDF serialisation format over other formats?

`RDF Dataflow` is preferable whenever:

- RDF 1.2 support is required.
- Serialisers and deserialisers should be easy to implement.
- Document completeness (= non-truncation) should be easy to verify by examining the document contents.

Here is where the other RDF formats are currently falling short:

- The [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/) does not support RDF 1.2, and its purpose is to serialise many types of SPARQL results, not only RDF datasets. `RDF Dataflow` derives from this format.

- [JSON-LD](https://www.w3.org/TR/json-ld11/) is another JSON-based format but it does not yet support RDF 1.2 (as of July 2025). This is a terse format and writing serialisers and deserialisers for it is non-trivial. RDF 1.2 support is on their roadmap, which will make this format terser still.

- [Turtle](https://www.w3.org/TR/rdf12-turtle/) and [TriG](https://www.w3.org/TR/rdf12-trig/) support RDF 1.2, but  writing serialisers and deserialisers for those formats is non-trivial, and they make it impossible to ensure that a document hasn't been truncated.

- [N-Quads](https://www.w3.org/TR/rdf12-n-quads/) and [N-Triples](https://w3c.github.io/rdf-n-triples/spec/) support RDF 1.2 and writing serialisers and deserialisers for those formats is about as simple as `RDF Dataflow`, but these formats make it impossible to ensure that a document hasn't been truncated.

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
  toDataset, fromDataset, contentType, fileExtension,
  emptyDataset, emptyDataflow
} from 'https://esm.sh/gh/doga/rdf-dataflow@1.2.2/mod.mjs';

import t from 'https://esm.sh/gh/rdfjs/data-model@v2.1.0';

// Create an in-memory RDF dataset.
const
datasetIn = emptyDataset(),

// RDF statement #1
subject1   = t.quad(
  t.namedNode('http://site.example/user/123'),
  t.namedNode('http://xmlns.com/foaf/0.1/age'),
  t.literal('23', t.namedNode('http://www.w3.org/2001/XMLSchema#integer'))
),
predicate1 = t.namedNode('http://site.example/certainty'),
object1    = t.literal('0.9', t.namedNode('http://www.w3.org/2001/XMLSchema#decimal')),

// RDF statement #2
subject2   = t.namedNode('http://site.example/user/567'),
predicate2 = t.namedNode('http://www.w3.org/2006/vcard/ns#hasEmail'),
object2    = t.namedNode('mailto:me@site.example'),

// RDF statement #3
subject3   = t.namedNode('http://site.example/product/1'),
predicate3 = t.namedNode('http://purl.org/dc/elements/1.1/description'),
object3    = t.literal('A product', 'en'),

// RDF statement #4
subject4   = t.namedNode('http://site.example/product/1'),
predicate4 = t.namedNode('http://purl.org/dc/elements/1.1/description'),
object4    = t.literal('Bir ürün'),

// RDF statement #5
subject5   = t.namedNode('http://site.example/product/1'),
predicate5 = t.namedNode('http://purl.org/dc/elements/1.1/description'),
object5    = t.literal('منتج', {language: 'ar', direction: 'rtl'});

// Fill up the dataset.
datasetIn.add(t.quad(subject1, predicate1, object1));
datasetIn.add(t.quad(subject2, predicate2, object2));
datasetIn.add(t.quad(subject3, predicate3, object3));
datasetIn.add(t.quad(subject4, predicate4, object4));
datasetIn.add(t.quad(subject5, predicate5, object5));

// Produce an RDF Dataflow object from the dataset.
const
dataflowObject = fromDataset(datasetIn),

// Read the dataset back from Dataflow.
datasetOut = toDataset(dataflowObject);

console.info(`Content type:   "${contentType}"`);
console.info(`File extension: "${fileExtension}"`);

console.group(`RDF dataset written as a Dataflow object:`);
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
Content type:   "application/x-rdfdataflow+json"
File extension: ".rdfdataflow.json"
RDF dataset written as a Dataflow object:
  {
    "head": {
      "terms": {
        "subject": "s",
        "predicate": "p",
        "object": "o",
        "graph": "g"
      }
    },
    "dataset": [
      {
        "s": {
          "type": "quad",
          "value": {
            "s": {
              "type": "uri",
              "value": "http://site.example/user/123"
            },
            "p": {
              "type": "uri",
              "value": "http://xmlns.com/foaf/0.1/age"
            },
            "o": {
              "type": "literal",
              "value": "23",
              "datatype": "http://www.w3.org/2001/XMLSchema#integer"
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
          "value": "http://site.example/user/567"
        },
        "p": {
          "type": "uri",
          "value": "http://www.w3.org/2006/vcard/ns#hasEmail"
        },
        "o": {
          "type": "uri",
          "value": "mailto:me@site.example"
        }
      },
      {
        "s": {
          "type": "uri",
          "value": "http://site.example/product/1"
        },
        "p": {
          "type": "uri",
          "value": "http://purl.org/dc/elements/1.1/description"
        },
        "o": {
          "type": "literal",
          "value": "A product",
          "lang": "en"
        }
      },
      {
        "s": {
          "type": "uri",
          "value": "http://site.example/product/1"
        },
        "p": {
          "type": "uri",
          "value": "http://purl.org/dc/elements/1.1/description"
        },
        "o": {
          "type": "literal",
          "value": "Bir ürün",
          "datatype": "http://www.w3.org/2001/XMLSchema#string"
        }
      },
      {
        "s": {
          "type": "uri",
          "value": "http://site.example/product/1"
        },
        "p": {
          "type": "uri",
          "value": "http://purl.org/dc/elements/1.1/description"
        },
        "o": {
          "type": "literal",
          "value": "منتج",
          "lang": "ar",
          "dir": "rtl"
        }
      }
    ]
  }

RDF dataset read from the Dataflow object:
  Quad:
    Subject quad:
      Subject:   http://site.example/user/123
      Predicate: http://xmlns.com/foaf/0.1/age
      Object:    23
    Predicate: http://site.example/certainty
    Object:    0.9
  Quad:
    Subject:   http://site.example/user/567
    Predicate: http://www.w3.org/2006/vcard/ns#hasEmail
    Object:    mailto:me@site.example
  Quad:
    Subject:   http://site.example/product/1
    Predicate: http://purl.org/dc/elements/1.1/description
    Object:    A product
  Quad:
    Subject:   http://site.example/product/1
    Predicate: http://purl.org/dc/elements/1.1/description
    Object:    Bir ürün
  Quad:
    Subject:   http://site.example/product/1
    Predicate: http://purl.org/dc/elements/1.1/description
    Object:    منتج
```

### Running the usage example

Run the example above by typing this in your terminal (requires [Deno](https://deno.com/) 2+):

```shell
deno run --allow-net --allow-run --allow-env --allow-read jsr:@andrewbrey/mdrb@3.0.4 --dax=false --mode=isolated 'https://raw.githubusercontent.com/doga/rdf-dataflow/refs/heads/main/README.md'
```

∎
