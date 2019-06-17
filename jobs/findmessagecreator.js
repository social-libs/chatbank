function createFindMessageJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    FindEntityJob = mylib.FindEntityJob;

  function FindMessageJob (bank, messageid, defer) {
    FindEntityJob.call(this, bank, messageid, defer);
  }
  lib.inherit(FindMessageJob, FindEntityJob);
  FindMessageJob.prototype.entityCollectionName = 'messages';

  mylib.FindMessageJob = FindMessageJob;
}

module.exports = createFindMessageJob;
