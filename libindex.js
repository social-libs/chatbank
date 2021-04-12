function createLib (execlib, utilslib, leveldblib, msgparsinglib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    utils = require('./utils')(lib),
    jobs = require('./jobs')(lib, utilslib, msgparsinglib, utils);

  function startAssoc (hash) {
    var d = q.defer(), ret = d.promise;
    hash.starteddefer = d;
    new leveldblib.LevelDBHandler(hash);
    return ret;
  }

  function startArray (hash) {
    var d = q.defer(), ret = d.promise;
    hash.starteddefer = d;
    new leveldblib.DBArray(hash);
    return ret;
  }

  function Event2Defer () {
    this.evnt = new lib.HookCollection();
    this.defer = q.defer();
    this.listener = this.evnt.attach(this.defer.notify.bind(this.defer));
  }
  Event2Defer.prototype.destroy = function () {
    if (this.listener) {
      this.listener.destroy();
    }
    this.listener = null;
    if (this.defer) {
      this.defer.resolve(true);
    }
    this.defer = null;
    if (this.evnt) {
      this.evnt.destroy();
    }
    this.evnt = null;
  };
  Event2Defer.prototype.fire = function () {
    if (!this.evnt) {
      return;
    }
    return this.evnt.fire.apply(this.evnt, arguments);
  };
  Event2Defer.prototype.attach = function (cb) {
    if (!this.evnt) {
      return {
        destroy: lib.dummyFunc
      };
    }
    return this.evnt.attach(cb);
  };
  Event2Defer.prototype.attachForSingleShot = function (cb) {
    if (!this.evnt) {
      return {
        destroy: lib.dummyFunc
      };
    }
    return this.evnt.attachForSingleShot(cb);
  };
  Event2Defer.prototype.then = function (a, b, c) {
    if (!this.defer) {
      if (lib.isFunction(b)) {
        b(new lib.Error('ALREADY_DESTROYED', 'Event2Defer is already destroyed'));
      }
      return;
    }
    return this.defer.promise.then(a, b, c);
  };
  function ChatBank (prophash) {
    var path;
    this.users = null;
    this.conversations = null;
    this.messages = null;
    this.conversationNotification = new Event2Defer();
    this.jobs = new qlib.JobCollection();
    path = prophash ? (prophash.path || '.') : '.';
    q.all([
      startAssoc({
        dbname: [path, 'users'],
        initiallyemptydb: prophash ? prophash.initiallyemptydb : false,
        dbcreationoptions: {
          valueEncoding: 'json'
        }
      }),
      startAssoc({
        dbname: [path, 'conversations'],
        initiallyemptydb: prophash ? prophash.initiallyemptydb : false,
        dbcreationoptions: {
          valueEncoding: 'json'
        }
      }),
      startArray({
        dbname: [path, 'messages'],
        initiallyemptydb: prophash ? prophash.initiallyemptydb : false,
        startfromone: true,
        indexsize: 'huge',
        dbcreationoptions: {
          valueEncoding: 'json'
        }
      })
    ], 'createDBs').then(
      this.onDBsCreated.bind(this, prophash ? prophash.starteddefer : null),
      prophash ? (prophash.starteddefer || null) : null
    );
  }
  ChatBank.prototype.destroy = function () {
    if (this.jobs) {
      this.jobs.destroy();
    }
    this.jobs = null;
    if (this.conversationNotification) {
      this.conversationNotification.destroy();
    }
    this.conversationNotification = null;
    if (this.messages) {
      this.messages.destroy();
    }
    this.messages = null;
    if (this.conversations) {
      this.conversations.destroy();
    }
    this.conversations = null;
    if (this.users) {
      this.users.destroy();
    }
    this.users = null;
  };
  ChatBank.prototype.onDBsCreated = function (starteddefer, dbs) {
    if (!(lib.isArray(dbs) && dbs.length===3)) {
      if (starteddefer) {
        starteddefer.reject(new lib.Error('DB_CREATION_FAILED', 'The databases were not correctly produced'));
      }
      return;
    }
    this.users = dbs[0];
    this.conversations = dbs[1];
    this.messages = dbs[2];
    if (starteddefer) {
      starteddefer.resolve(this);
    }
  };
  ChatBank.prototype.processNewMessage = function (from, togroup, to, message, options) {
    return this.jobs.run('.', new this.Jobs.ProcessNewMessageJob(this, from, togroup, to, message, options));
  };
  ChatBank.prototype.createNewGroup = function (creator, groupname) {
    return this.jobs.run('.', new this.Jobs.NewChatGroupJob(this, creator, groupname));
  };
  ChatBank.prototype.addUserToGroup = function (groupid, requesterid, userid) {
    return this.jobs.run('.', new this.Jobs.AddNewUserToChatGroupJob(this, groupid, requesterid, userid));
  };
  ChatBank.prototype.createNewGroupWithMembers = function (creator, groupname, memberarry) {
    return this.jobs.run('.', new this.Jobs.NewChatGroupWithMembersJob(this, creator, groupname, memberarry));
  };
  ChatBank.prototype.removeUserFromGroup = function (groupid, requesterid, userid) {
    return this.jobs.run('.', new this.Jobs.AddNewUserToChatGroupJob(this, groupid, requesterid, userid));
  };
  ChatBank.prototype.allConversationsOfUser = function (userid) {
    return (new this.Jobs.AllConversationsOfUserJob(this, userid)).go();
  };
  ChatBank.prototype.initiateConversationsOfUserForUsers = function (userid, userids) {
    return (new this.Jobs.InitiateConversationsOfUserForUsersJob(this, userid, userids)).go();
  };
  ChatBank.prototype.messagesOfConversation = function (userid, conversationid, oldestmessageid, howmany) {
    return (new this.Jobs.MessagesOfConversationJob(this, userid, conversationid, oldestmessageid, howmany)).go();
  };
  ChatBank.prototype.markMessageRcvd = function (userid, conversationid, messageid) {
    return this.jobs.run('.', new this.Jobs.MarkMessageRcvdJob(this, userid, conversationid, messageid));
  };
  ChatBank.prototype.markMessageSeen = function (userid, conversationid, messageid) {
    return this.jobs.run('.', new this.Jobs.MarkMessageSeenJob(this, userid, conversationid, messageid));
  };
  ChatBank.prototype.editMessage = function (userid, conversationid, messageid, editedMessage, options) {
    if (!options) {
      console.error('no options for editMessage');
      console.trace();
      process.exit(1);
    }
    return this.jobs.run('.', new this.Jobs.EditMessageJob(this, userid, conversationid, messageid, editedMessage, options));
  };
  ChatBank.prototype.removeConversation = function (conversationid, conversationarchiverpp, messagearchiverpp) {
    return this.jobs.run('.', new this.Jobs.RemoveConversationJob(this, conversationid, conversationarchiverpp, messagearchiverpp));
  };
  ChatBank.prototype.ackUserActivity = function (userid, conversationid) {
    return this.jobs.run('.', new this.Jobs.AckUserActivityJob(this, userid, conversationid));
  };
  ChatBank.prototype._internalUpdateMessageWithPreviewJob = function (conversationid, p2p, affected, messageid, previewobj) {
    return this.jobs.run('.', new this.Jobs.UpdateMessageWithPreviewJob(this, conversationid, p2p, affected, messageid, previewobj));
  };
  ChatBank.prototype.Jobs = jobs;

  return {
    Bank: ChatBank,
    utils: utils,
    deInit: msgparsinglib.deInit.bind(msgparsinglib)
  };
}

module.exports = createLib;
