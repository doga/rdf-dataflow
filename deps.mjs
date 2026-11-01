/**
 * Dependencies.
 */

// https://github.com/rdfjs/N3.js
export { Store, Parser, DataFactory, Writer } from 'https://unpkg.com/n3@v2.13.12/browser/n3.esm.min.js';

// https://github.com/doga/IRI
export { 
  iri, IRI, 
  irl, IRL, 
  urn, URN,
  url 
} from "https://cdn.jsdelivr.net/gh/doga/IRI@3.1.7/mod.mjs";

// https://github.com/doga/language
export {
  langTag, LanguageTag, 
  lang, Language
} from "https://cdn.jsdelivr.net/gh/doga/language@1.2.1/mod.mjs";
