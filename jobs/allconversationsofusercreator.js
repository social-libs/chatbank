function createAllConversationsOfUserJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function AllConversationsOfUserJob (bank, userid, defer) {
    JobOnBank.call(this, bank);
    this.userid = userid;
  }
  lib.inherit(AllConversationsOfUserJob, JobOnBank);
  AllConversationsOfUserJob.prototype.destroy = function () {
    this.userid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  AllConversationsOfUserJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new this.destroyable.Jobs.FindUserJob(this.destroyable, this.userid)).go().then(
      this.onUser.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  AllConversationsOfUserJob.prototype.onUser = function (user) {
    if (!this.okToProceed()) {
      return;
    }
    if (!(user && lib.isArray(user.cids) && user.cids.length>0)) {
      this.resolve([]);
      return;
    }
    qlib.promise2defer(
      q.all(user.cids.map(conversationfetcher.bind(null, this.destroyable))),
      this
    );
  };
  function conversationfetcher (bank, cid) {
    var ret = [cid, null];
    return (new bank.Jobs.FindConversationJob(bank, cid)).go().then(
      setter.bind(null, ret)
    ).then(
      qlib.returner(ret)
    );
  }
  function setter (arry, conv) {
    var ret = q(arry);
    //conv.mids = conv.mids.slice(-2);
    arry[1] = lib.pickExcept(conv, ['mids']);
    if (arry[1].lastm) {
      arry[1].lastm.id = conv.mids[conv.mids.length-1];
    }
    arry = null;
    return ret;
  }

  mylib.AllConversationsOfUserJob = AllConversationsOfUserJob;
}

module.exports = createAllConversationsOfUserJob;
