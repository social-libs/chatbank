function createPushEntityJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function PushEntityJob (bank, entityval, defer) {
    JobOnBank.call(this, bank, defer);
    this.entityval = entityval;
  }
  lib.inherit(PushEntityJob, JobOnBank);
  PushEntityJob.prototype.destroy = function () {
    this.entityval = null;
    JobOnBank.prototype.destroy.call(this);
  };
  PushEntityJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    qlib.promise2defer(this.destroyable[this.entityCollectionName].push(this.entityval), this);
    return ok.val;
  };


  mylib.PushEntityJob = PushEntityJob;
}

module.exports = createPushEntityJob;

