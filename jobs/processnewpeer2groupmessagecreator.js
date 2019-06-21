function createProcessNewPeer2GroupMessage (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank,
    FindUserJob = mylib.FindUserJob,
    FindConversationJob = mylib.FindConversationJob,
    PutUserJob = mylib.PutUserJob,
    PutConversationJob = mylib.PutConversationJob,
    PushMessageJob = mylib.PushMessageJob;

  function ProcessNewPeer2GroupMessageJob (bank, senderid, conversationid, contents, defer) {
    JobOnBank.call(this, bank, defer);
    this.senderid = senderid;
    this.conversationid = conversationid;
    this.contents = contents;
    this.conversation = null;
    this.messageid = null;
    this.message = null;
  }
  lib.inherit(ProcessNewPeer2GroupMessageJob, JobOnBank);
  ProcessNewPeer2GroupMessageJob.prototype.destroy = function () {
    this.message = null;
    this.messageid = null;
    this.conversation = null;
    this.contents = null;
    this.conversationid = null;
    this.senderid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  ProcessNewPeer2GroupMessageJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new this.destroyable.Jobs.FindConversationJob(this.destroyable, this.conversationid)).go().then(
      this.onConversation.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  ProcessNewPeer2GroupMessageJob.prototype.onConversation = function (conversation) {
    if (!this.okToProceed()) {
      return;
    }
    if (!conversation) {
      this.reject(new lib.Error('GROUP_DOES_NOT_EXIST', this.conversationid));
      return;
    }
    if (!(lib.isArray(conversation.afu) && conversation.afu.indexOf(this.senderid)>=0)) {
      this.reject(new lib.Error('SENDER_NOT_MEMBER_OF_GROUP', this.senderid));
      return;
    }
    this.conversation = conversation;
    (new this.destroyable.Jobs.PushMessageJob(this.destroyable, {
      from: this.senderid,
      message: this.contents,
      created: Date.now(),
      seen: null
    })).go().then(
      this.onMessagePut.bind(this),
      this.reject.bind(this)
    );
  };
  ProcessNewPeer2GroupMessageJob.prototype.onMessagePut = function (msgarry) {
    if (!this.okToProceed()) {
      return;
    }
    this.messageid = msgarry[0];
    this.message = msgarry[1];
    this.conversation.mids.push(this.messageid);
    this.conversation.lastm = this.message;
    (new this.destroyable.Jobs.PutConversationJob(this.destroyable, this.conversationid, this.conversation)).go().then(
      this.onConversationPut.bind(this),
      this.reject.bind(this)
    );
  };
  ProcessNewPeer2GroupMessageJob.prototype.onConversationPut = function (convarry) {
    if (!this.okToProceed()) {
      return;
    }
    this.destroyable.conversationNotification.fire({
      id: convarry[0],
      affected: convarry[1].afu,
      mids: convarry[1].mids.slice(-2),
      lastmessage: convarry[1].lastm
    });
    this.resolve(true);
  };


  /*
      (new this.destroyable.Jobs.PushMessageJob(this.destroyable, {
        from: this.senderid,
        message: this.contents,
        created: Date.now(),
        seen: null
      })).go()
  */


  mylib.ProcessNewPeer2GroupMessageJob = ProcessNewPeer2GroupMessageJob;
}

module.exports = createProcessNewPeer2GroupMessage;
