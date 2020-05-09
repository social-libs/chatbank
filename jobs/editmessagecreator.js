function createEditMessageJob (lib, mylib, utils) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function EditMessageJob (bank, userid, conversationid, messageid, editedMessage, defer) {
    JobOnBank.call(this, bank);
    this.userid = userid;
    this.conversationid = conversationid;
    this.messageid = messageid;
    this.editedMessage = editedMessage;
    this.conversation = null;
    this.message = null;
  }
  lib.inherit(EditMessageJob, JobOnBank);
  EditMessageJob.prototype.destroy = function () {
    this.message = null;
    this.conversation = null;
    this.editMessageHistory = null;
    this.messageid = null;
    this.conversationid = null;
    this.userid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  EditMessageJob.prototype.go = function () {
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
  EditMessageJob.prototype.onConversation = function (conversation) {
    //try to cover both the peer2peer and peer2group cases
    if (!this.okToProceed()) {
      return;
    }
    if (!conversation) {
      this.reject(new lib.Error('GROUP_DOES_NOT_EXIST', this.conversationid));
      return;
    }
    this.conversation = conversation;
    if (lib.isArray(conversation.afu) && conversation.afu.indexOf(this.userid)<0) {
      this.reject(new lib.Error('SENDER_NOT_MEMBER_OF_GROUP', this.userid));
      return;
    }
    if (lib.isArray(conversation.nr) && !utils.userInNotRead(this.userid, conversation.nr)) {
      this.reject(new lib.Error('SENDER_NOT_MEMBER_OF_GROUP', this.userid));
      return;
    }
    if (!lib.isArray(conversation.mids)) {
      this.reject(new lib.Error('CONVERSATION_HAS_NO_MESSAGES', this.conversationid));
      return;
    }
    if (conversation.mids.indexOf(this.messageid)<0) {
      console.log(conversation.mids, 'have no', this.messageid);
      this.reject(new lib.Error('MESSAGE_NOT_IN_CONVERSATION', this.messageid));
      return;
    }
    (new this.destroyable.Jobs.FindMessageJob(this.destroyable, this.messageid)).go().then(
      this.onMessage.bind(this),
      this.reject.bind(this)
    );
  };
  EditMessageJob.prototype.onMessage = function (msg) {
    //console.log('onMessage', msg)
    var didsomething;
    if (!this.okToProceed()) {
      return;
    }
    if (!msg) {
      this.reject(new lib.Error('MESSAGE_DOES_NOT_EXIST', this.messageid));
      return;
    }
    if (!msg.from) {
      this.reject(new lib.Error('MESSAGE_INVALID_FORMAT', this.messageid));
      return;
    }
    if (msg.from !== this.userid) {
      this.reject(new lib.Error('MESSAGE_CANNOT_EDIT', this.messageid));
      return;
    }
    //TODO add advanced check if edited message is too much different than original (e.g. Discord)
    if (msg.message !== this.editedMessage){
      if (lib.isArray(msg.edits)){
        msg.edits.push([msg.message, msg.created]);
      }else{
        msg.edits = [[msg.message, msg.created]];
      }
      msg.message = this.editedMessage;
      msg.created = Date.now();
      didsomething = true;
    }
    if (didsomething) {
      (new this.destroyable.Jobs.PutMessageJob(this.destroyable, this.messageid, msg)).go().then(
        this.onMessageSaved.bind(this),
        this.reject.bind(this)
      );
      return;
    }
    this.resolve(true);
  };
  EditMessageJob.prototype.onMessageSaved = function (savedmsg) {
    if (!this.okToProceed()) {
      return;
    }
    //this.messageid = savedmsg[0]; //trivial, gotta be
    this.message = savedmsg[1];
    if (
      lib.isArray(this.conversation.mids) &&
      this.conversation.mids.length>0 && 
      this.conversation.mids[this.conversation.mids.length-1] === this.messageid
    ) {
      this.conversation.lastm.message = this.message.message;
      this.conversation.lastm.created = this.message.created;
      //not read (nr) can be handled here as well
      (new this.destroyable.Jobs.PutConversationJob(this.destroyable, this.conversationid, this.conversation)).go().then(
        this.onConversationSaved.bind(this),
        this.reject.bind(this)
      );
      return;
    }
    this.doResolve();
  };
  EditMessageJob.prototype.onConversationSaved = function (savedconv) {
    if (!this.okToProceed()) {
      return;
    }
    this.doResolve();
  };
  EditMessageJob.prototype.doResolve = function () {
    var p2p = !lib.isArray(this.conversation.afu),
      affected = this.conversation.nr.reduce(nruer, []);
    this.destroyable.conversationNotification.fire({
      id: this.conversationid,
      p2p: p2p,
      messageid: this.messageid,
      affected: affected,
      edited: this.message.message,
      moment: this.message.created
    });
    (new this.destroyable.Jobs.OptionalPreviewCreatorJob(this.destroyable, this.conversationid, p2p, affected, this.messageid, this.message.message, this.options)).go();
    this.resolve({id: this.conversationid, messageid: this.messageid, editedMessage: this.editedMessage});
  };

  function nruer (result, nr) {
    result.push(nr.u);
    return result;
  }

  mylib.EditMessageJob = EditMessageJob;
}
module.exports = createEditMessageJob;

