function createUpdateMessageWithPreviewJob (lib, mylib, msgparsinglib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function UpdateMessageWithPreviewJob (bank, conversationid, p2p, affected, messageid, previewobj, defer) {
    JobOnBank.call(this, bank, defer);
    this.conversationid = conversationid;
    this.p2p = p2p;
    this.affected = affected;
    this.messageid = messageid;
    this.previewobj = previewobj;
  }
  lib.inherit(UpdateMessageWithPreviewJob, JobOnBank);
  UpdateMessageWithPreviewJob.prototype.destroy = function () {
    this.previewobj = null;
    this.messageid = null;
    this.affected = null;
    this.p2p = null;
    this.conversationid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  UpdateMessageWithPreviewJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    if (!this.messageid) {
      this.resolve(false);
      return ok.val;
    }
    (new this.destroyable.Jobs.FindMessageJob(this.destroyable, this.messageid)).go().then(
      this.onMessage.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  UpdateMessageWithPreviewJob.prototype.onMessage = function (msg) {
    if (!this.okToProceed()) {
      return;
    }
    if (!this.previewobj && !msg.preview) {
      this.resolve(true);
      return;
    }
    msg.preview = this.previewobj;
    (new this.destroyable.Jobs.PutMessageJob(this.destroyable, this.messageid, msg)).go().then(
      this.onMessageSaved.bind(this),
      this.reject.bind(this)
    );
  };
  UpdateMessageWithPreviewJob.prototype.onMessageSaved = function (savedmsg) {
    if (!this.okToProceed()) {
      return;
    }
    this.destroyable.conversationNotification.fire({
      id: this.conversationid,
      p2p: this.p2p,
      affected: this.affected,
      messageid: this.messageid,
      preview: this.previewobj
    });
    this.resolve(true);
  };

  mylib.UpdateMessageWithPreviewJob = UpdateMessageWithPreviewJob;
}
module.exports = createUpdateMessageWithPreviewJob;
