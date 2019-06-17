function createPutEntityJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function PutEntityJob (bank, entityid, entityval, defer) {
    JobOnBank.call(this, bank, defer);
    this.entityid = entityid;
    this.entityval = entityval;
  }
  lib.inherit(PutEntityJob, JobOnBank);
  PutEntityJob.prototype.destroy = function () {
    this.entityval = null;
    this.entityid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  PutEntityJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    qlib.promise2defer(this.destroyable[this.entityCollectionName].put(this.entityid, this.entityval), this);
    return ok.val;
  };


  mylib.PutEntityJob = PutEntityJob;
}

module.exports = createPutEntityJob;

