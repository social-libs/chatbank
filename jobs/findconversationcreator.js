function createFindConversationJob (lib, JobOnBank) {
  'use strict';

  function FindConversationJob (bank, defer) {
    JobOnBank.call(this, bank, defer);
  }
  lib.inherit(FindConversationJob, JobOnBank);
  FindConversationJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    return ok.val;
  };


  return FindConversationJob;
}

module.exports = createFindConversationJob;
