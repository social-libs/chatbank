function createLib (execlib) {
  'use strict';
  return execlib.loadDependencies('client', ['social:chatutils:lib', 'allex:leveldb:lib', 'social:messageparsing:lib'], require('./libindex').bind(null, execlib));
}

module.exports = createLib;
