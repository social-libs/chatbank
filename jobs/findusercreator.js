function createFindUserJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    FindEntityJob = mylib.FindEntityJob;

  function FindUserJob (bank, userid, defer) {
    FindEntityJob.call(this, bank, userid, defer);
  }
  lib.inherit(FindUserJob, FindEntityJob);
  FindUserJob.prototype.entityCollectionName = 'users';

  mylib.FindUserJob = FindUserJob;
}

module.exports = createFindUserJob;
