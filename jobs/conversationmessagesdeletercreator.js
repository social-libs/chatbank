function createConversationMessagesDeleterJob (lib, mylib) {
  'use strict';

  var ConversationMessagesTraverserBase = mylib.ConversationMessagesTraverserBase;

  function ConversationMessagesDeleterJob (bank, conversation, defer) {
    ConversationMessagesTraverserBase.call(this, bank, conversation);
  }
  lib.inherit(ConversationMessagesDeleterJob, ConversationMessagesTraverserBase);
  ConversationMessagesDeleterJob.prototype.handleMessage = function (mid, msg) {
    return (new this.destroyable.Jobs.DelMessageJob(this.destroyable, mid)).go();
  };

  mylib.ConversationMessagesDeleterJob = ConversationMessagesDeleterJob;
}
module.exports = createConversationMessagesDeleterJob;
