/**
 * @module expand
 * @description IRI expansion.
 */

import { IRI, iri } from "../../deps.mjs";
import { isUndefined, isPlainObject, isString } from "./util.mjs";


/**
 * Expands `prefix:path` into `<IRI of prefix>path`.
 * @param {(IRI | URL | string)} anIri 
 * @param {Object.<string, (IRI | string)>} prefixes 
 * @throws {TypeError}
 * @returns {IRI}
 * @example Expanding an IRI prefix
 * ```javascript
 * const
 * prefixes = { // see https://www.w3.org/TR/rdf-schema/
 *   rdfs: iri`http://www.w3.org/2000/01/rdf-schema#`,
 * },
 * rdfsClass = expandIri('rdfs:Class', prefixes);
 * 
 * rdfsClass instanceof IRI; // true
 * rdfsClass.toString();     // 'http://www.w3.org/2000/01/rdf-schema#Class'
 * ```
 */
function expandIri(anIri, prefixes) {
  if(!(anIri instanceof IRI || anIri instanceof URL || isString(anIri)))throw new TypeError(`a bad IRI`);

  if(anIri instanceof IRI) return anIri;
  if(anIri instanceof URL) return iri`${anIri}`;

  // anIri is a string; expansion may be required
  for (const [prefix, expansion] of Object.entries(prefixes)) {
    if(!anIri.startsWith(`${prefix}:`))continue;
    return iri`${expansion}${anIri.substring(prefix.length+1)}`;
  }
  return iri`${anIri}`;
}


/**
 * Reduces IRI to `prefix:path`.
 * @param {(IRI | URL | string)} anIri 
 * @param {Object.<string, (IRI | string)>} prefixes 
 * @throws {TypeError}
 * @returns {string}
 * @example Expanding an IRI prefix
 * ```javascript
 * const
 * prefixes = { // see https://www.w3.org/TR/rdf-schema/
 *   rdfs: iri`http://www.w3.org/2000/01/rdf-schema#`,
 * },
 * rdfsClass = expandIri('rdfs:Class', prefixes);
 * 
 * rdfsClass instanceof IRI; // true
 * rdfsClass.toString();     // 'http://www.w3.org/2000/01/rdf-schema#Class'
 * ```
 */
function reduceIri(anIri, prefixes) {
  if(!(anIri instanceof IRI || anIri instanceof URL || isString(anIri)))throw new TypeError("bad IRI");
  anIri = `${anIri}`;
  // if (anIri === 'https://site.example/xyz') {
  //   console.debug(`iri: ${anIri}, prefixes`,prefixes);
  // }
  if (!isPlainObject(prefixes))return anIri;
  for (const [prefix, namespaceIri] of Object.entries(prefixes)) {
    const ns = isString(namespaceIri) ? namespaceIri : `${namespaceIri}`;
    if (anIri.startsWith(ns)) {
      // console.debug(`${anIri} prefixed with ${ns}, returning ${prefix}:${anIri.substring(ns.length+1)}`);
      return `${prefix}:${anIri.substring(ns.length)}`;
    } else {
    }
  }
  return anIri;
}


export { expandIri, reduceIri };
