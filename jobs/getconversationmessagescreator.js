function createGetConversationMessages (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank,
    FindConversationJob = mylib.FindConversationJob;

  function GetConversationMessagesJob (bank, conversationid, oldestknownmessageid, howmuch, defer) {
    JobOnBank.call(this, bank, defer);
    this.conversationid = conversationid;
    this.oldestknownmessageid = oldestknownmessageid;
    this.howmuch = howmuch;
  }
  lib.inherit(GetConversationMessagesJob, JobOnBank);
  GetConversationMessagesJob.prototype.destroy = function () {
    this.howmuch = null;
    this.oldestknownmessageid = null;
    this.conversationid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  GetConversationMessagesJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new FindConversationJob(this.destroyable, this.conversationid)).go().then(
      this.onConversation.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  GetConversationMessagesJob.prototype.onConversation = function (conversation) {
    //messages are ordered from the newest
    if (!this.okToProceed()) {
      return;
    }

  };
  GetConversationMessagesJob.prototype.messageIdsToFetch = function (conversation) {
    var howmuch, messages, startindex;
    if (!conversation) {
      return [];
    }
    messages = conversation.messages;
    if (!lib.isArray(messages)) {
      return [];
    }
    howmuch = this.howmuch || 20;
    startindex = lib.isNumber(this.oldestknownmessageid) ? 
      messages.indexOf(this.oldestknownmessageid)
      :
      0;
  };

  mylib.GetConversationMessagesJob = GetConversationMessagesJob;
}

module.exports = createGetConversationMessages;
