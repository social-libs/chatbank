function createDelEntityJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function DelEntityJob (bank, entityid, defer) {
    JobOnBank.call(this, bank, defer);
    this.entityid = entityid;
  }
  lib.inherit(DelEntityJob, JobOnBank);
  DelEntityJob.prototype.destroy = function () {
    this.entityid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  DelEntityJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    qlib.promise2defer(this.destroyable[this.entityCollectionName].del(this.entityid), this);
    return ok.val;
  };


  mylib.DelEntityJob = DelEntityJob;
}

module.exports = createDelEntityJob;


