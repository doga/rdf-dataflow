<p align="left">
<a href="https://www.w3.org/TR/rdf12-concepts/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/doga/doga/main/logos/rdf.svg" height="85" alt="RDF logo" /></a>
</p>

# RDF Dataflow

**RDF Dataflow** (or **Dataflow** for short) is a JSON-based message format for [RDF](https://www.w3.org/TR/rdf12-concepts/) data.

RDF has a dual nature:

- It's a way of representing (semantic) data.
- It's a new language for machines and software, mainly for those that have AI/LLM capabilities, but not only. Indeed, an RDF statement can be seen as being structured as a subject+verb+object triple, and can be converted to a human language.

Dataflow 2.x fully supports both uses of RDF:

- **A Dataflow message can contain an RDF dataset**, where the order of statements is not significant, and where duplicate statements are just a waste of bandwidth.
- **A Dataflow message can contain prose whereby machines communicate between them**. Such a message is structured as an ordered array of RDF statements, where the duplication of statements is significant.

## The Dataflow format

- `types.mts` describes this format.
- The content type for Dataflow messages is `application/x-rdfdataflow+json`.
- The file extension for Dataflow files is `.rdfdataflow.json`.

## Sample Dataflow messages

### A simple message containing a dataset

"<https://site.example/#jim>'s name is Jim."

```json
{
  "rdfdataflow": { "version": "2.0" },
  "dataset": [
    [
      { "type: "iri", "value": "https://site.example/#jim" },
      { "type: "iri", "value": "https://schema.org/givenName" },
      { "type: "literal", "value": "Jim" }
    ]
  ]
}
 ```

### A message containing a more complex dataset

Contains a statement about a statement: "<https://site.example/#xyz>'s name is Xyz. <https://site.example/#xyz>'s name is Xyz since 1999-12-25."

```json
{
  "rdfdataflow": { "version": "2.0" },
  "head": {
    "prefixes": {
      "ex"    : "https://site.example/",
      "schema": "https://schema.org/",
      "xsd"   : "http://www.w3.org/2001/XMLSchema#"
    }
  },
  "dataset": [
    [
      { "type": "iri", "value": "ex:xyz" },
      { "type": "iri", "value": "schema:givenName" },
      { "type": "literal", "value": "Xyz", "language": "tr" }
    ],
    [
      {
        "type": "triple",
        "value": [
          { "type": "iri", "value": "ex:xyz" },
          { "type": "iri", "value": "schema:givenName" },
          { "type": "literal", "value": "Xyz", "language": "tr" }
        ]
      },
      { "type": "iri", "value": "ex:since" },
      { "type": "literal", "value": "1999-12-25", "datatype": "xsd:date" }
    ]
  ]
}
 ```

### A message containing prose

"<https://site.example/jimbo>'s name is Jim Bo. <https://site.example/jimbo>'s mailbox is `mailto:jim.bo@site.example`."

```json
{
  "rdfdataflow": { "version": "2.0" },
  "head": {
    "prefixes": {
      "ex"  : "https://site.example/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "xsd" : "http://www.w3.org/2001/XMLSchema#"
    }
  },
  "prose": [
    [
      { "type": "iri", "value": "ex:jimbo" },
      { "type": "iri", "value": "foaf:name" },
      { "type": "literal", "value": "Jim Bo" }
    ],
    [
      { "type": "iri", "value": "ex:jimbo" },
      { "type": "iri", "value": "foaf:mbox" },
      { "type": "literal", "value": "mailto:jim.bo@site.example", "datatype": "xsd:anyURI" }
    ]
  ]
}
```

## Dataflow compared to other RDF formats

`RDF Dataflow` is suitable whenever:

- RDF 1.2 support is required, in particular whenever making statements about statements should be possible.
- Serialisers and deserialisers should be easy to implement.
- Document completeness (= non-truncation) should be easy to verify by examining the document contents.

Where the other RDF formats are currently falling short:

- The [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/) does not support RDF 1.2, and its purpose is to serialise many types of SPARQL results, not only RDF datasets. `RDF Dataflow` is derived from this format.

- [JSON-LD](https://www.w3.org/TR/json-ld11/) is another JSON-based format but it does not yet support RDF 1.2 (as of July 2025). This is a terse format and writing serialisers and deserialisers for it is a non-trivial task. RDF 1.2 support is on their roadmap, which will make this format terser still.

- [Turtle](https://www.w3.org/TR/rdf12-turtle/) and [TriG](https://www.w3.org/TR/rdf12-trig/) support RDF 1.2, but  writing serialisers and deserialisers for those formats is non-trivial, and they make it impossible to ensure that a document hasn't been truncated.

- [N-Quads](https://www.w3.org/TR/rdf12-n-quads/) and [N-Triples](https://w3c.github.io/rdf-n-triples/spec/) support RDF 1.2, but writing serialisers and deserialisers for those formats is somewhat more difficult than for `RDF Dataflow`, and these formats also make it impossible to ensure that a document hasn't been truncated.

## Usage example

<details data-mdrb>
<summary>RDF to Dataflow to JSON and back.</summary>

<pre>
description = '''
RDF to Dataflow to JSON and back
'''
</pre>
</details>

```javascript
import N3 from 'https://esm.sh/gh/rdfjs/N3.js@v2.0.3/src/index.js';
import { 
  DATAFLOW_VERSION, DATAFLOW_CONTENT_TYPE, DATAFLOW_FILE_EXTENSION, DataflowMessage 
} from 'https://esm.sh/gh/doga/rdf-dataflow@2.0.1/mod.mjs';

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
RDF dataset:
  Quad:
    Subject:   https://site.example/xyz
    Predicate: https://schema.org/givenName
    Object:    Xyz
  Quad:
    Subject quad:
      Subject:   https://site.example/xyz
      Predicate: https://schema.org/givenName
      Object:    Xyz
    Predicate: https://site.example/since
    Object:    1999-12-25
Dataflow message containing an RDF dataset:
  Statements:
    Statement:
      Subject:
        <https://site.example/xyz>
      Predicate:
        <https://schema.org/givenName>
      Object:
        "Xyz"@tr
    Statement:
      Subject:
        Triple:
          Subject:
            <https://site.example/xyz>
          Predicate:
            <https://schema.org/givenName>
          Object:
            "Xyz"@tr
      Predicate:
        <https://site.example/since>
      Object:
        "1999-12-25"^^<http://www.w3.org/2001/XMLSchema#date>
```

```json
{
  "rdfdataflow": {
    "version": "2.0"
  },
  "head": {
    "prefixes": {
      "ex": "https://site.example/",
      "schema": "https://schema.org/",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    }
  },
  "dataset": [
    [
      {
        "type": "iri",
        "value": "ex:xyz"
      },
      {
        "type": "iri",
        "value": "schema:givenName"
      },
      {
        "type": "literal",
        "value": "Xyz",
        "language": "tr"
      }
    ],
    [
      {
        "type": "triple",
        "value": [
          {
            "type": "iri",
            "value": "ex:xyz"
          },
          {
            "type": "iri",
            "value": "schema:givenName"
          },
          {
            "type": "literal",
            "value": "Xyz",
            "language": "tr"
          }
        ]
      },
      {
        "type": "iri",
        "value": "ex:since"
      },
      {
        "type": "literal",
        "value": "1999-12-25",
        "datatype": {
          "type": "iri",
          "value": "xsd:date"
        }
      }
    ]
  ]
}
```

```text
Dataflow message containing prose:
  Statements:
    Statement:
      Subject:
        <https://site.example/jimbo>
      Predicate:
        <http://xmlns.com/foaf/0.1/name>
      Object:
        "Jim Bo"^^<http://www.w3.org/2001/XMLSchema#string>
    Statement:
      Subject:
        <https://site.example/jimbo>
      Predicate:
        <http://xmlns.com/foaf/0.1/mbox>
      Object:
        "mailto:jim.bo@site.example"^^<http://www.w3.org/2001/XMLSchema#anyURI>
```

```json
{
  "rdfdataflow": {
    "version": "2.0"
  },
  "head": {
    "prefixes": {
      "ex": "https://site.example/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    }
  },
  "prose": [
    [
      {
        "type": "iri",
        "value": "ex:jimbo"
      },
      {
        "type": "iri",
        "value": "foaf:name"
      },
      {
        "type": "literal",
        "value": "Jim Bo",
        "datatype": {
          "type": "iri",
          "value": "xsd:string"
        }
      }
    ],
    [
      {
        "type": "iri",
        "value": "ex:jimbo"
      },
      {
        "type": "iri",
        "value": "foaf:mbox"
      },
      {
        "type": "literal",
        "value": "mailto:jim.bo@site.example",
        "datatype": {
          "type": "iri",
          "value": "xsd:anyURI"
        }
      }
    ]
  ]
}
```

### Running the usage example

Run the code above by typing this in your terminal (requires [Deno](https://deno.com/) 2+):

```shell
deno run --allow-net --allow-run --allow-env --allow-read jsr:@andrewbrey/mdrb@3.0.4 --dax=false --mode=isolated 'https://raw.githubusercontent.com/doga/rdf-dataflow/refs/heads/main/README.md'
```

∎
