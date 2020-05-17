function createAckUserActivityJob (lib, mylib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function AckUserActivityJob (bank, userid, conversationid, defer) {
    JobOnBank.call(this, bank, defer);
    this.userid = userid;
    this.conversationid = conversationid;
  }
  lib.inherit(AckUserActivityJob, JobOnBank);
  AckUserActivityJob.prototype.destroy = function () {
    this.conversationid = null;
    this.userid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  AckUserActivityJob.prototype.go = function () {
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
  AckUserActivityJob.prototype.onConversation = function (conversation) {
    var p2p, affected;
    if (!this.okToProceed()) {
      return;
    }
    if (!conversation) {
      this.reject(new lib.Error('GROUP_DOES_NOT_EXIST', this.conversationid));
      return;
    }
    if (!utils.conversationhasuser(conversation, this.conversationid, this.userid)) {
      this.reject(new lib.Error('ACTIVITY_USER_NOT_MEMBER_OF_GROUP', this.userid));
      return;
    }
    this.destroyable.conversationNotification.fire({
      id: this.conversationid,
      p2p: utils.conversationisp2p(conversation),
      affected: utils.conversationaffected(conversation),
      activity: this.userid
    });
    this.resolve(true);
  };

  mylib.AckUserActivityJob = AckUserActivityJob;
}
module.exports = createAckUserActivityJob;
