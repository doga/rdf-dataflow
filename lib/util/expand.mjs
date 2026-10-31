/**
 * @module expand
 * @description IRI expansion.
 */

import { IRI, iri } from "../../deps.mjs";
import { isUndefined, isPlainObject, isString } from "./util.mjs";


/**
 * Expands `prefix:path` into `<IRI of prefix>path`.
 * @param {(IRI | URL | string)} anIri 
 * @param {(Object.<string, IRI> | undefined)} prefixes 
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
  // check args
  // check anIri
  if(!(anIri instanceof IRI || anIri instanceof URL || isString(anIri)))throw new TypeError("bad IRI");
  // check prefixes
  if(isUndefined(prefixes))prefixes = {};
  if(!isPlainObject(prefixes))throw new TypeError("bad prefixes");
  for (const [prefix, expansion] of Object.entries(prefixes)){
    if(isString(prefix) && expansion instanceof IRI)continue;
    throw new TypeError("bad prefix definition");
  }

  // handle cases that don't require an expansion
  if(anIri instanceof IRI) return anIri;
  if(anIri instanceof URL) return iri`${anIri}`;

  // anIri is a string; expansion may be required
  for (const [prefix, expansion] of Object.entries(prefixes)) {
    if(!anIri.startsWith(`${prefix}:`))continue;
    return iri`${expansion}${anIri.substring(prefix.length+1)}`;
  }
  return iri`${anIri}`;
}

export { expandIri };
