function isArray(val) {
  return Object.prototype.toString.call(val) === '[object Array]';
}

function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

function isDefaultGraph(term) {
  return isPlainObject(term) && term.termType === 'DefaultGraph';
}

export {isArray, isPlainObject, isDefaultGraph};
