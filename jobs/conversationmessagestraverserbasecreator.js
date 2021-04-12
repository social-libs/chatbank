function createConversationMessagesTraverserBase (lib, mylib) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function ConversationMessagesTraverserBase (bank, conversation, defer) {
    JobOnBank.call(this, bank);
    this.conversation = conversation;
    this.msgIndex = 0;
  }
  lib.inherit(ConversationMessagesTraverserBase, JobOnBank);
  ConversationMessagesTraverserBase.prototype.destroy = function () {
    this.msgIndex = null;
    this.conversation = null;
    JobOnBank.prototype.destroy.call(this);
  };
  ConversationMessagesTraverserBase.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.fetchMessage();
    return ok.val;
  };
  ConversationMessagesTraverserBase.prototype.fetchMessage = function () {
    var mid;
    if (!this.okToProceed()) {
      return;
    }
    if (!this.conversation) {
      this.reject(new lib.Error('NO_CONVERSATION', this.constructor.name+' has no conversation to fetchMessage for'));
      return;
    }
    if (!lib.isArray(this.conversation.mids)) {
      this.reject(new lib.Error('NO_CONVERSATION_MIDS', this.constructor.name+' has no mids in conversation to fetchMessage for'));
      return;
    }
    if (!lib.isNumber(this.msgIndex)) {
      this.reject(new lib.Error('NO_MSG_INDEX', this.constructor.name+' has no msgIndex fetchMessage for. This is an internal error'));
      return;
    }
    if (this.msgIndex >= this.conversation.mids.length) {
      this.resolve(this.conversation.mids.length);
      return;
    }
    mid = this.conversation.mids[this.msgIndex];
    (new this.destroyable.Jobs.FindMessageJob(this.destroyable, mid)).go().then(
      this.onMessage.bind(this, mid),
      this.reject.bind(this)
    );
    mid = null;
  };
  ConversationMessagesTraverserBase.prototype.onMessage = function (mid, msg) {
    if (!this.okToProceed()) {
      return;
    }
    this.msgIndex++;
    this.handleMessage(mid, msg).then(
      this.fetchMessage.bind(this),
      this.reject.bind(this)
    );
  };

  mylib.ConversationMessagesTraverserBase = ConversationMessagesTraverserBase;
}
module.exports = createConversationMessagesTraverserBase;
