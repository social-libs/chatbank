function createProcessNewPeer2PeerMessage (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank,
    FindUserJob = mylib.FindUserJob;

  function ProcessNewPeer2PeerMessageJob (bank, senderid, receiverid, contents, defer) {
    JobOnBank.call(this, bank, defer);
    this.senderid = senderid;
    this.receiverid = receiverid;
    this.contents = contents;
  }
  lib.inherit(ProcessNewPeer2PeerMessageJob, JobOnBank);
  ProcessNewPeer2PeerMessageJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    q.all([
      (new FindUserJob(this.destroayble, this.senderid)).go(),
      (new FindUserJob(this.destroayble, this.receiverid)).go()
    ]).then(
      this.onUsers.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  ProcessNewPeer2PeerMessageJob.prototype.onUsers = function (users) {
    var sender, receiver;
    if (!this.okToProceed()) {
      return;
    }
    sender = users[0];
    receiver = users[1];
  };

  mylib.ProcessNewPeer2PeerMessageJob = ProcessNewPeer2PeerMessageJob;
}

module.exports = createProcessNewPeer2PeerMessage;
