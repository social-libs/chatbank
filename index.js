function createLib (execlib) {
  'use strict';
  return execlib.loadDependencies('client', ['allex:leveldb:lib'], require('./libindex').bind(null, execlib));
}

module.exports = createLib;
