function createDelConversationJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    DelEntityJob = mylib.DelEntityJob;

  function DelConversationJob (bank, conversationid, defer) {
    DelEntityJob.call(this, bank, conversationid, defer);
  }
  lib.inherit(DelConversationJob, DelEntityJob);
  DelConversationJob.prototype.entityCollectionName = 'conversations';

  mylib.DelConversationJob = DelConversationJob;
}

module.exports = createDelConversationJob;
