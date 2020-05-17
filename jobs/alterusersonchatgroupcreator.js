function createAlterUsersOnChatGroupJob (lib, mylib) {
  'use strict';

  var JobOnBank = mylib.JobOnBank,
    q = lib.q;

  function AlterUsersOnChatGroupJob (bank, conversationid, changerid, userid, defer) {
    JobOnBank.call(this, bank, defer);
    this.conversationid = conversationid;
    this.changerid = changerid;
    this.userid = userid;
    this.conversation = null;
  }
  lib.inherit(AlterUsersOnChatGroupJob, JobOnBank);
  AlterUsersOnChatGroupJob.prototype.destroy = function () {
    this.userid = null;
    this.changerid = null;
    this.conversationid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  AlterUsersOnChatGroupJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new this.destroyable.Jobs.FindConversationJob(this.destroyable, this.conversationid)).go().then(
      this.onConversation.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  AlterUsersOnChatGroupJob.prototype.onConversation = function (conversation) {
    if (!this.okToProceed()) {
      return;
    }
    if (!conversation) {
      this.reject(new lib.Error('CONVERSATION_NOT_FOUND', this.conversationid));
      return;
    }
    if (!lib.isArray(conversation.afu)) {
      this.reject(new lib.Error('INVALID_CONVERSATION_STRUCTURE', this.conversationid));
      return;
    }
    if (conversation.afu.indexOf(this.changerid)<0) {
      console.error(conversation.afu, 'vs', this.changerid);
      this.reject(new lib.Error('CHANGE_INITIATOR_NOT_A_MEMBER', this.changerid));
      return;
    }
    if (!this.checkConversation(conversation)) {
      return;
    }
    this.alterGroupAffectedUsers(conversation.afu);
    this.alterGroupNotRead(conversation.nr);
    this.conversation = conversation;
    (new this.destroyable.Jobs.FindUserJob(this.destroyable, this.userid)).go().then(
      this.onAffectedUser.bind(this),
      this.reject.bind(this)
    );
  };
  AlterUsersOnChatGroupJob.prototype.onAffectedUser = function (user) {
    if (!this.okToProceed()) {
      return;
    }
    user = user || {
      cids: []
    };
    this.alterAffectedUserCids(user.cids);
    q.all([
      (new this.destroyable.Jobs.PutUserJob(this.destroyable, this.userid, user)).go(),
      (new this.destroyable.Jobs.PutConversationJob(this.destroyable, this.conversationid, this.conversation)).go()
    ]).then(
      this.onPutCombo.bind(this),
      this.reject.bind(this)
    );
  };
  AlterUsersOnChatGroupJob.prototype.onPutCombo = function (combo) {
    var eventobj;
    if (!this.okToProceed()) {
      return;
    }
    eventobj = {
      id: this.conversationid,
      p2p: false,
      affected: this.conversation.afu
    };
    this.makeUpNotificationEvent(eventobj);
    this.destroyable.conversationNotification.fire(eventobj);
    this.resolve(true);
  };


  mylib.AlterUsersOnChatGroupJob = AlterUsersOnChatGroupJob;
}

module.exports = createAlterUsersOnChatGroupJob;
