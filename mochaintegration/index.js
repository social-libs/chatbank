var chatBankLib;

require('./utils');
function onConversationNotification (name, convnotf) {
  //console.log('onConversationNotification', convnotf);
  checkPropertiesOn(convnotf, ['id', 'affected'/*, 'lastmessage'*/]);
  if (convnotf.lastmessage) {
    checkPropertiesOn(convnotf.lastmessage, ['from', 'message', 'created', 'seen']);
  }
  if (convnotf.messageid) {
    if (convnotf.rcvdby) {
      console.log('Message rcvd notification', require('util').inspect(convnotf, {colors:true, depth:7}));
      checkPropertiesOn(convnotf, ['p2p', 'rcvdby', 'rcvdat', 'nr', 'rcvdmessage']);
      if (!(lib.isArray(convnotf.affected) && convnotf.affected.length===2)) {
        throw new Error('Message rcvd notification must have "affected" as an Array of 2 userids');
      }
    }
    if (convnotf.seenby) {
      console.log('Message seen notification', require('util').inspect(convnotf, {colors:true, depth:7}));
      checkPropertiesOn(convnotf, ['p2p', 'seenby', 'seenat', 'nr', 'seenmessage']);
      if (!(lib.isArray(convnotf.affected) && convnotf.affected.length===2)) {
        throw new Error('Message seen notification must have "affected" as an Array of 2 userids');
      }
    }
  }
  setGlobal(name+'_LastConversationNotified', convnotf);
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

setGlobal('createGlobalChatBank', createGlobalBank);
require('./flooding.js');
