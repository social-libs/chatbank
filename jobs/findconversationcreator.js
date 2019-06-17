function createFindConversationJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    FindEntityJob = mylib.FindEntityJob;

  function FindConversationJob (bank, conversationid, defer) {
    FindEntityJob.call(this, bank, conversationid, defer);
  }
  lib.inherit(FindConversationJob, FindEntityJob);
  FindConversationJob.prototype.entityCollectionName = 'conversations';

  mylib.FindConversationJob = FindConversationJob;
}

module.exports = createFindConversationJob;
