import {Store, Parser, DataFactory as t} from 'https://unpkg.com/n3@v2.13.12/browser/n3.esm.min.js';
import { 
  DATAFLOW_VERSION, DatasetMessage, ProseMessage 
} from '../mod.mjs';

run();

async function run() {
  const
  parser = new Parser(),

  // Create an in-memory RDF dataset.
  datasetIn = new Store(),

  // Read statements written in Turtle format.
  statements = await parser.parse(`
    PREFIX ex: <https://site.example/>
    PREFIX schema: <https://schema.org/>
    ex:xyz schema:givenName 'Hasan'@tr. 
  `),
  
  // Create an in-memory statement.
  statement = t.quad(
    t.quad(
      t.namedNode('https://site.example/xyz'),
      t.namedNode('https://schema.org/givenName'),
      t.literal('Hasan', 'tr')
    ),
    t.namedNode('https://site.example/since'),
    t.literal('1999-12-25', t.namedNode('http://www.w3.org/2001/XMLSchema#date'))
  );
  
  // This is equivalent to `dataset.addAll([...statements, statement]);`
  datasetIn.addAll([...statements, ...statements, statement]);

  const 
  prefixes = {
    ex    : 'https://site.example/',
    schema: 'https://schema.org/',
    xsd   : 'http://www.w3.org/2001/XMLSchema#'
  },

  // Dataflow message containing a dataset.
  datasetMsg     = new DatasetMessage(datasetIn, prefixes),
  datasetMsgStr  = JSON.stringify(datasetMsg.serialise(), null, 2),
  // datasetMsg2    = DatasetMessage.deserialise(JSON.parse(datasetMsgStr)),
  // datasetMsgStr2 = JSON.stringify(datasetMsg2.serialise(), null, 2),

  // Dataflow message containing prose.
  proseMsg     = new ProseMessage([...statements, ...statements, statement], prefixes),
  proseMsgStr  = JSON.stringify(proseMsg.serialise(), null, 2),
  proseMsg2    = ProseMessage.deserialise(JSON.parse(proseMsgStr)),
  proseMsgStr2 = JSON.stringify(proseMsg2.serialise(), null, 2);

  console.info('Dataset message (no duplicate statements):', datasetMsgStr);
  console.info('Prose message (duplicates allowed, order preserved):', proseMsgStr);
  // console.info(`Deserialisation is the reverse of serialisation for Dataset message: `, datasetMsgStr === datasetMsgStr2);
  console.info(`Deserialisation is the reverse of serialisation for Prose message: `, proseMsgStr === proseMsgStr2);

  // const
  // /**
  //  * An RDF dataset read from a Dataflow message.
  //  * @type {Object} A DatasetCore object.
  //  * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore}
  //  **/
  // rdfDataset = datasetMsg.dataset;
  // console.debug(`rdfDataset.size`, rdfDataset.size)


  // // Build a Dataflow message containing prose.
  // const message2 = new ProseMessage(
  //   // In prose, the order and repetition of statements are significant
  //   [ 
  //     // <https://site.example/jimbo>'s name is Jim Bo.
  //     t.quad(
  //       t.namedNode('https://site.example/jimbo'),
  //       t.namedNode('http://xmlns.com/foaf/0.1/name'),
  //       t.literal('Jim Bo')
  //     ),

  //     // <https://site.example/jimbo>'s mailbox is "mailto:jim.bo@site.example".
  //     t.quad(
  //       t.namedNode('https://site.example/jimbo'),
  //       t.namedNode('http://xmlns.com/foaf/0.1/mbox'),
  //       t.literal(
  //         'mailto:jim.bo@site.example', 
  //         t.namedNode('http://www.w3.org/2001/XMLSchema#anyURI')
  //       )
  //     ),
  //   ], 
  //   {
  //     ex  : 'https://site.example/',
  //     foaf: 'http://xmlns.com/foaf/0.1/',
  //     xsd : 'http://www.w3.org/2001/XMLSchema#',
  //   }
  // );
  // console.info(JSON.stringify(message2.serialise(), null, 2));

  // const
  // // /**
  // //  * Prose read from a Dataflow message.
  // //  * @type {Object[]} An array of quads.
  // //  * @see {@link https://rdf.js.org/data-model-spec/#quad-interface | Quad}
  // //  **/
  // // prose = message2.statements,

  // /**
  //  * Dataflow message is read from JSON.
  //  */
  // message3 = ProseMessage.deserialise(
  //   {
  //     "rdfdataflow": { "version": "3.0" },
  //     "head": {
  //       "prefixes": {
  //         "ex"  : "https://site.example/",
  //         "foaf": "http://xmlns.com/foaf/0.1/",
  //         "xsd" : "http://www.w3.org/2001/XMLSchema#"
  //       }
  //     },
  //     "prose": [
  //       [
  //         {
  //           "type" : "triple",
  //           "value": [
  //             { "type": "iri", "value": "ex:jimbo" },
  //             { "type": "iri", "value": "foaf:name" },
  //             { "type": "literal", "value": "Jim Bo", "language": "en-US"}
  //           ]
  //         },
  //         { "type": "iri", "value": "ex:since" },
  //         { "type": "literal", "value": "1999-12-25", "datatype": "xsd:date" }
  //       ]
  //     ]
  //   }
  // );
  // console.info(JSON.stringify(message3.serialise(), null, 2));
}

