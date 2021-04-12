function createNewChatGroupJob (lib, mylib, utils) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function NewChatGroupJob (bank, creatorid, groupname, defer) {
    JobOnBank.call(this, bank, defer);
    this.creatorid = creatorid;
    this.groupname = lib.isString(groupname) ? groupname : groupname.name;
    this.picture = lib.isString(groupname) ? null : groupname.picture;
    this.conversationid = null;
    this.conversation = null;
  }
  lib.inherit(NewChatGroupJob, JobOnBank);
  NewChatGroupJob.prototype.destroy = function () {
    this.conversation = null;
    this.conversationid = null;
    this.picture = null;
    this.groupname = null;
    this.creatorid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  NewChatGroupJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    if (!this.creatorid) {
      this.reject(new lib.Error('NO_CREATOR_ID_FOR_NEW_CHAT_GROUP', 'Creator id has to be specified in order to create a new Chat Group'));
      return ok.val;
    }
    if (!this.groupname) {
      this.reject(new lib.Error('NO_GROUP_NAME_FOR_NEW_CHAT_GROUP', 'A Group Name has to be specified in order to create a new Chat Group'));
      return ok.val;
    }
    (new this.destroyable.Jobs.PutConversationJob(this.destroyable, lib.uid(), {
      cby: this.creatorid,
      name: this.groupname,
      picture: this.picture,
      cat: Date.now(),
      afu: [this.creatorid],
      mids: [],
      nr: [utils.initialnotreader(this.creatorid)],
      lastm: null
    })).go().then(
      this.onCreated.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  NewChatGroupJob.prototype.onCreated = function (convarry) {
    if (!this.okToProceed()) {
      return;
    }
    this.conversationid = convarry[0];
    this.conversation = convarry[1];
    (new this.destroyable.Jobs.FindUserJob(this.destroyable, this.creatorid)).go().then(
      this.onCreator.bind(this),
      this.reject.bind(this)
    );
  };
  NewChatGroupJob.prototype.onCreator = function (creator) {
    if (!this.okToProceed()) {
      return;
    }
    creator = creator || {
      cids: []
    };
    creator.cids.push(this.conversationid);
    (new this.destroyable.Jobs.PutUserJob(this.destroyable, this.creatorid, creator)).go().then(
      this.onCreatorAltered.bind(this),
      this.reject.bind(this)
    );
  };
  NewChatGroupJob.prototype.onCreatorAltered = function (creatorarry) {
    if (!this.okToProceed()) {
      return;
    }
    this.destroyable.conversationNotification.fire({
      newgroup: true,
      id: this.conversationid,
      name: this.groupname,
      picture: this.picture,
      p2p: false,
      affected: this.conversation.afu,
      mids: this.conversation.mids.slice(-2)
    });
    this.resolve(this.conversationid);
  };

  mylib.NewChatGroupJob = NewChatGroupJob;
};

module.exports = createNewChatGroupJob;
