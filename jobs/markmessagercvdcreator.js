function createMarkMessageRcvdJob (lib, mylib, utils) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function MarkMessageRcvdJob (bank, userid, conversationid, messageid, defer) {
    JobOnBank.call(this, bank);
    this.userid = userid;
    this.conversationid = conversationid;
    this.messageid = messageid;
    this.isp2p = null;
    this.conversation = null;;
    this.message = null;
    this.rcvdat = null;
    this.notread = null;
  }
  lib.inherit(MarkMessageRcvdJob, JobOnBank);
  MarkMessageRcvdJob.prototype.destroy = function () {
    this.notread = null;
    this.rcvdat = null;
    this.message = null;
    this.conversation = null;
    this.isp2p = null;
    this.messageid = null;
    this.conversationid = null;
    this.userid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  MarkMessageRcvdJob.prototype.go = function () {
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
  MarkMessageRcvdJob.prototype.onConversation = function (conversation) {
    //try to cover both the peer2peer and peer2group cases
    if (!this.okToProceed()) {
      return;
    }
    if (!conversation) {
      this.reject(new lib.Error('GROUP_DOES_NOT_EXIST', this.conversationid));
      return;
    }
    this.conversation = conversation;
    this.isp2p = !lib.isArray(conversation.afu);
    if (lib.isArray(conversation.afu) && conversation.afu.indexOf(this.userid)<0) {
      this.reject(new lib.Error('SENDER_NOT_MEMBER_OF_GROUP', this.userid));
      return;
    }
    if (lib.isArray(conversation.nr) && !utils.userInNotRead(this.userid, conversation.nr)) {
      this.reject(new lib.Error('SENDER_NOT_MEMBER_OF_GROUP', this.userid));
      return;
    }
    if (!lib.isArray(conversation.mids)) {
      this.reject(new lib.Error('CONVERSATION_HAS_NO_MESSAGES', this.conversationid));
      return;
    }
    if (conversation.mids.indexOf(this.messageid)<0) {
      console.log(conversation.mids, 'have no', this.messageid);
      this.reject(new lib.Error('MESSAGE_NOT_IN_CONVERSATION', this.messageid));
      return;
    }
    (new this.destroyable.Jobs.FindMessageJob(this.destroyable, this.messageid)).go().then(
      this.onMessage.bind(this),
      this.reject.bind(this)
    );
  };
  MarkMessageRcvdJob.prototype.onMessage = function (msg) {
    var didsomething;
    if (!this.okToProceed()) {
      return;
    }
    if (!msg) {
      this.reject(new lib.Error('MESSAGE_DOES_NOT_EXIST', this.messageid));
      return;
    }
    if (!msg.from) {
      this.reject(new lib.Error('MESSAGE_INVALID_FORMAT', this.messageid));
      return;
    }
    if (msg.from === this.userid) {
      this.resolve(true);
      return;
    }
    this.rcvdat = Date.now();
    if (utils.markMessageRcvdBy(msg, this.userid)) {
      didsomething = true;
    }
    if (didsomething) {
      (new this.destroyable.Jobs.PutMessageJob(this.destroyable, this.messageid, msg)).go().then(
        this.onMessageSaved.bind(this),
        this.reject.bind(this)
      );
      return;
    }
    this.resolve(true);
  };
  MarkMessageRcvdJob.prototype.onMessageSaved = function (savemsgd) {
    if (!this.okToProceed()) {
      return;
    }
    //this.messageid = savemsgd[0]; //trivial, gotta be
    this.message = savemsgd[1];
    this.doResolve();
  };
  MarkMessageRcvdJob.prototype.doResolve = function () {
    this.destroyable.conversationNotification.fire({
      id: this.conversationid,
      messageid: this.messageid,
      p2p: this.isp2p,
      rcvdby: this.userid,
      rcvdat: this.rcvdat,
      nr: this.notread,
      affected: [this.message.from, this.userid],
      rcvdmessage: this.message
    });
    this.resolve({id: this.conversationid, messageid: this.messageid, rcvdby: this.userid, rcvdat: this.rcvdat});
  };

  mylib.MarkMessageRcvdJob = MarkMessageRcvdJob;
}
module.exports = createMarkMessageRcvdJob;

