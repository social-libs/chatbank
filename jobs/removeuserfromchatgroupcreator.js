function createRemoveUserFromChatGroupJob (lib, mylib) {
  'use strict';

  var AlterUsersOnChatGroupJob = mylib.AlterUsersOnChatGroupJob;

  function removeFromArry (arry, thingy) {
    var ind;
    if (!lib.isArray(arry)) {
      return;
    }
    ind = arry.indexOf(thingy);
    if (ind<0) {
      return;
    }
    arry.splice(ind, 1);
  }

  function RemoveUserFromChatGroupJob (bank, conversationid, changerid, userid, defer) {
    AlterUsersOnChatGroupJob.call(this, bank, conversationid, changerid, userid, defer);
  }
  lib.inherit(RemoveUserFromChatGroupJob, AlterUsersOnChatGroupJob);
  RemoveUserFromChatGroupJob.prototype.checkConversation = function (conversation) {
    if (conversation.afu.indexOf(this.userid)<0) {
      this.resolve(true);
      return false;
    }
    return true;
  };
  RemoveUserFromChatGroupJob.prototype.alterAffectedUserCids = function (usercids) {
    removeFromArry(usercids, this.conversationid);
  };
  RemoveUserFromChatGroupJob.prototype.alterGroupAffectedUsers = function (afu) {
    removeFromArry(afu, this.userid);
  };

  mylib.RemoveUserFromChatGroupJob = RemoveUserFromChatGroupJob;
}

module.exports = createRemoveUserFromChatGroupJob;
