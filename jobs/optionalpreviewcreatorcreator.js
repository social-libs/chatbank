function createOptionalPreviewCreator (lib, mylib, msgparsinglib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = mylib.JobOnBank;

  function OptionalPreviewCreatorJob (bank, conversationid, p2p, affected, messageid, message, options, defer) {
    JobOnBank.call(this, bank, defer);
    this.conversationid = conversationid;
    this.p2p = p2p;
    this.affected = affected;
    this.messageid = messageid;
    this.message = message;
    this.options = options;
  }
  lib.inherit(OptionalPreviewCreatorJob, JobOnBank);
  OptionalPreviewCreatorJob.prototype.destroy = function () {
    this.options = null;
    this.message = null;
    this.messageid = null;
    this.affected = null;
    this.p2p = null;
    this.conversationid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  OptionalPreviewCreatorJob.prototype.go = function () {
    var ok = this.okToGo(), parser, previewables;
    if (!ok.ok) {
      return ok.val;
    }
    if (!this.message) {
      this.resolve(false);
      return ok.val;
    }
    if (!(this.options && this.options.preview)) {
      this.resolve(false);
      return ok.val;
    }
    parser = new msgparsinglib.Parser();
    previewables = parser.findPreviewables(this.message);
    if (!(lib.isArray(previewables) && previewables.length>0)) {
      this.resolve(false);
      return ok.val;
    }
    msgparsinglib.createPreviewInParallelProcess(previewables[0]).then(
      this.onOptionalPreview.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  OptionalPreviewCreatorJob.prototype.onOptionalPreview = function (prev) {
    if (!this.okToProceed()) {
      return;
    }
    if (!(prev && prev.url)) {
      this.resolve(false);
      return;
    }
    this.destroyable._internalUpdateMessageWithPreviewJob(this.conversationid, this.p2p, this.affected, this.messageid, prev);   
    this.resolve(true);
  };

  mylib.OptionalPreviewCreatorJob = OptionalPreviewCreatorJob;
}
module.exports = createOptionalPreviewCreator;
