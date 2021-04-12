function createRemoveConversationJob (lib, mylib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function conversationider (thingy) {
    if (lib.isArray(thingy)) {
      return utils.zeroStringJoinSorted.apply(null, thingy);
    }
    return thingy;
  }
  function RemoveConversationJob (bank, conversationid, conversationarchiverpp, messagearchiverpp, defer) {
    JobOnBank.call(this, bank);
    this.conversationid = conversationider(conversationid);
    this.conversationarchiverpp = conversationarchiverpp;
    this.messagearchiverpp = messagearchiverpp;
    this.conversation = null;
  }
  lib.inherit(RemoveConversationJob, JobOnBank);
  RemoveConversationJob.prototype.destroy = function () {
    this.conversation = null;
    this.messagearchiverpp = null;
    this.conversationarchiverpp = null;
    this.conversationid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  RemoveConversationJob.prototype.go = function () {
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
  RemoveConversationJob.prototype.onConversation = function (conv) {
    if (!this.okToProceed()) {
      return;
    }
    if (!conv) {
      this.resolve(false);
      return;
    }
    this.conversation = conv;
    (new this.destroyable.Jobs.ConversationMessagesArchiverJob(this.destroyable, this.conversation, this.messagearchiverpp)).go().then(
      this.onMessagesArchived.bind(this),
      this.reject.bind(this)
    );
  };
  RemoveConversationJob.prototype.onMessagesArchived = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    this.conversationarchiverpp(this.conversationid, this.conversation).then(
      this.onConversationArchived.bind(this),
      this.reject.bind(this)
    );
  };
  RemoveConversationJob.prototype.onConversationArchived = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    (new this.destroyable.Jobs.ConversationMessagesDeleterJob(this.destroyable, this.conversation, this.messagearchiverpp)).go().then(
      this.onMessagesDeleted.bind(this),
      this.reject.bind(this)
    );
  };
  RemoveConversationJob.prototype.onMessagesDeleted = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    (new this.destroyable.Jobs.DelConversationJob(this.destroyable, this.conversationid)).go().then(
      this.onConversationDeleted.bind(this),
      this.reject.bind(this)
    );
  };
  RemoveConversationJob.prototype.onConversationDeleted = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    //maybe check res against this.conversationid or this.conversation ?
    this.destroyable.conversationNotification.fire({
      removedid: this.conversationid,
      p2p: utils.conversationisp2p(this.conversation),
      affected: utils.conversationaffected(this.conversation)
    });
    this.resolve({id: this.conversationid});
  };

  mylib.RemoveConversationJob = RemoveConversationJob;
}
module.exports = createRemoveConversationJob;
