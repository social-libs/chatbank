function createAddNewUserToChatGroupJob (lib, mylib, utils) {
  'use strict';

  var AlterUsersOnChatGroupJob = mylib.AlterUsersOnChatGroupJob;

  function AddNewUserToChatGroupJob (bank, conversationid, changerid, userid, defer) {
    AlterUsersOnChatGroupJob.call(this, bank, conversationid, changerid, userid, defer);
  }
  lib.inherit(AddNewUserToChatGroupJob, AlterUsersOnChatGroupJob);
  AddNewUserToChatGroupJob.prototype.checkConversation = function (conversation) {
    if (conversation.afu.indexOf(this.userid)>=0) {
      this.resolve(true);
      return false;
    }
    return true;
  };
  AddNewUserToChatGroupJob.prototype.alterAffectedUserCids = function (usercids) {
    usercids.push(this.conversationid);
  };
  AddNewUserToChatGroupJob.prototype.alterGroupAffectedUsers = function (afu) {
    afu.push(this.userid);
  };
  AddNewUserToChatGroupJob.prototype.alterGroupNotRead = function (nr) {
    nr.push(utils.initialnotreader(this.userid));
  };

  mylib.AddNewUserToChatGroupJob = AddNewUserToChatGroupJob;
}

module.exports = createAddNewUserToChatGroupJob;
