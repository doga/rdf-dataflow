import {Store, Parser, DataFactory as t} from 'https://unpkg.com/n3@v2.13.12/browser/n3.esm.min.js';
import { 
  DATAFLOW_VERSION, DatasetMessage, ProseMessage 
} from '../mod.mjs';

run();

function run() {
  const
  parser   = new Parser(),

  // Create an in-memory RDF dataset.
  dataset  = new Store(),

  // Import a Turtle file into the dataset.
  dataset2 = parser.parse(`
    # "<https://site.example/xyz>'s name is Xyz."
    PREFIX ex: <https://site.example/>
    PREFIX schema: <https://schema.org/>
    ex:xyz schema:givenName 'Xyz'@tr. 
  `);
  dataset.addAll(dataset2);

  // Programmatically add a statement to the dataset.
  dataset.add(t.quad( // "<https://site.example/xyz>'s name is Xyz since December 25, 1999."
    t.triple(
      t.namedNode('https://site.example/xyz'),
      t.namedNode('https://schema.org/givenName'),
      t.literal('Xyz', 'tr-TR')
    ),
    t.namedNode('https://site.example/since'),
    t.literal('1999-12-25', t.namedNode('http://www.w3.org/2001/XMLSchema#date'))
  ));
  displayDataset(dataset);


  const 
  // Build a Dataflow message containing a dataset.
  message = new DatasetMessage(
    dataset,
    {
      ex    : 'https://site.example/',
      schema: 'https://schema.org/',
      xsd   : 'http://www.w3.org/2001/XMLSchema#'
    }
  );
  console.info('message',JSON.stringify(message.serialise(), null, 2));

  const
  /**
   * An RDF dataset read from a Dataflow message.
   * @type {Object} A DatasetCore object.
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore}
   **/
  rdfDataset = message.dataset;
  console.debug(`rdfDataset.size`, rdfDataset.size)


  // Build a Dataflow message containing prose.
  const message2 = new ProseMessage(
    // In prose, the order and repetition of statements are significant
    [ 
      // <https://site.example/jimbo>'s name is Jim Bo.
      t.quad(
        t.namedNode('https://site.example/jimbo'),
        t.namedNode('http://xmlns.com/foaf/0.1/name'),
        t.literal('Jim Bo')
      ),

      // <https://site.example/jimbo>'s mailbox is "mailto:jim.bo@site.example".
      t.quad(
        t.namedNode('https://site.example/jimbo'),
        t.namedNode('http://xmlns.com/foaf/0.1/mbox'),
        t.literal(
          'mailto:jim.bo@site.example', 
          t.namedNode('http://www.w3.org/2001/XMLSchema#anyURI')
        )
      ),
    ], 
    {
      ex  : 'https://site.example/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      xsd : 'http://www.w3.org/2001/XMLSchema#',
    }
  );
  console.info(JSON.stringify(message2.serialise(), null, 2));

  const
  // /**
  //  * Prose read from a Dataflow message.
  //  * @type {Object[]} An array of quads.
  //  * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad}
  //  **/
  // prose = message2.statements,

  /**
   * Dataflow message is read from JSON.
   */
  message3 = ProseMessage.deserialise(
    {
      "rdfdataflow": { "version": "3.0" },
      "head": {
        "prefixes": {
          "ex"  : "https://site.example/",
          "foaf": "http://xmlns.com/foaf/0.1/",
          "xsd" : "http://www.w3.org/2001/XMLSchema#"
        }
      },
      "prose": [
        [
          {
            "type" : "triple",
            "value": [
              { "type": "iri", "value": "ex:jimbo" },
              { "type": "iri", "value": "foaf:name" },
              { "type": "literal", "value": "Jim Bo", "language": "en-US"}
            ]
          },
          { "type": "iri", "value": "ex:since" },
          { "type": "literal", "value": "1999-12-25", "datatype": "xsd:date" }
        ]
      ]
    }
  );
  console.info(JSON.stringify(message3.serialise(), null, 2));
}

function displayDataset(dataset) {
  console.group('\nRDF dataset:');
  for (const quad of dataset) {
    const {subject, predicate, object} = quad;
    console.group('Quad:');
    if(subject.termType === 'Quad') {
      console.group('Subject quad:');
      console.info(`Subject:   ${subject.subject.value}`)
      console.info(`Predicate: ${subject.predicate.value}`)
      console.info(`Object:    ${subject.object.value}`)
      console.groupEnd();
    } else {
      console.info(`Subject:   ${subject.value}`)
    }
    console.info(`Predicate: ${predicate.value}`)
    console.info(`Object:    ${object.value}`)
    console.groupEnd();
  }
  console.groupEnd();
}
