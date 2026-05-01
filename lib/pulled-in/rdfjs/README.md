# RDF/JS-conformant libraries for in-memory RDF datasets

## Usage example

<details data-mdrb>
<summary>Write and read an in-memory RDF dataset</summary>

<pre>
description = '''
Write and read an in-memory RDF dataset
'''
</pre>
</details>

```javascript
import rdf from './mod.mjs';

const
dsFactory = new rdf.DatasetCoreFactory(),
dFactory  = new rdf.DataFactory(),

ds = dsFactory.dataset(),
quad = dFactory.quad(
  dFactory.namedNode('http://site.example/I'),
  dFactory.namedNode('http://site.example/birthDate'),
  dFactory.literal('1966-01-22', dFactory.namedNode('http://www.w3.org/2001/XMLSchema#date')),
);

ds.add(quad);
console.group('\nRDF dataset:');
for (const quad of ds) {
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
