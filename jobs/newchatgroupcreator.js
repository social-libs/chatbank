function createNewChatGroupJob (lib, mylib) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function NewChatGroupJob (bank, creatorid, defer) {
    JobOnBank.call(this, bank, defer);
    this.creatorid = creatorid;
    this.conversationid = null;
    this.conversation = null;
  }
  lib.inherit(NewChatGroupJob, JobOnBank);
  NewChatGroupJob.prototype.destroy = function () {
    this.conversation = null;
    this.conversationid = null;
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
  NewChatGroupJob.prototype.onCreated = function (convarry) {
    if (!this.okToProceed()) {
      return;
    }
    this.conversationid = convarry[0];
    this.conversation = convarry[1];
    (new this.destroyable.Jobs.FindUserJob(this.destroyable, this.creatorid)).go().then(
      this.onCreator.bind(this),
      this.reject.bind(this)
    );
  };
  NewChatGroupJob.prototype.onCreator = function (creator) {
    if (!this.okToProceed()) {
      return;
    }
    creator = creator || {
      cids: []
    };
    creator.cids.push(this.conversationid);
    (new this.destroyable.Jobs.PutUserJob(this.destroyable, this.creatorid, creator)).go().then(
      this.onCreatorAltered.bind(this),
      this.reject.bind(this)
    );
  };
  NewChatGroupJob.prototype.onCreatorAltered = function (creatorarry) {
    if (!this.okToProceed()) {
      return;
    }
    this.destroyable.conversationNotification.fire({
      id: this.conversationid,
      affected: this.conversation.afu,
      mids: this.conversation.mids.slice(-2),
      lastmessage: this.conversation.lastm
    });
    this.resolve(this.conversationid);
  };

  mylib.NewChatGroupJob = NewChatGroupJob;
};

module.exports = createNewChatGroupJob;
