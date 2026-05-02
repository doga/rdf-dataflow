function isArray(val) {
  return Object.prototype.toString.call(val) === '[object Array]';
}

function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

function isString(val) {
  return typeof val === 'string';
}

function isDefaultGraph(term) {
  return isPlainObject(term) && term.termType === 'DefaultGraph';
}

/**
 * 
 * @param {*} anIri 
 * @param {Object} prefixes 
 * @returns {*}
 */
function expandIri(anIri, prefixes) {
  if(!isPlainObject(prefixes))return anIri;
  const iriStr = `${anIri}`;
  for (const [prefix, expansion] of Object.entries(prefixes)) {
    if(!iriStr.startsWith(`${prefix}:`))continue;
    return `${expansion}${iriStr.substring(prefix.length+1)}`;
  }
  return anIri;
}

export {isArray, isPlainObject, isString, expandIri, isDefaultGraph};
