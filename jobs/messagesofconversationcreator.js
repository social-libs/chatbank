function createMessagesOfConversationJob (lib, mylib, utilslib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function MessagesOfConversationJob (bank, userid, conversationid, oldestmessageid, howmany, defer) {
    JobOnBank.call(this, bank);
    this.userid = userid;
    this.conversationid = conversationid;
    this.oldestmessageid = oldestmessageid;
    this.howmany = howmany || 20;
    this.reachedthetop = null;
  }
  lib.inherit(MessagesOfConversationJob, JobOnBank);
  MessagesOfConversationJob.prototype.destroy = function () {
    this.reachedthetop = null;
    this.howmany = null;
    this.oldestmessageid = null;
    this.conversationid = null;
    this.userid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  MessagesOfConversationJob.prototype.go = function () {
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
  MessagesOfConversationJob.prototype.onConversation = function (conv) {
    var oldestind,
      fetchstartind;
    if (!this.okToProceed()) {
      return;
    }
    if (!(conv && lib.isArray(conv.mids) && conv.mids.length>0)) {
      this.resolve([]);
      return;
    }
    if(!utils.conversationhasuser(conv, this.conversationid, this.userid)) {
      this.resolve([]);
      return;
    }
    if (lib.isNumber(this.oldestmessageid)) {
      oldestind = conv.mids.indexOf(this.oldestmessageid);
      if (oldestind>=0) {
        oldestind++;
      }
    }
    if (!lib.isNumber(oldestind)) {
      oldestind = conv.mids.length;
    }
    fetchstartind = oldestind-this.howmany;
    if (fetchstartind<0) {
      fetchstartind=0;
    }
    this.reachedthetop = (fetchstartind === 0);
    //console.log('fetching from', conv.mids.length, 'convs, start with', fetchstartind, 'to', oldestind, 'total', this.howmany);
    //console.log('fetching mids', conv.mids[fetchstartind], 'to', conv.mids[oldestind-1]);
    qlib.promise2defer(
      q.all(
        conv.mids.slice(fetchstartind, oldestind)
          .map(this.askForMessage.bind(this, !!conv.afu))
      ),
      this
    );
  };
  MessagesOfConversationJob.prototype.askForMessage = function (isgroup, mid, midindex) {
    var ret = (new this.destroyable.Jobs.FindMessageJob(this.destroyable, mid)).go().then(
      utilslib.msguserandmidder.bind(null, isgroup, this.userid, mid)
    ).then(
      this.onMessageFetchedForPossibleFirstMark.bind(this, midindex)
    );
    midindex = null;
    isgroup = null;
    return ret;
  };
  MessagesOfConversationJob.prototype.onMessageFetchedForPossibleFirstMark = function (midindex, msg) {
    if (midindex === 0 && this.reachedthetop) {
      msg.oldest = true;
    }
    return msg;
  };

  mylib.MessagesOfConversationJob = MessagesOfConversationJob;
}

module.exports = createMessagesOfConversationJob;
