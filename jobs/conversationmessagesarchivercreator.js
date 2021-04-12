function createConversationMessagesArchiverJob (lib, mylib) {
  'use strict';

  var ConversationMessagesTraverserBase = mylib.ConversationMessagesTraverserBase;

  function ConversationMessagesArchiverJob (bank, conversation, messagearchiverpp, defer) {
    ConversationMessagesTraverserBase.call(this, bank, conversation);
    this.messagearchiverpp = messagearchiverpp;
  }
  lib.inherit(ConversationMessagesArchiverJob, ConversationMessagesTraverserBase);
  ConversationMessagesArchiverJob.prototype.destroy = function () {
    this.messagearchiverpp = null;
    ConversationMessagesTraverserBase.prototype.destroy.call(this);
  };
  ConversationMessagesArchiverJob.prototype.handleMessage = function (mid, msg) {
    var ret = this.messagearchiverpp(mid, msg).then(
      onMessageArchived.bind(this, mid)
    );
    mid = null;
    return ret;
  };
  function onMessageArchived (mid, res) {
    if (res !== mid) {
      throw new lib.Error('MESSAGE_ARCHIVING_FAILED', 'Mismatch in sent mid '+mid+' and archived mid '+res);
    }
    return res;
  };

  mylib.ConversationMessagesArchiverJob = ConversationMessagesArchiverJob;
}
module.exports = createConversationMessagesArchiverJob;
