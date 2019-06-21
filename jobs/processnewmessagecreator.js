function createProcessNewMessageJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function ProcessNewMessageJob (bank, senderid, conversationid, receiverid, contents, defer) {
    JobOnBank.call(this, bank, defer);
    this.senderid = senderid;
    this.conversationid = conversationid;
    this.receiverid = receiverid;
    this.contents = contents;
  }
  lib.inherit(ProcessNewMessageJob, JobOnBank);
  ProcessNewMessageJob.prototype.destroy = function () {
    this.contents = null;
    this.receiverid = null;
    this.conversationid = null;
    this.senderid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  ProcessNewMessageJob.prototype.go = function () {
    var ok = this.okToGo(), temp;
    if (!ok.ok) {
      return ok.val;
    }
    if (this.receiverid) {
      qlib.promise2defer((new mylib.ProcessNewPeer2PeerMessageJob(this.destroyable, this.senderid, this.receiverid, this.contents)).go(), this);
      return ok.val;
    }
    if (this.conversationid) {
      qlib.promise2defer((new mylib.ProcessNewPeer2GroupMessageJob(this.destroyable, this.senderid, this.conversationid, this.contents)).go(), this);
    }
    return ok.val;
  };

  mylib.ProcessNewMessageJob = ProcessNewMessageJob;
}

module.exports = createProcessNewMessageJob;
