function createFindEntityJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function FindEntityJob (bank, entityid, defer) {
    JobOnBank.call(this, bank, defer);
    this.entityid = entityid;
  }
  lib.inherit(FindEntityJob, JobOnBank);
  FindEntityJob.prototype.destroy = function () {
    this.entityid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  FindEntityJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    qlib.promise2defer(this.destroyable[this.entityCollectionName].safeGet(this.entityid, null), this);
    return ok.val;
  };


  mylib.FindEntityJob = FindEntityJob;
}

module.exports = createFindEntityJob;
