function createInitiateConversationsOfUserForUsersJob (lib, mylib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function joiner (a, b) {
    return utils.zeroStringJoinSorted(a, b);
  }
  function InitiateConversationsOfUserForUsersJob (bank, userid, userids, defer) {
    JobOnBank.call(this, bank, defer);
    this.userid = userid;
    this.userids = userids;
    this.convids = null;
    this.existingConversations = null;
    if (lib.isArray(this.userids)) {
      this.convids = this.userids.map(joiner.bind(null, userid));
      userid = null;
    }
  }
  lib.inherit(InitiateConversationsOfUserForUsersJob, JobOnBank);
  InitiateConversationsOfUserForUsersJob.prototype.destroy = function () {
    this.existingConversations = null;
    this.convids = null;
    this.userids = null;
    this.userid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  InitiateConversationsOfUserForUsersJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new this.destroyable.Jobs.AllConversationsOfUserJob(this.destroyable, this.userid)).go().then(
      this.onExistingUserConversations.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  InitiateConversationsOfUserForUsersJob.prototype.onExistingUserConversations = function (convs) {
    if (!this.okToProceed()) {
      return;
    }
    if (!lib.isArray(this.userids) && this.userids.length>0) {
      this.resolve(convs);
      return;
    }

    //console.log('Time to check existing convs', convs, 'against', this.convids);
    if (lib.isArray(convs)) {
      convs.forEach(this.clearUserIds.bind(this));
    }
    console.log('finally, userids', this.userids);

    this.existingConversations = convs || [];
    q.all(this.convids.map(this.createP2PConversation.bind(this))).then(
      this.onChatsInstantiated.bind(this),
      this.reject.bind(this)
    );
  };
  InitiateConversationsOfUserForUsersJob.prototype.clearUserIds = function (conv) {
    var ind = this.convids.indexOf(conv[0]);
    if (ind>=0) {
      this.userids.splice(ind, 1);
      this.convids.splice(ind, 1);
    }
  };
  InitiateConversationsOfUserForUsersJob.prototype.createP2PConversation = function (convid, index) {
    return (new this.destroyable.Jobs.PutConversationJob(this.destroyable, convid, utils.brandNewConversation(this.userid, this.userids[index]))).go();
  };
  InitiateConversationsOfUserForUsersJob.prototype.onChatsInstantiated = function (iconvs) {
    if (!this.okToProceed()) {
      return;
    }
    //console.log('at last, onChatsInstantiated', iconvs);
    this.existingConversations.push.apply(this.existingConversations, iconvs);
    //console.log('after join, all together', this.existingConversations);
    this.resolve(this.existingConversations);
  };

  mylib.InitiateConversationsOfUserForUsersJob = InitiateConversationsOfUserForUsersJob;
}
module.exports = createInitiateConversationsOfUserForUsersJob;
