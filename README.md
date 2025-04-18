<p align="left">
<a href="https://www.w3.org/TR/rdf12-concepts/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/doga/doga/main/logos/rdf.svg" height="85" alt="RDF logo" /></a>
</p>

# RDF Dataflow reader/writer

This library introduces a new RDF serialisation format called `RDF Dataflow` that is based on the [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/), but the use case for RDF Dataflow is somewhat different:

- __RDF Dataflow is only for serialising RDF datasets__, whereas the other format represents any SPARQL query result, including results that that do not contain an RDF dataset, such as `SELECT` results.
- __RDF Dataflow supports the reification/annotation feature of [RDF 1.2 aka RDF Star](https://www.w3.org/TR/rdf12-concepts/#section-triple-terms-reification)__ where the subject of an RDF statement can be another RDF statement.

The content type for RDF Dataflow documents is `application/x-rdf-dataflow+json`.

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
import { fromDataset, toDataset } from 'https://esm.sh/gh/doga/rdf-dataflow@1.0.1/mod.mjs';
import rdf from 'https://esm.sh/gh/rdfjs/dataset@v2.0.2';
import t from 'https://esm.sh/gh/rdfjs/data-model@v2.1.0';

// Create the in-memory RDF dataset.
const
datasetIn = rdf.dataset(),

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

console.group('RDF dataset written as a Dataflow object:');
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
step 1 of 1 // RDF dataset to RDF-Dataflow and back.

RDF dataset written as a Dataflow object:
    {
      "head": {
        "vars": [
          "s",
          "p",
          "o",
          "g"
        ]
      },
      "results": {
        "bindings": [
          {
            "s": {
              "type": "triple",
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
