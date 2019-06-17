function createPutConversationJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    PutEntityJob = mylib.PutEntityJob;

  function PutConversationJob (bank, conversationid, conversationval, defer) {
    PutEntityJob.call(this, bank, conversationid, conversationval, defer);
  }
  lib.inherit(PutConversationJob, PutEntityJob);
  PutConversationJob.prototype.entityCollectionName = 'conversations';

  mylib.PutConversationJob = PutConversationJob;
}

module.exports = createPutConversationJob;
