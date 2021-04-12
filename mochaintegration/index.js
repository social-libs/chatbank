var chatBankLib;

require('./utils');
setGlobal('conversationNotificationEvent', new lib.HookCollection);
function onConversationNotification (name, convnotf) {
  //console.log('onConversationNotification', convnotf);
  checkPropertiesOn(convnotf, [/*'id'*/, 'affected'/*, 'lastm'*/]);
  if (convnotf.lastm) {
    checkPropertiesOn(convnotf.lastm, ['from', 'message', 'created']);
  }
  if (convnotf.messageid) {
    if (convnotf.rcvdby) {
      //console.log('Message rcvd notification', require('util').inspect(convnotf, {colors:true, depth:7}));
      checkPropertiesOn(convnotf, ['p2p', 'rcvdby', 'rcvdat', 'rcvdmessage']);
      if (!(lib.isArray(convnotf.affected) && convnotf.affected.length===2)) {
        throw new Error('Message rcvd notification must have "affected" as an Array of 2 userids');
      }
    }
    if (convnotf.seenby) {
      //console.log('Message seen notification', require('util').inspect(convnotf, {colors:true, depth:7}));
      checkPropertiesOn(convnotf, ['p2p', 'seenby', 'seenat', 'nr', 'seenmessage']);
      if (!(lib.isArray(convnotf.affected) && convnotf.affected.length===2)) {
        throw new Error('Message seen notification must have "affected" as an Array of 2 userids');
      }
    }
  }
  setGlobal(name+'_LastConversationNotified', convnotf);
  conversationNotificationEvent.fire(convnotf);
}
function attachToBank (name, bank) {
  bank.conversationNotification.then(null, null, onConversationNotification.bind(null, name));
}
function libCreator () {
  if (chatBankLib) {
    return q(chatBankLib);
  }
  return require('../')(execlib);
}
function bankCreator (name, initiallyemptydb, d, cblib) {
  chatBankLib = cblib;
  new chatBankLib.Bank({
    path: require('path').join(__dirname, name+'.db'),
    initiallyemptydb: initiallyemptydb,
    starteddefer: d
  });
  name = null;
  initiallyemptydb = null;
  d = null;
  cblib = null;
}
function createGlobalBank (name, initiallyemptydb) {
  var d = q.defer();
  libCreator().then(
    bankCreator.bind(null, name, initiallyemptydb, d)
  );
  d.promise.then(attachToBank.bind(null, name));
  return setGlobal(name, d.promise);
}

function ConversationNotificationWaiter (waitobj) {
  qlib.JobBase.call(this)
  this.listener = null;
  this.waitobj = waitobj;
}
lib.inherit(ConversationNotificationWaiter, qlib.JobBase);
ConversationNotificationWaiter.prototype.destroy = function () {
  this.waitobj = null;
  if (this.listener) {
    this.listener.destroy();
  }
  this.listener = null;
  qlib.JobBase.prototype.destroy.call(this);
};
ConversationNotificationWaiter.prototype.go = function () {
  var ret;
  if (!this.defer) {
    return q.reject(new Error('Already dead'));
  }
  ret = this.defer.promise;
  if (this.listener) {
    return ret;
  }
  if (!this.waitobj) {
    this.reject(new Error('No wait obj'));
    return ret;
  }
  this.listener = conversationNotificationEvent.attach(this.onConversationNotification.bind(this));
  return ret;
};
ConversationNotificationWaiter.prototype.onConversationNotification = function (ntf) {
  var found = lib.traverseShallowConditionally(this.waitobj, convntffinder.bind(null, ntf));
  if (found) {
    this.resolve(ntf);
  }
  ntf = null;
};
function convntffinder (ntf, val, path) {
  try {
  var prop = lib.readPropertyFromDotDelimitedString(ntf, path);
  if (prop === val) {
    return true;
  }
  } catch (e) {
    console.error(e);
  }
}

function waitForConversationNotification (waitobj) {
  var job = new ConversationNotificationWaiter(waitobj);
  return job.go();
}

function deInitChatLib () {
  return libCreator().then (
    function (cblib) {
      cblib.deInit();
      return true;
    }
  );
}

setGlobal('createGlobalChatBank', createGlobalBank);
setGlobal('waitForConversationNotification', waitForConversationNotification);
setGlobal('deInitChatLib', deInitChatLib);
require('./flooding.js');
