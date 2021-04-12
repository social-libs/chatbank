function propexistencechecker (thingy, propname) {
  if (!(propname in thingy)) {
    console.error(thingy);
    throw new Error(propname+'does not exist in the object');
  }
}
function checkPropertiesOn (thingy, propnamearry) {
  if (!lib.isVal(thingy)) {
    console.error(thingy);
    throw new Error('Bad Thingy');
  }
  if (!lib.isArray(propnamearry)) {
    throw new Error('Bad property name array');
  }
  propnamearry.forEach(propexistencechecker.bind(null, thingy));
}
function onConversationNotification (convnotf) {
  console.log('onConversationNotification', convnotf);
  checkPropertiesOn(convnotf, ['id', 'affected', 'lastm']);
  if (convnotf.lastm) {
    checkPropertiesOn(convnotf.lastm, ['from', 'message', 'created', 'seen']);
  }
  setGlobal('LastConversationNotified', convnotf);
}
/*
function onMessageNotification (messnotf) {
  console.log('onMessageNotification', messnotf);
  checkPropertiesOn(messnotf, ['conversationid', 'affected', 'message']);
  checkPropertiesOn(messnotf.message, ['from', 'message', 'created', 'seen']);
  setGlobal('LastMessageNotified', messnotf);
}
*/
function bankFromName (bankname) {
  return getGlobal(bankname || 'Bank');
}
function attachToBank (bank) {
  bank.conversationNotification.then(null, null, onConversationNotification);
}
function createBank (name, initiallyemptydb) {
  var d = q.defer();
  new Lib.Bank({
    path: require('path').join(__dirname, name),
    initiallyemptydb: initiallyemptydb,
    starteddefer: d
  })
  d.promise.then(attachToBank);
  return d.promise;
}

var ret = {
  checkPropertiesOn: checkPropertiesOn,
  createBank: createBank,
  bankFromName: bankFromName
};
require('./jobs.js')(ret);
require('./bank.js')(ret);
module.exports = ret;

