function createLib (execlib, leveldblib, jobondestroyablelib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    jobs = require('./jobs')(lib, jobondestroyablelib);

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

  function ChatBank (prophash) {
    var path;
    this.users = null;
    this.conversations = null;
    this.messages = null;
    this.conversationsDefer = q.defer();
    this.messagesDefer = q.defer();
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
        indexsize: 'huge',
        dbcreationoptions: {
          valueEncoding: 'json'
        }
      }),
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
    if (this.messagesDefer) {
      this.messagesDefer.resolve(true);
    }
    this.messagesDefer = null;
    if (this.messages) {
      this.messages.destroy();
    }
    this.messages = null;
    if (this.conversationsDefer) {
      this.conversationsDefer.resolve(true);
    }
    this.conversationsDefer = null;
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
  ChatBank.prototype.processNewMessage = function (from, togroup, to, message) {
    return this.jobs.run('.', new this.Jobs.ProcessNewMessageJob(this, from, togroup, to, message));
  };
  ChatBank.prototype.Jobs = jobs;

  return {
    Bank: ChatBank
  };
}

module.exports = createLib;
