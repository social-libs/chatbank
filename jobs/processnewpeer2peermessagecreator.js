function createProcessNewPeer2PeerMessage (lib, mylib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank,
    FindUserJob = mylib.FindUserJob,
    FindConversationJob = mylib.FindConversationJob,
    PutUserJob = mylib.PutUserJob,
    PutConversationJob = mylib.PutConversationJob,
    PushMessageJob = mylib.PushMessageJob,
    zeroString = String.fromCharCode(0);

  function ProcessNewPeer2PeerMessageJob (bank, senderid, receiverid, contents, options, defer) {
    JobOnBank.call(this, bank, defer);
    this.senderid = senderid;
    this.receiverid = receiverid;
    this.contents = contents;
    this.options = options;
    this.conversationid = null;
    this.sender = null;
    this.receiver = null;
    this.conversation = null;
    this.messageid = null;
    this.message = null;
    this.conversationinitiated = false;
  }
  lib.inherit(ProcessNewPeer2PeerMessageJob, JobOnBank);
  ProcessNewPeer2PeerMessageJob.prototype.destroy = function () {
    this.conversationinitiated = null;
    this.message = null;
    this.messageid = null;
    this.conversation = null;
    this.receiver = null;
    this.sender = null;
    this.conversationid = null;
    this.options = null;
    this.contents = null;
    this.receiverid = null;
    this.senderid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  ProcessNewPeer2PeerMessageJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.conversationid = utils.zeroStringJoinSorted(this.senderid, this.receiverid);
    q.all([
      (new this.destroyable.Jobs.FindUserJob(this.destroyable, this.senderid)).go(),
      (new this.destroyable.Jobs.FindUserJob(this.destroyable, this.receiverid)).go(),
      (new this.destroyable.Jobs.FindConversationJob(this.destroyable, this.conversationid)).go(),
      (new this.destroyable.Jobs.PushMessageJob(this.destroyable, utils.brandNewP2PMessage(this.senderid, this.contents))).go()
    ]).then(
      this.onGetCombo.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  ProcessNewPeer2PeerMessageJob.prototype.onGetCombo = function (combo) {
    var jobs;
    if (!this.okToProceed()) {
      return;
    }
    jobs = [];
    this.sender = combo[0] || {
          cids: []
        };
    this.receiver = combo[1] || {
          cids: []
        };
    this.conversation = combo[2];
    if (!this.conversation) {
      this.conversationinitiated = true;
      this.conversation = utils.brandNewConversation(this.senderid, this.receiverid);
    }
    this.messageid = combo[3][0];
    this.message = combo[3][1];
    if (this.sender.cids.indexOf(this.conversationid)<0) {
      this.sender.cids.push(this.conversationid);
      jobs.push(
        (new this.destroyable.Jobs.PutUserJob(this.destroyable, this.senderid, this.sender)).go()
      );
    }
    if (this.receiver.cids.indexOf(this.conversationid)<0) {
      this.receiver.cids.push(this.conversationid);
      jobs.push(
        (new this.destroyable.Jobs.PutUserJob(this.destroyable, this.receiverid, this.receiver)).go()
      );
    }
    this.conversation.mids.push(this.messageid);
    this.conversation.lastm = this.message;
    utils.bumpNotRead(this.conversation, this.senderid);
    jobs.push(
      (new this.destroyable.Jobs.PutConversationJob(this.destroyable, this.conversationid, this.conversation)).go()
    );
    q.all(jobs).then(
      this.onPutCombo.bind(this),
      this.reject.bind(this)
    );
  };
  ProcessNewPeer2PeerMessageJob.prototype.onPutCombo = function (combo) {
    var affected;
    if (!this.okToProceed()) {
      return;
    }
    affected = [this.senderid, this.receiverid];
    this.destroyable.conversationNotification.fire({
      id: this.conversationid,
      p2p: true,
      affected: affected,
      mids: this.conversation.mids.slice(-2),
      nr: this.conversation.nr,
      lastm: this.conversation.lastm
    });
    /*
    this.resolve(lib.extend({}, this.message, {
      affected: [this.senderid, this.receiverid],
      conversationid: this.conversationid
    }));
    */
    (new this.destroyable.Jobs.OptionalPreviewCreatorJob(this.destroyable, this.conversationid, true, affected, this.messageid, this.contents, this.options)).go();
    this.resolve({id: this.conversationid, messageid: this.messageid});
  };

  mylib.ProcessNewPeer2PeerMessageJob = ProcessNewPeer2PeerMessageJob;
}

module.exports = createProcessNewPeer2PeerMessage;
