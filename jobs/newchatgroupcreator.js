function createNewChatGroupJob (lib, mylib) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function NewChatGroupJob (bank, creatorid, defer) {
    JobOnBank.call(this, bank, defer);
    this.creatorid = creatorid;
  }
  lib.inherit(NewChatGroupJob, JobOnBank);
  NewChatGroupJob.prototype.destroy = function () {
    this.creatorid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  NewChatGroupJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new this.destroyable.Jobs.PutConversationJob(this.destroyable, lib.uid(), {
      cby: this.creatorid,
      cat: Date.now(),
      afu: [this.creatorid],
      mids: [],
      lastm: null
    })).go().then(
      this.onCreated.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  NewChatGroupJob.prototype.onCreated = function (conv) {
    console.log('conv', conv);
    this.resolve(conv[0]);
  };

  mylib.NewChatGroupJob = NewChatGroupJob;
};

module.exports = createNewChatGroupJob;
