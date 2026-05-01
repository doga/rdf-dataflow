<p align="left">
<a href="https://www.w3.org/TR/rdf12-concepts/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/doga/doga/main/logos/rdf.svg" height="85" alt="RDF logo" /></a>
</p>

# RDF Dataflow

This JavaScript library introduces:

1. A JSON-based [RDF 1.2](https://www.w3.org/TR/rdf12-concepts/) serialisation format called `RDF Dataflow`.
1. A serialiser and a deserialiser for `RDF Dataflow` documents. These functions can run on any JavaScript runtime, both in web browsers and outside of them.

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

Where the other RDF formats are currently falling short:

- The [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/) does not support RDF 1.2, and its purpose is to serialise many types of SPARQL results, not only RDF datasets. `RDF Dataflow` is derived from this format.

- [JSON-LD](https://www.w3.org/TR/json-ld11/) is another JSON-based format but it does not yet support RDF 1.2 (as of July 2025). This is a terse format and writing serialisers and deserialisers for it is a non-trivial task. RDF 1.2 support is on their roadmap, which will make this format terser still.

- [Turtle](https://www.w3.org/TR/rdf12-turtle/) and [TriG](https://www.w3.org/TR/rdf12-trig/) support RDF 1.2, but  writing serialisers and deserialisers for those formats is non-trivial, and they make it impossible to ensure that a document hasn't been truncated.

- [N-Quads](https://www.w3.org/TR/rdf12-n-quads/) and [N-Triples](https://w3c.github.io/rdf-n-triples/spec/) support RDF 1.2, but writing serialisers and deserialisers for those formats is somewhat more difficult than for `RDF Dataflow`, and these formats also make it impossible to ensure that a document hasn't been truncated.

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
import N3 from 'https://esm.sh/gh/rdfjs/N3.js@v2.0.3/src/index.js';
import {DataflowMessage} from './mod.mjs';

const
datasetFactory = new N3.StoreFactory(),
dataFactory    = N3.DataFactory,
displayDataset = dataset => {
  console.group('\nRDF dataset:');
  for (const quad of dataset) {
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
},


// Create an in-memory RDF dataset, and import Turtle data into the dataset.
dataset    = datasetFactory.dataset(),
turtleData = `
  # "<https://site.example/xyz>'s name is Xyz."
  PREFIX ex: <https://site.example/>
  PREFIX schema: <https://schema.org/>
  ex:xyz schema:givenName 'Xyz'@tr. 
`,
parser          = new N3.Parser(),
turtleDataQuads = parser.parse(turtleData);

dataset.addAll(turtleDataQuads);

// Programmatically add quads to the dataset.
dataset.add(dataFactory.quad( // "<https://site.example/xyz>'s name is Xyz since December 25, 1999."
  dataFactory.triple(
    dataFactory.namedNode('https://site.example/xyz'),
    dataFactory.namedNode('https://schema.org/givenName'),
    dataFactory.literal('Xyz', 'tr-TR')
  ),
  dataFactory.namedNode('https://site.example/since'),
  dataFactory.literal('1999-12-25', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'))
));
displayDataset(dataset);


// Build a Dataflow message containing a dataset.
const message = DataflowMessage.fromRDF(
  dataset,
  {
    prefixes: {
      ex    : 'https://site.example/',
      schema: 'https://schema.org/',
      xsd   : 'http://www.w3.org/2001/XMLSchema#'
    }
  }
);
message.print();
console.info(JSON.stringify(message.toObject(), null, 2));

const
/**
 * An RDF dataset read from a Dataflow message.
 * @type {Object} A DatasetCore object.
 * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore}
 **/
rdfDataset = message.toRDF();


// Build a Dataflow message containing prose.
const message2 = DataflowMessage.fromRDF(
  // In prose, the order and repetition of statements are significant
  [ 
    // <https://site.example/jimbo>'s name is Jim Bo.
    dataFactory.quad(
      dataFactory.namedNode('https://site.example/jimbo'),
      dataFactory.namedNode('http://xmlns.com/foaf/0.1/name'),
      dataFactory.literal('Jim Bo')
    ),

    // <https://site.example/jimbo>'s mailbox is "mailto:jim.bo@site.example".
    dataFactory.quad(
      dataFactory.namedNode('https://site.example/jimbo'),
      dataFactory.namedNode('http://xmlns.com/foaf/0.1/mbox'),
      dataFactory.literal(
        'mailto:jim.bo@site.example', 
        dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#anyURI')
      )
    ),
  ], 
  {
    prefixes: {
      ex  : 'https://site.example/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      xsd : 'http://www.w3.org/2001/XMLSchema#',
    },
    isProse: true
  }
);
message2.print();
console.info(JSON.stringify(message2.toObject(), null, 2));

const
/**
 * Prose read from a Dataflow message.
 * @type {Object[]} An array of quads.
 * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad}
 **/
prose = message2.toRDF();
```

Sample output for the code above:

```text
Content type:   "application/x-rdfdataflow+json"
File extension: ".rdfdataflow.json"
RDF dataset written as a Dataflow object:
```

```json
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
```

```text
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
